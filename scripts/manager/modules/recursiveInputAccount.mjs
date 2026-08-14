import inquirer from "inquirer";
import { isEmail } from "../../utilities/isEmail.mjs";
import { isInputs } from "../../utilities/isInputs.mjs";

// ログインエラーの時の再帰処理
// エラーはtry-catchせず呼び出し元の .catch() に伝播させる
export const recursiveInputAccount = async (browser, page, inputs) => {
  // ログイン試行
  const { email, password } = await inquirer.prompt([
    {
      type: "input",
      name: "email",
      message: "ログインに失敗しました。正しいメールアドレスを入力してください:",
      validate: isEmail,
      default: inputs.email,
    },
    {
      type: "password",
      name: "password",
      mask: "*",
      message: "正しいパスワードを入力してください:",
      validate: isInputs,
    },
  ]);
  // email と password を保存し直す
  inputs.email = email;
  inputs.password = password;
  // CAPTCHA が出ていたら諦めて終了する
  if (await page.$("#slack_captcha")) {
    console.error("[ERROR]Oops, you might judged a bot. Please wait and try again.");
    await browser.close();
    process.exit(1);
  }
  // フォームに再入力してサインインする
  const $email = await page.$("#email");
  await $email.click({ clickCount: 3 });
  await $email.type(inputs.email);
  const $password = await page.$("#password");
  await $password.click({ clickCount: 3 });
  await $password.type(inputs.password);
  await Promise.all([
    page.click("#signin_btn"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);
  // #signin_form がなかったらログインできたと見なして再帰処理を抜ける
  if (!(await page.$("#signin_form"))) {
    console.info("Login successful!");
    return inputs;
  }
  // ログインできるまで何度でもトライ！
  // ログインできたら再帰の結果をそのまま返す
  return await recursiveInputAccount(browser, page, inputs);
};
