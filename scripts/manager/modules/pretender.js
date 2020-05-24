const puppeteer = require("puppeteer");

const goToEmojiPage = require("./goToEmojiPage");
const getPretendableDecomojiList = require("./getPretendableDecomojiList");
const postEmojiAlias = require("./postEmojiAlias");

const pretender = async (inputs) => {
  const _pretend = async (inputs) => {
    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({
      devtools: inputs.debug || inputs.browser,
    });
    // ページを追加する
    const page = await browser.newPage();

    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(page, inputs);

    const pretendableDecomojiList = await getPretendableDecomojiList(
      page,
      inputs
    );
    const pretendableDecomojiLength = pretendableDecomojiList.length;
    let i = 0;
    let error = false;
    let ratelimited = false;

    // アップロード可能なものがない場合は終わり
    if (pretendableDecomojiLength === 0) {
      console.info("All alias has already been registered!");
      if (!inputs.debug) {
        await browser.close();
      }
      return;
    }

    (inputs.debug || inputs.time) && console.time("[Register time]");
    while (i < pretendableDecomojiLength) {
      const { name, alias_for } = pretendableDecomojiList[i];
      const currentIdx = i + 1;

      const result = await postEmojiAlias(
        page,
        inputs.workspace,
        name,
        alias_for
      );

      console.info(
        `${currentIdx}/${pretendableDecomojiLength}: ${
          result.ok ? "registered" : result.error
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
    (inputs.debug || inputs.time) && console.timeEnd("[Register time]");

    // ブラウザを閉じる
    if (!inputs.debug) {
      await browser.close();
    }

    // ratelimited なら再帰する
    if (ratelimited) {
      (inputs.debug || inputs.time) && console.timeLog("[Total time]");
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
