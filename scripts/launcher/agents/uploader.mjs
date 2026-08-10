import puppeteer from "puppeteer";
import { curator } from "../handlers/curator.mjs";
import { goToEmojiPage, postEmojiAdd } from "./libs/index.mjs";

export const uploader = async ({ inputs, history }) => {
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
    invoker: "uploader",
  });
  const decomojiListLength = decomojiList.length;

  // 実行結果の箱
  const result = {
    error: [],
    error_name_taken: [],
    error_name_taken_i18n: [],
    ok: [],
  };

  // postEmojiAdd の戻り値によって変える標準出力メッセージの辞書
  const messages = {
    ok: "uploaded",
    error_name_taken: "skipped(already exists)",
    error_name_taken_i18n: "skipped(international emoji set already includes)",
  };

  // 処理すべきデコモジが無い場合、ログイン不要なので早期に返す
  if (decomojiListLength === 0) {
    console.error("[ERROR]No decomoji items.");
    result.error.push({ message: "No decomoji items." });
    return { inputs, result };
  }

  console.info(`\nConnecting...\n`);
  const _upload = async (inputs) => {
    // puppeteer を起動してページインスタンスを作成する
    const browser = await puppeteer.launch({ devtools: DEBUG });
    const page = await browser.newPage();

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(browser, page, inputs);

    // 再入力されているかもしれないので取り直す
    const { twofactor_code: TWOFACTOR_CODE, workspace: WORKSPACE } = inputs;

    console.time("[Installation time]");
    while (i < decomojiListLength) {
      const { name, path } = decomojiList[i];
      // name か path が falsy の時は FAILED フラグを立ててループを抜ける
      if (!name || !path) {
        FAILED = true;
        break;
      }

      // Slack APIにPOSTしてレスポンスを得る
      const res = await postEmojiAdd(page, WORKSPACE, name, path);

      console.info(
        `${i + 1}/${decomojiListLength}: ${
          res.ok
            ? messages.ok
            : res.error === "error_name_taken" || res.error === "error_name_taken_i18n"
              ? messages[res.error]
              : res.error
        } ${name}`,
      );

      // ログファイルに結果を入れる
      res.ok
        ? result.ok.push(name)
        : res.error === "error_name_taken" || res.error === "error_name_taken_i18n"
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
        res.error !== "error_name_taken" && // 登録済みのエラー
        res.error !== "error_name_taken_i18n" // i18n と競合するエラー
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
    console.timeEnd("[Installation time]");

    // ブラウザを閉じる
    if (!DEBUG) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (RELOGIN) {
      console.timeLog("[Total time]");
      console.info(`\nReconnecting...\n`);
      return await _upload(inputs);
    }

    // 追加中に ratelimited にならなかった場合ここまで到達する
    if (FAILED) {
      console.error("[ERROR]Installation is failed.");
    }
    console.info("Installation is completed!");

    // 処理完了。ログイン情報を入力し直したかもしれないので結果と一緒に返す
    return { inputs, result };
  };

  // 再帰処理をスタートする
  return await _upload(inputs);
};
