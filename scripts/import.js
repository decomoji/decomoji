/**
@typedef {"basic" | "extra" | "explicit"} Category;
@typedef {"add" | "alias" | "remove"} Mode;
@typedef {number} UnixTime;

inputs.json もしくは inquirer のレスポンスの型定義
@typedef {{
  team_name: string;
  email: string;
  password: string;
  categories: Category[];
  suffix: boolean;
  custom_suffix: boolean;
  mode: Mode;
}} Inputs;

emoji.adminList が返す配列のアイテムの型定義
@typedef {{
  name: string;
  is_alias: number;
  alias_for: string;
  url: string;
  created: UnixTime;
  team_id: string;
  user_id: string;
  user_display_name: string;
  avatar_hash: string;
  can_delete: boolean;
  is_bad: boolean;
  synonyms: string[];
}} EmojiItem;

emoji.adminList が返すレスポンスの型定義
@typedef {EmojiItem[]} EmojiAdminList;
*/

const fs = require("fs");
const inquirer = require("inquirer");
const puppeteer = require("puppeteer");
const rootPath = require("path").resolve("");

const askInputs = require("./askInputs");
const isEmail = require("./utilities/isEmail");
const isInputs = require("./utilities/isInputs");
const isStringOfNotEmpty = require("./utilities/isStringOfNotEmpty");

// オプションをパースする
const options = {};
((argv) => {
  argv.forEach((v, i) => {
    const opt = v.split("=");
    const key = opt[0].replace("--", "");
    options[key] = opt.length > 1 ? opt[1] : true;
  });
})(process.argv);

/** @param {string}} team_name */
const getEmojiAdminList = async (team_name) => {
  /** @type {EmojiAdminList} */
  let emoji = [];
  // 絵文字を全ページ分取得する
  const _fetch = async (nextPage) => {
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
      await _fetch(data.paging.page + 1);
    } catch (e) {
      return e;
    }
  };
  // 終わるまで再起
  await _fetch();
  // 終わったら全絵文字を返す
  return emoji;
};

/** @param {Category} categories */
const getTargetDecomojiList = async (categories) => {
  let decomojiList = [];
  try {
    categories.forEach((category, i) => {
      fs.readdir(
        `./decomoji/${category}/`,
        (e, files) => {
          if (e) {
            console.log(e)
            if (e.code === "ENOENT") {
              console.log("ENOENT")
              // ディレクトリにファイルがない場合、空の配列を出力させる
              files = [];
            } else {
              throw e;
            }
          }
          console.log(files)
          decomojiList = [...decomojiList, ...files];
        }
      )
    });
  } catch(e) {
    return e;
  }
  return decomojiList;
}

