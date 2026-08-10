import puppeteer from "puppeteer";
import { curator } from "./curator.mjs";
import { goToEmojiPage } from "./goToEmojiPage.mjs";
import { postEmojiRemove } from "./postEmojiRemove.mjs";
import { outputResultJson } from "../../utilities/outputResultJson.mjs";

export const remover = async ({ inputs, history }) => {
  const { mode, includeNsfw, debug: DEBUG } = inputs;
  const { initial_run, version } = history;

  // 再帰でリストの続きから処理するためにインデックスを再帰関数の外に定義する
  let i = 0;
  let FAILED = false;
  let RELOGIN = false;

  // 処理すべきデコモジリストを得る
  const decomojiList = await curator({
    initial_run,
    version,
    mode,
    includeNsfw,
  });
  const decomojiListLength = decomojiList.length;

  // 実行結果の箱
  const result = {
    error: [],
    emoji_not_found: [],
    ok: [],
  };

  // postEmojiRemove の戻り値によって変える標準出力メッセージの辞書
  const messages = {
    ok: "removed",
    emoji_not_found: "skipped(emoji_not_found)",
  };

  // 処理すべきデコモジが無い場合、ログイン不要なので早期に返す
  if (decomojiListLength === 0) {
    console.error("[ERROR]No decomoji items.");
    result.error.push({ message: "No decomoji items." });
    return { inputs, result };
  }

  console.info(`\nConnecting...\n`);
  const _remove = async (inputs) => {
    // puppeteer を起動してページインスタンスを作成する
    const browser = await puppeteer.launch({ devtools: DEBUG });
    const page = await browser.newPage();

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(browser, page, inputs);

    // 再入力されているかもしれないので取り直す
    const { twofactor_code: TWOFACTOR_CODE, workspace: WORKSPACE } = inputs;

    console.time("[Deletion time]");
    while (i < decomojiListLength) {
      const { name } = decomojiList[i];
      // name が falsy の時は FAILED フラグを立ててループを抜ける
      if (!name) {
        FAILED = true;
        break;
      }

      // Slack APIにPOSTしてレスポンスを得る
      const res = await postEmojiRemove(page, WORKSPACE, name);

      console.info(
        `${i + 1}/${decomojiListLength}: ${
          res.ok ? messages.ok : res.error === "emoji_not_found" ? messages[res.error] : res.error
        } ${name}`,
      );

      // ログファイルに結果を入れる
      res.ok
        ? result.ok.push(name)
        : res.error === "emoji_not_found"
          ? result[res.error].push(name)
          : res.error === "ratelimited" // ratelimited エラーの場合はログに残さない
            ? void 0
            : result.error.push({ name, message: res.error });

      // ratelimited エラーの場合
      if (res.error === "ratelimited") {
        // 2FA 利用しているならば 3秒待って同じ i でループを再開する
        if (TWOFACTOR_CODE) {
          console.info("Waiting...");
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
        // 2FA 利用でなければ再ログインのためのフラグを立ててループを終了する
        RELOGIN = true;
        break;
      }

      // 特定のエラー以外は失敗フラグを立てる
      if (
        res.error &&
        res.error !== "emoji_not_found" // 削除する対象が見つからないエラー
      ) {
        FAILED = true;
        break;
      }

      // インデックスを進める
      i++;
      // ステータスをリセットする
      FAILED = false;
      RELOGIN = false;
    }
    console.timeEnd("[Deletion time]");

    // ブラウザを閉じる
    if (!DEBUG) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (RELOGIN) {
      console.timeLog("[Total time]");
      console.info(`\nReconnecting...\n`);
      return await _remove(inputs);
    }

    // 削除中に ratelimited にならなかった場合ここまで到達する
    if (FAILED) {
      console.error("[ERROR]Deletion is failed.");
    }
    console.info("Deletion is completed!");
    // await outputResultJson({
    //   data: result,
    //   invoker: "remover",
    //   name: "result",
    // });

    // 処理完了。ログイン情報を入力し直したかもしれないので結果と一緒に返す
    return { inputs, result };
  };

  // 再帰処理をスタートする
  return await _remove(inputs);
};
