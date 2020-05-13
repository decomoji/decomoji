const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getUploadableDecomojiList = require("./getUploadableDecomojiList");
const postEmojiAdd = require("./postEmojiAdd");

const uploader = async (inputs) => {
  const _upload = async (inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({ devtools: inputs.debug });
    // ページを追加する
    const page = await browser.newPage();

    console.log(
      `\nworkspace: https://${inputs.workspace}.slack.com/\n    email: ${inputs.email}\n password: **********\n\nConnecting...\n`
    );

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(page, inputs);

    console.log("Success to login.\nChecking data...\n");
    const uploadableDecomojiList = await getUploadableDecomojiList(
      page,
      inputs
    );
    const uploadableDecomojiLength = uploadableDecomojiList.length;
    let i = 0;
    let ratelimited = false;

    // アップロード可能なものがない場合は終わり
    if (uploadableDecomojiLength === 0) {
      console.log("All decomoji has already been uploaded!");
      if (!inputs.debug) {
        await browser.close();
      }
      return;
    }

    while (i < uploadableDecomojiLength) {
      const { name, path } = uploadableDecomojiList[i];
      const currentIdx = i + 1;

      const result = await postEmojiAdd(page, inputs.workspace, name, path);

      console.log(
        `${currentIdx}/${uploadableDecomojiLength}: ${
          result.ok ? "uploaded" : result.error
        } ${name}.`
      );

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
      await _upload(inputs);
    }

    console.log("completed!");
    return;
  };

  inputs.debug && console.time("[upload time]");
  // 再帰処理をスタートする
  await _upload(inputs);
  inputs.debug && console.timeEnd("[upload time]");
};

module.exports = uploader;
