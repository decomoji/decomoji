import puppeteer from "puppeteer";
import { goToEmojiPage } from "./goToEmojiPage.mjs";
import { getLocalJson } from "./getLocalJson.mjs";
import { postEmojiRemove } from "./postEmojiRemove.mjs";
import { outputLogJson } from "../../utilities/outputLogJson.mjs";
import { outputResultJson } from "../../utilities/outputResultJson.mjs";

export const remover = async (inputs) => {
  const {
    browser: BROWSER,
    configs: CONFIGS,
    debug: DEBUG,
    log: LOG,
    term: TERM,
    time: TIME,
    updateMode: UPDATE,
  } = inputs;

  let i = 0; // 再帰でリストの続きから処理するためにインデックスを再帰関数の外に定義する
  let FAILED = false;
  let RELOGIN = false;
  const localDecomojiList = getLocalJson(
    CONFIGS,
    TERM,
    UPDATE ? ["fixed"] : ["fixed", "upload"],
    "remover",
    LOG
  );
  const localDecomojiListLength = localDecomojiList.length;

  TERM === "version" &&
    LOG &&
    outputLogJson(localDecomojiList, "list", "remover");

  const result = {
    error: [],
    no_permission: [],
    ok: [],
  };
  const messages = {
    ok: "removed",
    no_permission: "skipped(no permission or already removed)",
  };

  const _remove = async (inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({
      devtools: BROWSER || DEBUG,
      headless: BROWSER || DEBUG ? false : "new",
    });
    // ページを追加する
    const page = await browser.newPage();

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(browser, page, inputs);

    // 再入力されているかもしれないので取り直す
    const { twofactor_code: TWOFACTOR_CODE, workspace: WORKSPACE } = inputs;

    // ローカルのデコモジが存在しなかったらエラーにして終了する
    if (localDecomojiListLength === 0) {
      console.error("[ERROR]No decomoji items.");
      !DEBUG && (await browser.close());
      return inputs;
    }

    TIME && console.time("[Remove time]");
    while (i < localDecomojiListLength) {
      const { name } = localDecomojiList[i];
      // name が falsy の時は FAILED フラグを立ててループを抜ける
      if (!name) {
        FAILED = true;
        break;
      }

      const res = await postEmojiRemove(page, WORKSPACE, name);

      console.info(
        `${i + 1}/${localDecomojiListLength}: ${
          res.ok
            ? messages.ok
            : res.error === "no_permission"
            ? messages[res.error]
            : res.error
        } ${name}.`
      );

      // ログファイルに結果を入れる
      res.ok
        ? result.ok.push(name)
        : res.error === "no_permission"
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
        res.error !== "no_permission" // 削除する対象が見つからないエラー
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
    TIME && console.timeEnd("[Remove time]");

    // ブラウザを閉じる
    if (!DEBUG) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (RELOGIN) {
      TIME && console.timeLog("[Total time]");
      console.info("Reconnecting...");
      return await _remove(inputs);
    }

    // 削除中に ratelimited にならなかった場合ここまで到達する
    if (FAILED) {
      console.error("[ERROR]Remove failed.");
    }
    console.info("Remove completed!");
    outputResultJson(result, "result", "remover");
    // 入力し直したかもしれないので返す
    return inputs;
  };

  // 再帰処理をスタートする
  return await _remove(inputs);
};
