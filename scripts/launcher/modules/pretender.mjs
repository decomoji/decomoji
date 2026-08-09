import puppeteer from "puppeteer";
import { curator } from "./curator.mjs";
import { goToEmojiPage } from "./goToEmojiPage.mjs";
import { postEmojiAlias } from "./postEmojiAlias.mjs";
import { outputResultJson } from "../../utilities/outputResultJson.mjs";

/**
 * デコモジリスト分のエイリアス登録処理を行う
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
export const pretender = async ({inputs, results}) => {
  const { debug: DEBUG } = inputs;

  let i = 0; // 再帰でリストの続きから処理するためにインデックスを再帰関数の外に定義する
  let FAILED = false;
  let RELOGIN = false;

  // 処理すべきデコモジリストを得る
  const localDecomojiList = await curator(inputs);
  const localDecomojiListLength = localDecomojiList.length;

  const result = {
    error: [],
    error_invalid_alias: [],
    error_name_taken: [],
    error_name_taken_i18n: [],
    ok: [],
  };
  const messages = {
    ok: "registered",
    error_invalid_alias: "skipped(target no exists)",
    error_name_taken: "skipped(already exists)",
    error_name_taken_i18n: "skipped(international emoji set already includes)",
  };

  // 登録するエイリアスが無いならログインする必要も無いので終了する
  if (localDecomojiListLength === 0) {
    console.info("No decomoji items to alias.");
    return { ...inputs, result };
  }

  const _pretend = async ({ inputs, results }) => {
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

    console.time("[Registration time]");
    while (i < localDecomojiListLength) {
      const { name, alias_for } = localDecomojiList[i];
      // name か alias_for が falsy の時は FAILED フラグを立ててループを抜ける
      if (!name || !alias_for) {
        FAILED = true;
        break;
      }

      const res = await postEmojiAlias(page, WORKSPACE, name, alias_for);

      console.info(
        `${i + 1}/${localDecomojiListLength}: ${
          res.ok
            ? messages.ok
            : res.error === "error_name_taken" ||
                res.error === "error_name_taken_i18n" ||
                res.error === "error_invalid_alias"
              ? messages[res.error]
              : res.error
        } ${name} -> ${alias_for}`,
      );

      // ログファイルに結果を入れる
      res.ok
        ? result.ok.push(name)
        : res.error === "error_name_taken" ||
            res.error === "error_name_taken_i18n" ||
            res.error === "error_invalid_alias"
          ? result[res.error].push({ name, alias_for })
          : res.error === "ratelimited" // ratelimited エラーの場合はログに残さない
            ? void 0
            : result.error.push({ name, alias_for, message: res.error });

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
        res.error !== "error_name_taken_i18n" && // i18n と競合するエラー
        res.error !== "error_invalid_alias" // エイリアスを貼る先が見つからないエラー
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
    console.timeEnd("[Registration time]");

    // ブラウザを閉じる
    if (!DEBUG) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (RELOGIN) {
      console.timeLog("[Total time]");
      console.info("Reconnecting...");
      return await _pretend({ inputs, results });
    }

    // 追加中に ratelimited にならなかった場合ここまで到達する
    if (FAILED) {
      console.error("[ERROR]Registration is failed.");
    }
    console.info("Registration is completed!");
    await outputResultJson({
      data: result,
      invoker: "pretender",
      name: "result",
    });
    // 入力し直したかもしれないので返す
    return { ...inputs, results: { ...results, pretender: result } };
  };

  // 再帰処理をスタートする
  return await _pretend({ inputs, results });
};
