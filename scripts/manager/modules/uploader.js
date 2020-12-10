const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getLocalJson = require("./getLocalJson");
const postEmojiAdd = require("./postEmojiAdd");

const uploader = async (inputs) => {
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

  const _upload = async (inputs) => {
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

    TIME && console.time("[Upload time]");
    while (i < localDecomojiListLength) {
      const { name, path } = localDecomojiList[i];
      const result = await postEmojiAdd(page, WORKSPACE, name, path);

      console.info(
        `${i + 1}/${localDecomojiListLength}: ${
          result.ok
            ? "uploaded"
            : result.error === "error_name_taken"
            ? "skipped(already exists)."
            : result.error === "error_name_taken_i18n"
            ? "skipped(international emoji set already includes)."
            : result.error
        } ${name}.`
      );

      // result が ok 以外でかつ error_name_taken と error_name_taken_i18n 以外のエラーがあればループを抜ける
      if (
        !result.ok &&
        result.error !== "error_name_taken" &&
        result.error !== "error_name_taken_i18n"
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
    TIME && console.timeEnd("[Upload time]");

    // ブラウザを閉じる
    if (!DEBUG) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (RATELIMITED) {
      TIME && console.timeLog("[Total time]");
      console.info("Reconnecting...");
      return await _upload(inputs);
    }

    // 追加中に ratelimited にならなかった場合ここまで到達する
    if (ERROR) {
      console.error("[ERROR]Upload failed.");
    }
    console.info("Upload completed!");
    return;
  };

  // 再帰処理をスタートする
  await _upload(inputs);
};

module.exports = uploader;
