import puppeteer from "puppeteer";
import { curator } from "./curator.mjs";
import { goToEmojiPage } from "./goToEmojiPage.mjs";
import { postEmojiRemove } from "./postEmojiRemove.mjs";
import { outputResultJson } from "../../utilities/outputResultJson.mjs";

/**
 * デコモジリスト分の削除処理を行う
 * @param {
 *   inputs: {
 *     workspace: string;
 *     email: string;
 *     mode: "update" | "uninstall" | "migration" | "compatible_migration";
 *     term: "all";
 *     debug: boolean;
 *   },
 *   results: {
 *     pretender?: {
 *       error: string[],
 *       error_invalid_alias: string[],
 *       error_name_taken: string[],
 *       error_name_taken_i18n: string[],
 *       ok: string[],
 *     },
 *     remover?: {
 *       error: string[],
 *       emoji_not_found: string[],
 *       ok: string[]
 *     },
 *     uploader?: {
 *       error: string[],
 *       error_name_taken: string[],
 *       error_name_taken_i18n: string[],
 *       ok: string[],
 *     },
 *   }
 * }
 */
export const remover = async ({ inputs, results }) => {
  const { debug: DEBUG } = inputs;

  let i = 0; // 再帰でリストの続きから処理するためにインデックスを再帰関数の外に定義する
  let FAILED = false;
  let RELOGIN = false;

  // 処理すべきデコモジリストを得る
  const localDecomojiList = await curator(inputs);
  const localDecomojiListLength = localDecomojiList.length;

  const result = {
    error: [],
    emoji_not_found: [],
    ok: [],
  };
  const messages = {
    ok: "removed",
    emoji_not_found: "skipped(emoji_not_found)",
  };

  // 削除するデコモジが無いならログインする必要も無いので終了する
  if (localDecomojiListLength === 0) {
    console.info("No decomoji items to uninstall.");
    return { ...inputs, result };
  }

  const _remove = async ({ inputs, results }) => {
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

    console.time("[Deletion time]");
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
      console.info("Reconnecting...");
      return await _remove({ inputs, results });
    }

    // 削除中に ratelimited にならなかった場合ここまで到達する
    if (FAILED) {
      console.error("[ERROR]Deletion is failed.");
    }
    console.info("Deletion is completed!");
    await outputResultJson({
      data: result,
      invoker: "remover",
      name: "result",
    });

    // 処理完了。ログイン情報を入力し直したかもしれないので結果と一緒に返す
    return { ...inputs, results: { ...results, remover: result } };
  };

  // 再帰処理をスタートする
  return await _remove({ inputs, results });
};
