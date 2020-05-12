const program = require("commander");
const puppeteer = require("puppeteer");

const isStringOfNotEmpty = require("./utilities/isStringOfNotEmpty");

const askInputs = require("./modules/askInputs");
const getEmojiAdminList = require("./modules/getEmojiAdminList");
const getTargetDecomojiList = require("./modules/getTargetDecomojiList");
const goToEmojiPage = require("./modules/goToEmojiPage");
const importer = require("./modules/importer");

// コマンドライン引数の定義
program
  .option('-d, --debug', 'output extra debugging')
  .option('-i, --inputs', 'input setting json file')
  .parse(process.argv);

// 自動処理を実行する
const main = async (inputs) => {
  // puppeteer でブラウザを起動する
  const browser = await puppeteer.launch({ devtools: program.debug });
  // ページを追加する
  const page = await browser.newPage();

  console.log(
    `\nworkspace: https://${inputs.team_name}.slack.com/\n    email: ${inputs.email}\n password: **********\n\nConnecting...\n`
  );

  // カスタム絵文字管理画面へ遷移する
  inputs = await goToEmojiPage(page, inputs, program);

  // 登録済みのカスタム絵文字リストを取得する
  const emojiAdminList = await page.evaluate(
    getEmojiAdminList,
    inputs.team_name
  );
  program.debug &&
    console.log("emojiAdminList:", emojiAdminList.length, emojiAdminList);

  // 対象デコモジリストを取得する
  const allDecomojiList = await getTargetDecomojiList(inputs.categories);
  program.debug &&
    console.log("allDecomojiList:", allDecomojiList.length, allDecomojiList);

  // emojiAdminList からファイル名だけの配列を作っておく
  const emojiAdminNameList = new Set(emojiAdminList.map((v) => v.name));
  program.debug && console.log("emojiAdminNameList:", emojiAdminNameList);

  // emojiAdminList と allDecomojiList を突合させて処理するアイテムだけのリストを作る
  const targetDecomojiList = allDecomojiList.map((category) =>
    category.filter(
      (candidate) => !emojiAdminNameList.has(candidate.split(".")[0])
    )
  );
  program.debug &&
    console.log(
      "targetDecomojiList:",
      targetDecomojiList.length,
      targetDecomojiList
    );

  // ファイルをアップロードする
  await importer(page, inputs, targetDecomojiList);

  // 処理が終わったらブラウザを閉じる
  if (!program.debug) {
    await browser.close();
  }
};

if (program.inputs) {
  // --inputs=./something.json などと値が指定されていたらそれを require し
  // --inputs キーのみの場合はデフォルトで `./inputs.json` を require する
  main(
    require(isStringOfNotEmpty(program.inputs)
      ? program.inputs
      : "./inputs.json")
  );
} else {
  // inputs がない場合は inquirer を起動して対話的にオプションを作る
  askInputs((inputs) => main(inputs));
}
