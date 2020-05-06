const inquirer = require("inquirer");
const puppeteer = require("puppeteer");

const MESSAGE_NO_VALUE = "Input required.";

const isStringOfNotEmpty = (value) => {
  return (
    Object.prototype.toString.call(value) === "[object String]" &&
    value.length > 0
  );
};

const isInputs = (value) => {
  return Object.prototype.toString.call(value) === "[object String]" &&
    value.length > 0
    ? true
    : MESSAGE_NO_VALUE;
};

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
      await _fetchEmojiAdminList(data.paging.page + 1);
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
  const browser = await puppeteer.launch({ devtools: options.debug });
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
  // 遷移待ち
  await Promise.all([
    page.click("#signin_btn"),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);
  // 2FA入力欄の有無をチェック
  const has2FAInput = await page.$('[name="2fa_code"]').then((res) => !!res);
  // 2FA入力欄があれば入力を求めて inquirer を起動する
  if (has2FAInput) {
    try {
      const two_factor_answer = await inquirer.prompt({
        type: "password",
        name: "2fa",
        mask: "*",
        message: "Enter a 2FA code.",
        validate: isInputs,
      });
      await page.type('[name="2fa_code"]', two_factor_answer["2fa"]);
      // 遷移待ち
      await Promise.all([
        page.click("#signin_btn"),
        page.waitForNavigation({ waitUntil: "networkidle0" }),
      ]);
    } catch (e) {
      return e;
    }
  }
  // カスタム絵文字セクションが見つかるまで待つ
  await page.waitForSelector("#list_emoji_section", { timeout: 180000 });

  // ここから /customize/emoji に遷移後の処理
  const emojiList = await page.evaluate(getEmojiList, inputs.team_name);
  console.log(emojiList);
  console.log(emojiList.length);

  if (!options.debug) {
    await browser.close();
  }
};

if (options.inputs) {
  // --inputs=./something.json などと値が指定されていたらそれを require し
  // --inputs キーのみの場合はデフォルトで `./inputs.json` を require する
  puppeteerConnect(
    require(isStringOfNotEmpty(options.inputs)
      ? options.inputs
      : "./inputs.json")
  );
} else {
  askInputs((inputs) => puppeteerConnect(inputs));
}
