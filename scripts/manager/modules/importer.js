const puppeteer = require("puppeteer");

const getEmojiAdminList = require("./getEmojiAdminList");
const getTargetDecomojiList = require("./getTargetDecomojiList");
const goToEmojiPage = require("./goToEmojiPage");
const injectUploadForm = require("./injectUploadForm");
const postEmojiAdd = require("./postEmojiAdd");

const importer = async (inputs) => {

  const _import = async (inputs) => {

    // puppeteer でブラウザを起動する
    const browser = await puppeteer.launch({ devtools: inputs.debug });
    // ページを追加する
    const page = await browser.newPage();
  
    console.log(
      `\nworkspace: https://${inputs.team_name}.slack.com/\n    email: ${inputs.email}\n password: **********\n\nConnecting...\n`
    );
  
    // カスタム絵文字管理画面へ遷移する
    inputs = await goToEmojiPage(page, inputs);

    // 登録済みのカスタム絵文字リストを取得する
    const emojiAdminList = await page.evaluate(
      getEmojiAdminList,
      inputs.team_name
    );
    inputs.debug && inputs.fatlog &&
      console.log("emojiAdminList:", emojiAdminList.length, emojiAdminList);

    // 対象デコモジリストを取得する
    const allDecomojiList = await getTargetDecomojiList(inputs.categories);
    inputs.debug && inputs.fatlog &&
      console.log("allDecomojiList:", allDecomojiList.length, allDecomojiList);

    // emojiAdminList と allDecomojiList を突合させて処理するアイテムだけのリストを作る
    const targetDecomojiList = allDecomojiList.filter((item) => {
      return emojiAdminList.findIndex((v) => v.name === item.name);
    });
    inputs.debug && inputs.fatlog &&
      console.log(
        "targetDecomojiList:",
        targetDecomojiList.length,
        targetDecomojiList
      );

    // ページに form 要素を挿入する
    await page.evaluate(injectUploadForm);

    const targetLength = targetDecomojiList.length;
    let currentCategory = '';
    let i = 0;
    let ratelimited = false;

    while (i < targetLength) {
      const target = targetDecomojiList[i];
      const { category, name, path } = target;
      const currentIdx = i + 1;

      if (currentCategory === '' && currentCategory !== category) {
        console.log(`\n[${category}] category start!`)
        currentCategory = category;
      }

      console.log(`${currentIdx}/${targetLength}: importing ${name}...`);

      const result = await postEmojiAdd(page, inputs.team_name, name, path);

      console.log(`${currentIdx}/${targetLength}: ${ result.ok ? 'imported' : result.error } ${name}.`);

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
  }

  // 再帰処理をスタートする
  await _import(inputs);
};

module.exports = importer;
