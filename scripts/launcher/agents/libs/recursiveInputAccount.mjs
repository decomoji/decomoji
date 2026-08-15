import inquirer from "inquirer";
import { isEmail, isInputs } from "../../../utilities/index.mjs";
import { isSignInFailed } from "./isSignInFailed.mjs";

// 再入力を促す回数の上限
// 入力ミス以外の理由でサインインできないとき、無限に問い続けないようにする
const MAX_ATTEMPTS = 5;

// ログインエラーの時の再帰処理
// エラーはtry-catchせず呼び出し元の .catch() に伝播させる
export const recursiveInputAccount = async (browser, page, inputs, attempt = 1) => {
  // 上限に達したら諦めて呼び出し元にエラーを伝播させる
  if (attempt > MAX_ATTEMPTS) {
    throw new Error(`[ERROR]Failed to sign in. (tried ${MAX_ATTEMPTS} times)`);
  }

  // CAPTCHA が出ていたら再入力させても無駄なので、入力を促す前に諦めて終了する
  if (await page.$("#slack_captcha")) {
    console.error("[ERROR]Oops, you might judged a bot. Please wait and try again.");
    await browser.close();
    process.exit(1);
  }

  // 入力欄が無いのは想定外の画面にいるということなので、呼び出し元にエラーを伝播させる
  const $email = await page.$("#email");
  const $password = await page.$("#password");
  if (!$email || !$password) {
    throw new Error("[ERROR]Could not find the sign in form. Slack might have changed the page.");
  }

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
  // フォームに再入力してサインインする
  await $email.click({ count: 3 });
  await $email.type(inputs.email);
  await $password.click({ count: 3 });
  await $password.type(inputs.password);
  await Promise.all([
    // クリックより先に遷移の待ち受けを張る
    // 遷移しないままエラーが表示されることもあるので、待ち受けの失敗は下の状態チェックに委ねる
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => void 0),
    page.click("#signin_btn"),
  ]);
  // サインイン画面から進めていたらログインできたと見なして再帰処理を抜ける
  if (!(await isSignInFailed(page))) {
    console.info("Login successful!");
    return inputs;
  }
  // ログインできるまで何度でもトライ！
  // ログインできたら再帰の結果をそのまま返す
  return await recursiveInputAccount(browser, page, inputs, attempt + 1);
};
