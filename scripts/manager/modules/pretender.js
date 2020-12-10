const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getLocalJson = require("./getLocalJson");
const postEmojiAlias = require("./postEmojiAlias");

const pretender = async (inputs) => {
  // 再帰でリストの続きから処理するためにインデックスを再帰関数の外に定義する
  let i = 0;
  const localDecomojiList = getLocalJson(inputs.configs, inputs.log);
  const localDecomojiListLength = localDecomojiList.length;

  const _pretend = async (inputs) => {
    const TIME = inputs.time;

    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({
      devtools: inputs.browser,
    });
    // ページを追加する
    const page = await browser.newPage();

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(page, inputs);

    let error = false;
    let ratelimited = false;

    // アップロード可能なものがない場合は終わり
    if (localDecomojiListLength === 0) {
      console.info("All alias has already been registered!");
      if (!inputs.debug) {
        await browser.close();
      }
      return;
    }

    TIME && console.time("[Register time]");
    while (i < localDecomojiListLength) {
      const { name, alias_for } = localDecomojiList[i];
      const currentIdx = i + 1;

      const result = await postEmojiAlias(
        page,
        inputs.workspace,
        name,
        alias_for
      );

      console.info(
        `${currentIdx}/${localDecomojiListLength}: ${
          result.ok
            ? "registered"
            : result.error === "error_name_taken"
            ? "skipped(already exists)."
            : result.error === "error_name_taken_i18n"
            ? "skipped(international emoji set already includes)."
            : result.error === "error_invalid_alias"
            ? "skipped(target no exists)."
            : result.error
        } ${name} -> ${alias_for}.`
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
          if (inputs.twofactor_code) {
            console.info("Waiting...");
            await page.waitFor(3000);
            continue;
          }
          ratelimited = true;
        } else {
          error = true;
        }
        break;
      }

      // インデックスを進める
      error = false;
      ratelimited = false;
      i++;
    }
    TIME && console.timeEnd("[Register time]");

    // ブラウザを閉じる
    if (!inputs.debug) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (ratelimited) {
      TIME && console.timeLog("[Total time]");
      console.info("Reconnecting...");
      return await _pretend(inputs);
    }

    // 追加中に ratelimited にならなかった場合ここまで到達する
    if (error) {
      console.error("[ERROR]Register failed.");
    } else {
      console.info("Register completed!");
    }
    return;
  };

  // 再帰処理をスタートする
  await _pretend(inputs);
};

module.exports = pretender;
