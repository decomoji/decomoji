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

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(page, inputs);

    const uploadableDecomojiList = await getUploadableDecomojiList(
      page,
      inputs
    );
    const uploadableDecomojiLength = uploadableDecomojiList.length;
    let i = 0;
    let error = false;
    let ratelimited = false;

    // アップロード可能なものがない場合は終わり
    if (uploadableDecomojiLength === 0) {
      console.log("\nAll decomoji has already been uploaded!");
      if (!inputs.debug) {
        await browser.close();
      }
      return;
    }

    console.log("");
    inputs.debug && console.time("[upload time]");
    while (i < uploadableDecomojiLength) {
      const { name, path } = uploadableDecomojiList[i];
      const currentIdx = i + 1;

      const result = await postEmojiAdd(page, inputs.workspace, name, path);

      console.log(
        `${currentIdx}/${uploadableDecomojiLength}: ${
          result.ok ? "uploaded" : result.error
        } ${name}.`
      );

      // エラーがあればループを抜ける
      if (result.error) {
        error = true;
        // ratelimited の場合、2FAを利用しているなら3秒待って再開、そうでなければ再ログインのためのフラグを立てる
        if (result.error === "ratelimited") {
          if (inputs.twofactor_code) {
            console.log("Waiting...");
            await page.waitFor(3000);
            continue;
          }
          ratelimited = true;
        }
        break;
      }

      // インデックスを進める
      error = false;
      ratelimited = false;
      i++;
    }
    inputs.debug && console.timeEnd("[upload time]");

    // ブラウザを閉じる
    if (!inputs.debug) {
      await browser.close();
    }

    // ratelimited でループを抜けていたらもう一度ログイン
    if (ratelimited) {
      await _upload(inputs);
    }

    if (error) {
      console.log("\n[ERROR]Upload failed.");
    } else {
      console.log("\nUpload completed!");
    }
    return;
  };

  // 再帰処理をスタートする
  await _upload(inputs);
};

module.exports = uploader;
