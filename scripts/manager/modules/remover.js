const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getRemovableDecomojiList = require("./getRemovableDecomojiList");
const postEmojiRemove = require("./postEmojiRemove");

const remover = async (inputs) => {
  const _import = async (inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({ devtools: inputs.debug });
    // ページを追加する
    const page = await browser.newPage();

    console.log(
      `\nworkspace: https://${inputs.workspace}.slack.com/\n    email: ${inputs.email}\n password: **********\n\nConnecting...\n`
    );

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(page, inputs);

    const removableDecomojiList = await getRemovableDecomojiList(page, inputs);
    const removableDecomojiLength = removableDecomojiList.length;
    let currentCategory = "";
    let i = 0;
    let ratelimited = false;

    // 削除可能なものがない場合は終わり
    if (removableDecomojiLength === 0) {
      console.log("All decomoji has already been removed!");
      if (!inputs.debug) {
        await browser.close();
      }
      return;
    }

    while (i < removableDecomojiLength) {
      const { category, name } = removableDecomojiList[i];
      const currentIdx = i + 1;

      if (currentCategory === "" && currentCategory !== category) {
        console.log(`\n[${category}] category start!`);
        currentCategory = category;
      }

      console.log(
        `${currentIdx}/${removableDecomojiLength}: removing ${name}...`
      );

      const result = await postEmojiRemove(page, inputs.workspace, name);

      console.log(
        `${currentIdx}/${removableDecomojiLength}: ${
          result.ok ? "removed" : result.error
        } ${name}.`
      );

      // ratelimited が返ってきていたら、インデックスをインクリメントせず3秒待ってもう一度実行する
      if (result.error === "ratelimited") {
        ratelimited = true;
        break;
      }
      // インデックスを進める
      i++;
    }

    // ブラウザを閉じる
    if (!inputs.debug) {
      await browser.close();
    }

    // ratelimited でループを抜けていたらもう一度ログイン
    if (ratelimited) {
      await _import(inputs);
    }

    return;
  };

  // 再帰処理をスタートする
  await _import(inputs);
};

module.exports = remover;
