const puppeteer = require("puppeteer");

const getEmojiAdminList = require("./getEmojiAdminList");
const getTargetDecomojiList = require("./getTargetDecomojiList");
const goToEmojiPage = require("./goToEmojiPage");
const injectUploadForm = require("./injectUploadForm");
const postEmojiAdd = require("./postEmojiAdd");

const importer = async (inputs) => {

  const _import = async(inputs) => {
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

    // emojiAdminList からファイル名だけの配列を作っておく
    const emojiAdminNameList = new Set(emojiAdminList.map((v) => v.name));
    inputs.debug && inputs.fatlog && console.log("emojiAdminNameList:", emojiAdminNameList); 

    // emojiAdminList と allDecomojiList を突合させて処理するアイテムだけのリストを作る
    const targetDecomojiList = allDecomojiList.map((category) =>
      category.filter(
        (candidate) => !emojiAdminNameList.has(candidate.split(".")[0])
      )
    );
    inputs.debug && inputs.fatlog &&
      console.log(
        "targetDecomojiList:",
        targetDecomojiList.length,
        targetDecomojiList
      );

    // ページに form 要素を挿入する
    await page.evaluate(injectUploadForm);

    let ratelimited = false;
    for(let i=0; i<targetDecomojiList.length; i++) {
      const targetAsCategory = targetDecomojiList[i];
      const amountAsCategory = targetAsCategory.length;
      const targetCategoryName = inputs.categories[i];
  
      console.log(`\n[${targetCategoryName}] category start!`)
  
      let j = 0;
      while(j < amountAsCategory) {
        const item = targetAsCategory[j];
        const targetBasename = item.split(".")[0];
    
        console.log(`${j + 1}/${amountAsCategory}: importing ${targetBasename}...`);
    
        const result = await postEmojiAdd(page, inputs.team_name, targetCategoryName, targetBasename, item);
    
        if (!result.ok) {
          console.log(`${j + 1}/${amountAsCategory}: ${result.error} ${targetBasename}.`);
          // ratelimited が返ってきたらループを終了する
          if (result.error === "ratelimited") {
            ratelimited = true;
            break;
          }
        }
        // インデックスを進める
        j++;
      }
      // ratelimited ならループを終了する
      if (ratelimited) {
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
    return;
  };

  // 再帰処理をスタートする
  await _import(inputs);
};

module.exports = importer;
