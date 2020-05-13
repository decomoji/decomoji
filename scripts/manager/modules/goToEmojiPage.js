const inquirer = require("inquirer");

const isEmail = require("../utilities/isEmail");
const isInputs = require("../utilities/isInputs");

const goToEmojiPage = async (page, inputs) => {
  // ログイン画面に遷移する（チームのカスタム絵文字管理画面へのリダイレクトパラメータ付き）
  await page.goto(
    `https://${inputs.workspace}.slack.com/?redir=%2Fcustomize%2Femoji#/`,
    {
      waitUntil: "domcontentloaded",
    }
  );
  // ログイン画面に遷移できたかをチェックする
  if (await page.$("#signin_form").then((res) => !res)) {
    // おそらくチームが存在しない場合なので inquirer を起動して workspace を再入力させる
    const _retry = async (faildWorkspace) => {
      try {
        const retry = await inquirer.prompt({
          type: "input",
          name: "workspace",
          message: `${faildWorkspace} is not found. Please try again.`,
          validate: isInputs,
        });
        // ログイン画面に再び遷移する
        await page.goto(
          `https://${retry.workspace}.slack.com/?redir=%2Fcustomize%2Femoji#/`,
          {
            waitUntil: "domcontentloaded",
          }
        );
        // ログイン画面に遷移できたかを再びチェックし、できていたら再帰処理を抜ける
        if (await page.$("#signin_form").then((res) => !!res)) {
          // チーム名を保存し直す
          inputs.workspace = retry.workspace;
          return;
        }
        // ログインページに到達できるまで何度でもトライ！
        await _retry(retry.workspace);
      } catch (e) {
        return e;
      }
    };
    // 再帰処理をスタートする
    await _retry(inputs.workspace);
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
      await page.evaluate(() => (document.querySelector("#email").value = ""));
      await page.evaluate(
        () => (document.querySelector("#password").value = "")
      );
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
          },
        ]);
        // Recaptcha があるかをチェックする
        if (await page.$("#slack_captcha").then((res) => !!res)) {
          // Recaptcha があったら無理なので諦める
          console.log(
            "\n\nOops, you might judged a Bot. Please wait and try again.\n\n"
          );
          await browser.close();
        }
        // フォームに再入力して submit する
        await page.type("#email", retry.email);
        await page.type("#password", retry.password);
        await Promise.all([
          page.click("#signin_btn"),
          page.waitForNavigation({ waitUntil: "networkidle0" }),
        ]);
        // #signin_form がなかったらログインできたと見なして再帰処理を抜ける
        if (await page.$("#signin_form").then((res) => !res)) {
          inputs.debug && console.log("success login.");
          return;
        }
        // ログインできるまで何度でもトライ！
        await _retry(retry);
      } catch (e) {
        return e;
      }
    };
    // 再帰処理をスタートする
    await _retry(inputs);
  }
  // 2FA入力欄があるかをチェックする
  if (await page.$('[name="2fa_code"]').then((res) => !!res)) {
    // 2FA入力欄があれば inquirer を起動して入力させる
    const _auth = async () => {
      // 前の入力を空にしておく
      await page.evaluate(
        () => (document.querySelector('[name="2fa_code"]').value = "")
      );
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
        // 2FA入力欄がなかったら2FA認証できたと見なして再帰処理を抜ける
        if (await page.$('[name="2fa_code"]').then((res) => !res)) {
          inputs.debug && console.log("2FA Verified.");
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

  // workspace が変更されている可能性があるので返しておく
  return inputs;
};

module.exports = goToEmojiPage;
