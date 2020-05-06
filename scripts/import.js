const inquirer = require("./inquirer");
const puppeteer = require("puppeteer");

// オプションをパースする
const options = {};
((argv) => {
  argv.forEach((v, i) => {
    const opt = v.split("=");
    const key = opt[0].replace("--", "");
    options[key] = opt.length > 1 ? opt[1] : true;
  });
})(process.argv);

const getEmojiList = async (team_name) => {
  let emoji = [];
  // 絵文字を全ページ分取得する
  const _fetchEmojiAdminList = async (nextPage) => {
    const param = {
      page: nextPage || 1,
      count: 100,
      token: window.boot_data.api_token,
    };
    try {
      const response = await fetch(
        `https://${team_name}.slack.com/api/emoji.adminList`,
        {
          method: "POST",
          headers: { Accept: "application/json" },
          body: Object.keys(param).reduce(
            (o, key) => (o.set(key, param[key]), o),
            new FormData()
          ),
        }
      );
      const data = await response.json();
      emoji.push(...data.emoji);
      if (data.paging.page === data.paging.pages) {
        return;
      }
      await _fetchEmojiAdminList(data.paging.page+1);
    } catch (e) {
      return e;
    }
  };
  // 終わるまで再起
  await _fetchEmojiAdminList();
  // 終わったら全絵文字を返す
  return emoji;
};

const puppeteerConnect = async (inputs) => {
  // puppeteer でブラウザを起動する
  const browser = await puppeteer.launch(
    options.debug ? { devtools: true } : {}
  );
  // ページを追加する
  const page = await browser.newPage();
  // カスタム絵文字画面に遷移する
  await page.goto(`https://${inputs.team_name}.slack.com/customize/emoji`, {
    waitUntil: "domcontentloaded",
  });
  // ログイン email を入力する
  await page.type("#email", inputs.email);
  // パスワードを入力する
  await page.type("#password", inputs.password);
  // 「サインイン」する
  await page.click("#signin_btn");
  // カスタム絵文字検索フィールドが見つかるまで待つ
  await page.waitFor("#customize_emoji_wrapper_search", { timeout: 180000 });
  // スクリーンショットを保存する
  // await page.screenshot({ path: "screenshot.png" });

  // ここから /customize/emoji に遷移後の処理
  const emojiList = await page.evaluate(getEmojiList, inputs.team_name);
  console.log(emojiList);
  console.log(emojiList.length);

  if (!options.debug) {
    await browser.close();
  }
};

if (options.inputs) {
  puppeteerConnect(require(options.inputs));
} else {
  inquirer((answers) => puppeteerConnect(answers));
}
