const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getUploadableDecomojiList = require("./getUploadableDecomojiList");
const postEmojiAdd = require("./postEmojiAdd");

const uploader = async (inputs) => {
  const _upload = async (inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({
      devtools: inputs.debug || inputs.browser,
    });
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
      console.info("All decomoji has already been uploaded!");
      if (!inputs.debug) {
        await browser.close();
      }
      return;
    }

    (inputs.debug || inputs.time) && console.time("[Upload time]");
    while (i < uploadableDecomojiLength) {
      const { name, path } = uploadableDecomojiList[i];
      const currentIdx = i + 1;

      const result = await postEmojiAdd(page, inputs.workspace, name, path);

      console.info(
        `${currentIdx}/${uploadableDecomojiLength}: ${
          result.ok ? "uploaded" : result.error
        } ${name}.`
      );

      // エラーがあればループを抜ける
      if (result.error) {
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
    (inputs.debug || inputs.time) && console.timeEnd("[Upload time]");

    // ブラウザを閉じる
    if (!inputs.debug) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (ratelimited) {
      return await _upload(inputs);
    }

    // 追加中に ratelimited にならなかった場合ここまで到達する
    if (error) {
      console.error("[ERROR]Upload failed.");
    } else {
      console.info("Upload completed!");
    }
    return;
  };

  // 再帰処理をスタートする
  await _upload(inputs);
};

module.exports = uploader;
