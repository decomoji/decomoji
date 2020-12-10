const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getLocalJson = require("./getLocalJson");
const postEmojiRemove = require("./postEmojiRemove");

const remover = async (inputs) => {
  // 再帰でリストの続きから処理するためにインデックスを再帰関数の外に定義する
  let i = 0;
  const localDecomojiList = getLocalJson(inputs.configs, inputs.log);
  const localDecomojiListLength = localDecomojiList.length;

  const _remove = async (inputs) => {
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

    // 削除可能なものがない場合は終わり
    if (localDecomojiListLength === 0) {
      console.info("All decomoji has already been removed!");
      if (!inputs.debug) {
        await browser.close();
      }
      return;
    }

    TIME && console.time("[Remove time]");
    while (i < localDecomojiListLength) {
      const { name } = localDecomojiList[i];
      const currentIdx = i + 1;

      const result = await postEmojiRemove(page, inputs.workspace, name);

      console.info(
        `${currentIdx}/${localDecomojiListLength}: ${
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
    TIME && console.timeEnd("[Remove time]");

    // ブラウザを閉じる
    if (!inputs.debug) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (ratelimited) {
      TIME && console.timeLog("[Total time]");
      console.info("Reconnecting...");
      return await _remove(inputs);
    }

    // 削除中に ratelimited にならなかった場合ここまで到達する
    if (error) {
      console.error("[ERROR]Remove failed.");
    } else {
      console.info("Remove completed!");
    }
    return;
  };

  // 再帰処理をスタートする
  await _remove(inputs);
};

module.exports = remover;
