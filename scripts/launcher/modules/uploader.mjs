import puppeteer from "puppeteer";
import { curator } from "./curator.mjs";
import { goToEmojiPage } from "./goToEmojiPage.mjs";
import { postEmojiAdd } from "./postEmojiAdd.mjs";
import { outputResultJson } from "../../utilities/outputResultJson.mjs";

// TODO: 実行結果を logs/history.json に残す
// 実行日、実行時のデコモジ自体のバージョン、処理した mode、エラーになったもの（ファイル名被り、ファイル名違反、通信不良）
// TODO: 同じ名前のデコモジが既にあったら、権限があれば削除してから追加する soft-override オプションを検討する
export const uploader = async (inputs) => {
  const { debug: DEBUG } = inputs;

  let i = 0; // 再帰でリストの続きから処理するためにインデックスを再帰関数の外に定義する
  let FAILED = false;
  let RELOGIN = false;

  // 処理すべきデコモジリストを得る
  const localDecomojiList = await curator(inputs);
  const localDecomojiListLength = localDecomojiList.length;

  const result = {
    error: [],
    error_name_taken: [],
    error_name_taken_i18n: [],
    ok: [],
  };
  const messages = {
    ok: "uploaded",
    error_name_taken: "skipped(already exists)",
    error_name_taken_i18n: "skipped(international emoji set already includes)",
  };

  // 追加するデコモジが無いならログインする必要も無いので終了する
  if (localDecomojiListLength === 0) {
    console.info("No decomoji items to install.");
    return { ...inputs, result };
  }

  const _upload = async (inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({
      devtools: DEBUG,
    });
    // ページを追加する
    const page = await browser.newPage();

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(browser, page, inputs);

    // 再入力されているかもしれないので取り直す
    const { twofactor_code: TWOFACTOR_CODE, workspace: WORKSPACE } = inputs;

    console.time("[Installation time]");
    while (i < localDecomojiListLength) {
      const { name, path } = localDecomojiList[i];
      // name か path が falsy の時は FAILED フラグを立ててループを抜ける
      if (!name || !path) {
        FAILED = true;
        break;
      }

      const res = await postEmojiAdd(page, WORKSPACE, name, path);

      console.info(
        `${i + 1}/${localDecomojiListLength}: ${
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
      console.info("Reconnecting...");
      return await _upload(inputs);
    }

    // 追加中に ratelimited にならなかった場合ここまで到達する
    if (FAILED) {
      console.error("[ERROR]Installation is failed.");
    }
    console.info("Installation is completed!");
    await outputResultJson({
      data: result,
      invoker: "uploder",
      name: "result",
    });
    // 入力し直したかもしれないので返す
    return { ...inputs, result };
  };

  // 再帰処理をスタートする
  return await _upload(inputs);
};
