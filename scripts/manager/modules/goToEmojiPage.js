const inquirer = require("inquirer");

const isEmail = require("../../utilities/isEmail");
const isInputs = require("../../utilities/isInputs");
const recursiveInputWorkspace = require("./recursiveInputWorkspace");
const recursiveInputAccount = require("./recursiveInputAccount");

const goToEmojiPage = async (browser, page, inputs) => {
  const TIME = inputs.time;

  TIME && console.time("[Login time]");
  // ログイン画面に遷移する（チームのカスタム絵文字管理画面へのリダイレクトパラメータ付き）
  await page.goto(
    `https://${inputs.workspace}.slack.com/?redir=%2Fcustomize%2Femoji#/`,
    {
      waitUntil: "domcontentloaded",
    }
  );

  // チームが存在しない場合、workspace を再入力させる
  if (await page.$("#signin_form").then((res) => !res)) {
    inputs = await recursiveInputWorkspace(page, inputs);
  }
  // Recaptcha があるかをチェックする
  if (await page.$("#slack_captcha").then((res) => !!res)) {
    // Recaptcha があったら無理なので諦める
    console.error(
      "[ERROR]Oops, you might judged a bot. Please wait and try again."
    );
    await browser.close();
  }
  // ログイン email を入力する
  await page.type("#email", inputs.email);
  // パスワードを入力する
  await page.type("#password", inputs.password);
  // 「サインイン」する
  await Promise.all([
    page.click("#signin_btn"),
    page.waitForNavigation({ waitUntil: ["load", "networkidle2"] }),
  ]);

  // ログインエラーになっていたら email と password を再入力させる
  if (await page.$(".c-input_text--with_error").then((res) => !!res)) {
    inputs = await recursiveInputAccount(browser, page, inputs);
  }
  // 2FA入力欄があるかをチェックする
  if (await page.$('[name="2fa_code"]').then((res) => !!res)) {
    // 2FA入力欄があれば inquirer を起動して入力させる
    const _auth = async () => {
      // 前の入力を空にしておく
      await page.$eval('[name="2fa_code"]', (e) => (e.value = ""));
      // 2FA試行
      try {
        const { twofactor_code } = await inquirer.prompt({
          type: "password",
          name: "twofactor_code",
          mask: "*",
          message: "2FA コードを入力してください:",
          validate: isInputs,
        });
        // フォームに入力して submit する
        await page.type('[name="2fa_code"]', twofactor_code);
        await Promise.all([
          page.click("#signin_btn"),
          page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]);
        // 2FA入力欄がなかったら2FA認証できたと見なして再帰処理を抜ける
        if (await page.$('[name="2fa_code"]').then((res) => !res)) {
          console.info("2FA Verified!");
          // 2FA 利用のフラグを立てる
          inputs.twofactor_code = true;
          return;
        }
        // 2FA認証できるまで何度でもトライ！
        await _auth();
      } catch (e) {
        return e;
      }
    };
    // 再帰処理をスタートする
    await _auth();
  }
  // グローバル変数 boot_data と、カスタム絵文字セクションが見つかるまで待つ
  await Promise.all([
    page.waitForXPath("//script[contains(text(), 'boot_data')]"),
    page.waitForSelector("#list_emoji_section"),
  ]);

  TIME && console.timeEnd("[Login time]");

  // workspace が変更されている可能性があるので返しておく
  return inputs;
};

module.exports = goToEmojiPage;
