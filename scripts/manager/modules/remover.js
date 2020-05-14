const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getRemovableDecomojiList = require("./getRemovableDecomojiList");
const postEmojiRemove = require("./postEmojiRemove");

const remover = async (inputs) => {
  const _remove = async (inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({ devtools: inputs.debug });
    // ページを追加する
    const page = await browser.newPage();

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(page, inputs);

    const removableDecomojiList = await getRemovableDecomojiList(page, inputs);
    const removableDecomojiLength = removableDecomojiList.length;
    let i = 0;
    let error = false;
    let ratelimited = false;

    // 削除可能なものがない場合は終わり
    if (removableDecomojiLength === 0) {
      console.log("\nAll decomoji has already been removed!");
      if (!inputs.debug) {
        await browser.close();
      }
      return;
    }

    console.log("");
    inputs.debug && console.time("[remove time]");
    while (i < removableDecomojiLength) {
      const { name } = removableDecomojiList[i];
      const currentIdx = i + 1;

      const result = await postEmojiRemove(page, inputs.workspace, name);

      console.log(
        `${currentIdx}/${removableDecomojiLength}: ${
          result.ok ? "removed" : result.error
        } ${name}.`
      );

      // エラーがあればループを抜ける
      if (result.error) {
        // ratelimited の場合、2FAを利用しているなら3秒待って再開、そうでなければ再ログインのためのフラグを立てる
        if (result.error === "ratelimited") {
          if (inputs.twofactor_code) {
            console.log("Waiting...");
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
    inputs.debug && console.timeEnd("[remove time]");

    // ブラウザを閉じる
    if (!inputs.debug) {
      await browser.close();
    }

    // ratelimited でループを抜けていたらもう一度ログイン
    if (ratelimited) {
      await _remove(inputs);
    }

    if (error) {
      console.log("\n[ERROR]Remove failed.");
    } else {
      console.log("\nRemove completed!");
    }
    return;
  };

  // 再帰処理をスタートする
  await _remove(inputs);
};

module.exports = remover;