/** @param {Inputs} inputs */
const puppeteerConnect = async (inputs) => {
  /**
   * Puppeteer を起動する
   */
  // puppeteer でブラウザを起動する
  const browser = await puppeteer.launch({ devtools: options.debug });
  // ページを追加する
  const page = await browser.newPage();


  // ログイン画面に遷移する（チームのカスタム絵文字管理画面へのリダイレクトパラメータ付き）
  await page.goto(`https://${inputs.team_name}.slack.com/?redir=%2Fcustomize%2Femoji#/`, {
    waitUntil: "domcontentloaded",
  });
  // ログイン画面に遷移できたかをチェックする
  if (await page.$("#signin_form").then((res) => !res)) {
    // おそらくチームが存在しない場合なので inquirer を起動して team_name を再入力させる
    const _retry = async (tried_team_name) => {
      try {
        const retry = await inquirer.prompt({
          type: "input",
          name: "team_name",
          message: `${tried_team_name} is not found. Please try again.`,
          validate: isInputs,
        });
        // ログイン画面に再び遷移する
        await page.goto(`https://${retry.team_name}.slack.com/?redir=%2Fcustomize%2Femoji#/`, {
          waitUntil: "domcontentloaded",
        });
        // ログイン画面に遷移できたかを再びチェックし、できていたら再起を抜ける
        if (await page.$("#signin_form").then((res) => !!res)) {
          return;
        }
        // ログインページに到達できるまで何度でもトライ！
        await _retry(retry.team_name);
      } catch (e) {
        return e;
      }
    }
    // 再起をスタートする
    await _retry(inputs.team_name)
  }
  // ログイン email を入力する
  await page.type("#email", inputs.email);
  // パスワードを入力する
  await page.type("#password", inputs.password);
  // 「サインイン」する
  await Promise.all([
    page.click("#signin_btn"),
    page.waitForNavigation({ waitUntil: "networkidle0" }),
  ]);
  // ログインエラーになっているかをチェックする
  if (await page.$(".alert_error").then((res) => !!res)) {
    // ログインエラーなら inquirer を起動して email と password を再入力させる
    const _retry = async (tried) => {
      // 前の入力を空にしておく
      await page.evaluate(() => document.querySelector("#email").value = "");
      await page.evaluate(() => document.querySelector("#password").value = "");
      try {
        const retry = await inquirer.prompt([
          {
            type: "input",
            name: "email",
            message: `Enter login email again.`,
            validate: isEmail,
            default: tried.email,
          },
          {
            type: "password",
            name: "password",
            mask: "*",
            message: `Enter a password again.`,
            validate: isInputs,
          }
        ]);
        // Recaptcha があるかをチェックする
        if (await page.$("#slack_captcha").then((res) => !!res)) {
          // Recaptcha があったら無理なので諦める
          console.log("\n\nOops, you might judged a Bot. Please wait and try again.\n\n")
          await browser.close();
        }
        // フォームに再入力して submit する
        await page.type("#email", retry.email);
        await page.type("#password", retry.password);
        await Promise.all([
          page.click("#signin_btn"),
          page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]);
        // #signin_form がなかったらログインできたと見なして再起を抜ける
        if (await page.$("#signin_form").then((res) => !res)) {
          return;
        }
        // ログインできるまで何度でもトライ！
        await _retry(retry);
      } catch (e) {
        return e;
      }
    }
    // 再起をスタートする
    await _retry(inputs)
  }
  // 2FA入力欄があるかをチェックする
  if (await page.$('[name="2fa_code"]').then((res) => !!res)) {
    // 2FA入力欄があれば inquirer を起動して入力させる
    const _auth = async () => {
      // 前の入力を空にしておく
      await page.evaluate(() => document.querySelector('[name="2fa_code"]').value = "");
      try {
        const answer = await inquirer.prompt({
          type: "password",
          name: "2fa",
          mask: "*",
          message: "Enter a 2FA code.",
          validate: isInputs,
        });
        // フォームに入力して submit する
        await page.type('[name="2fa_code"]', answer["2fa"]);
        await Promise.all([
          page.click("#signin_btn"),
          page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]);
        // 2FA入力欄がなかったら2FA認証できたと見なして再起を抜ける
        if (await page.$('[name="2fa_code"]').then((res) => !res)) {
          return;
        }
        // 2FA認証できるまで何度でもトライ！
        await _auth()
      } catch (e) {
        return e;
      }
    }
    // 再起をスタートする
    _auth();
  }

  // カスタム絵文字セクションが見つかるまで待つ
  await page.waitForSelector("#list_emoji_section", { timeout: 180000 });

  /**
   * /customize/emoji に遷移後の処理
   *  - 登録済みカスタム絵文字を取得する（emojiAdminList）
   *  - 登録するデコモジを取得する（decomojiList）
   *    - v4 ではカテゴリのディレクトリ内を全てさらうなどの実装をするが、v5 では全てのデコモジが入ったディレクトリから json を元に特定ファイルだけ抽出する実装に変える
   *    - これにより、自分で登録するデコモジをカスタマイズできる。カスタマイズの支援は decomoji-finder に搭載する
   *    - 別ディレクトリを指定して抽出するオプションも備えたい
   *  - デコモジを1つずつPostする
   *    - emojiAdminList にファイルがあったら override するか？ emoji.remove したりなんなりが必要だ…
   */
  // 登録済みのカスタム絵文字リストを取得
  // const emojiAdminList = await page.evaluate(getEmojiAdminList, inputs.team_name);
  // console.log(emojiAdminList)
  // console.log(emojiAdminList.length)

  const decomojiList = await getTargetDecomojiList(inputs.categories);
  console.log(decomojiList)
  console.log(decomojiList.length)
  
  // 処理が終わったらブラウザを閉じる
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