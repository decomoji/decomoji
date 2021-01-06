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
    term: TERM,
    time: TIME,
  } = inputs;

  let i = 0; // 再帰でリストの続きから処理するためにインデックスを再帰関数の外に定義する
  let FAILED = false;
  let RELOGIN = false;
  const localDecomojiList = getLocalJson(
    CONFIGS,
    TERM,
    ["upload"],
    "uploder",
    LOG
  );
  const localDecomojiListLength = localDecomojiList.length;

  const _upload = async (inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({
      devtools: BROWSER,
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

      // ratelimited エラーの場合
      if (result.error === "ratelimited") {
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
        result.error &&
        result.error !== "error_name_taken" && // 登録済みのエラー
        result.error !== "error_name_taken_i18n" // i18n と競合するエラー
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
    TIME && console.timeEnd("[Upload time]");

    // ブラウザを閉じる
    if (!DEBUG) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (RELOGIN) {
      TIME && console.timeLog("[Total time]");
      console.info("Reconnecting...");
      return await _upload(inputs);
    }

    // 追加中に ratelimited にならなかった場合ここまで到達する
    if (FAILED) {
      console.error("[ERROR]Upload failed.");
    }
    console.info("Upload completed!");
    return;
  };

  // 再帰処理をスタートする
  await _upload(inputs);
};

module.exports = uploader;
