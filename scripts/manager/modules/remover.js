const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getLocalJson = require("./getLocalJson");
const postEmojiRemove = require("./postEmojiRemove");

const remover = async (inputs) => {
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

  const _remove = async (inputs) => {
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

    TIME && console.time("[Remove time]");
    while (i < localDecomojiListLength) {
      const { name } = localDecomojiList[i];
      const result = await postEmojiRemove(page, WORKSPACE, name);

      console.info(
        `${i + 1}/${localDecomojiListLength}: ${
          result.ok
            ? "removed"
            : result.error === "no_permission"
            ? "skipped(no permission or already removed)"
            : result.error
        } ${name}.`
      );

      // result が ok 以外でかつ no_permission 以外のエラーあればループを抜ける
      if (!result.ok && result.error !== "no_permission") {
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
    TIME && console.timeEnd("[Remove time]");

    // ブラウザを閉じる
    if (!DEBUG) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (RATELIMITED) {
      TIME && console.timeLog("[Total time]");
      console.info("Reconnecting...");
      return await _remove(inputs);
    }

    // 削除中に ratelimited にならなかった場合ここまで到達する
    if (ERROR) {
      console.error("[ERROR]Remove failed.");
    }
    console.info("Remove completed!");
    return;
  };

  // 再帰処理をスタートする
  await _remove(inputs);
};

module.exports = remover;
