const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getUploadableDecomojiList = require("./getUploadableDecomojiList");
const postEmojiAdd = require("./postEmojiAdd");

const importer = async (inputs) => {

  const _import = async(inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({ devtools: inputs.debug });
    // ページを追加する
    const page = await browser.newPage();

    console.log(
      `\nworkspace: https://${inputs.workspace}.slack.com/\n    email: ${inputs.email}\n password: **********\n\nConnecting...\n`
    );

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(page, inputs);

<<<<<<< HEAD
    const uploadableDecomojiList = await getUploadableDecomojiList(page, inputs);
    const uploadableDecomojiLength = uploadableDecomojiList.length;
    let currentCategory = '';
=======
    console.log("Success to login.\nChecking data...\n");
    const uploadableDecomojiList = await getUploadableDecomojiList(
      page,
      inputs
    );
    const uploadableDecomojiLength = uploadableDecomojiList.length;
>>>>>>> refactor(manager): ログ出力を変更した
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
      const { name, path } = uploadableDecomojiList[i];
      const currentIdx = i + 1;

      const result = await postEmojiAdd(page, inputs.workspace, name, path);

      console.log(`${currentIdx}/${uploadableDecomojiLength}: ${ result.ok ? 'imported' : result.error } ${name}.`);

      // ratelimited の場合、2FAを利用しているなら3秒待って再開、そうでなければループを抜けて再ログインする
      if (result.error === "ratelimited") {
        if (inputs.twofactor_code) {
          console.log("waiting...");
          await page.waitFor(3000);
          continue;
        }
        ratelimited = true;
        break;
      }
    }

    // ブラウザを閉じる
    if (!inputs.debug) {
      await browser.close();
    }

    // ratelimited でループを抜けていたらもう一度ログイン
    if (ratelimited) {
      await _import(inputs);
    }

    console.log("completed!");
    return;
  };

  inputs.debug && console.time("[import time]");
  // 再帰処理をスタートする
  await _import(inputs);
  inputs.debug && console.timeEnd("[import time]");
};

module.exports = importer;
