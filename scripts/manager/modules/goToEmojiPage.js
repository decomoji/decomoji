const inquirer = require("inquirer");

const isEmail = require("../../utilities/isEmail");
const isInputs = require("../../utilities/isInputs");
const recursiveInputWorkspace = require("./recursiveInputWorkspace");
const recursiveInputAccount = require("./recursiveInputAccount");
const recursiveInput2FA = require("./recursiveInput2FA");

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

  // 2FA入力欄があったら入力させる
  if (await page.$('[name="2fa_code"]').then((res) => !!res)) {
    inputs = await recursiveInput2FA(browser, page, inputs);
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
