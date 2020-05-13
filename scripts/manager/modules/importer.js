const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getUploadableDecomojiList = require("./getUploadableDecomojiList");
const postEmojiAdd = require("./postEmojiAdd");

const importer = async (inputs) => {
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

    const uploadableDecomojiList = await getUploadableDecomojiList(
      page,
      inputs
    );
    const uploadableDecomojiLength = uploadableDecomojiList.length;
    let currentCategory = "";
    let i = 0;
    let ratelimited = false;

    // アップロード可能なものがない場合は終わり
    if (uploadableDecomojiLength === 0) {
      console.log("All decomoji has already been imported!");
      if (!inputs.debug) {
        await browser.close();
      }
      return;
    }

    while (i < uploadableDecomojiLength) {
      const { category, name, path } = uploadableDecomojiList[i];
      const currentIdx = i + 1;

      if (currentCategory === "" && currentCategory !== category) {
        console.log(`\n[${category}] category start!`);
        currentCategory = category;
      }

      console.log(
        `${currentIdx}/${uploadableDecomojiLength}: importing ${name}...`
      );

      const result = await postEmojiAdd(page, inputs.workspace, name, path);

      console.log(
        `${currentIdx}/${uploadableDecomojiLength}: ${
          result.ok ? "imported" : result.error
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

module.exports = importer;
