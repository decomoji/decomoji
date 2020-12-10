const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getLocalJson = require("./getLocalJson");
const postEmojiAlias = require("./postEmojiAlias");

const pretender = async (inputs) => {
  const {
    browser: BROWSER,
    configs: CONFIGS,
    debug: DEBUG,
    log: LOG,
    time: TIME,
    twofactor_code: TWOFACTOR_CODE,
    workspace: WORKSPACE,
  } = inputs;

  let i = 0; // 再帰でリストの続きから処理するためにインデックスを再帰関数の外に定義する
  let ERROR = false;
  let RATELIMITED = false;
  const localDecomojiList = getLocalJson(CONFIGS, LOG);
  const localDecomojiListLength = localDecomojiList.length;

  const _pretend = async (inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({
      devtools: BROWSER,
    });
    // ページを追加する
    const page = await browser.newPage();

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(page, inputs);

    // ローカルのデコモジが存在しなかったらエラーにして終了する
    if (localDecomojiListLength === 0) {
      console.error("[ERROR]No decomoji items.");
      !DEBUG && (await browser.close());
      return;
    }

    TIME && console.time("[Register time]");
    while (i < localDecomojiListLength) {
      const { name, alias_for } = localDecomojiList[i];
      const result = await postEmojiAlias(page, WORKSPACE, name, alias_for);

      console.info(
        `${i + 1}/${localDecomojiListLength}: ${
          result.ok
            ? "registered"
            : result.error === "error_name_taken"
            ? "skipped(already exists)."
            : result.error === "error_name_taken_i18n"
            ? "skipped(international emoji set already includes)."
            : result.error === "error_invalid_alias"
            ? "skipped(target no exists)."
            : result.error
        } ${name} => ${alias_for}.`
      );

      // result が ok 以外でかつ error_name_taken と error_name_taken_i18n と error_invalid_alias 以外のエラーがあればループを抜ける
      if (
        !result.ok &&
        result.error !== "error_name_taken" &&
        result.error !== "error_name_taken_i18n" &&
        result.error !== "error_invalid_alias"
      ) {
        // ratelimited の場合、2FAを利用しているなら3秒待って再開、そうでなければ再ログインのためのフラグを立てる
        if (result.error === "ratelimited") {
          if (TWOFACTOR_CODE) {
            console.info("Waiting...");
            await page.waitFor(3000);
            continue;
          }
          RATELIMITED = true;
        } else {
          ERROR = true;
        }
        break;
      }

      // インデックスを進める
      i++;
      // ステータスをリセットする
      ERROR = false;
      RATELIMITED = false;
    }
    TIME && console.timeEnd("[Register time]");

    // ブラウザを閉じる
    if (!DEBUG) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (RATELIMITED) {
      TIME && console.timeLog("[Total time]");
      console.info("Reconnecting...");
      return await _pretend(inputs);
    }

    // 追加中に ratelimited にならなかった場合ここまで到達する
    if (ERROR) {
      console.error("[ERROR]Register failed.");
    }
    console.info("Register completed!");
    return;
  };

  // 再帰処理をスタートする
  await _pretend(inputs);
};

module.exports = pretender;
