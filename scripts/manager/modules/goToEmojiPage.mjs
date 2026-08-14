import { goToSignInPage } from "./goToSignInPage.mjs";
import { recursiveInputWorkspace } from "./recursiveInputWorkspace.mjs";
import { recursiveInputAccount } from "./recursiveInputAccount.mjs";
import { recursiveInput2FA } from "./recursiveInput2FA.mjs";

export const goToEmojiPage = async (browser, page, inputs) => {
  const TIME = inputs.time;

  TIME && console.time("[Login time]");
  // ログイン画面に遷移する（SSOログインが有効なときのフォールバックも含む）
  await goToSignInPage(page, inputs.workspace);

  // ログインフォームが見つからない場合、チームが存在しないと判断して workspace を再入力させる
  if (!(await page.$("#signin_form"))) {
    inputs = await recursiveInputWorkspace(page, inputs).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  }

  // CAPTCHA が出ていたら諦めて終了する
  if (await page.$("#slack_captcha")) {
    console.error("[ERROR]Oops, you might judged a bot. Please wait and try again.");
    await browser.close();
    process.exit(1);
  }

  // email とパスワードを入力してサインインする
  await page.type("#email", inputs.email);
  await page.type("#password", inputs.password);
  await Promise.all([
    page.click("#signin_btn"),
    page.waitForNavigation({
      waitUntil: ["load", "networkidle2"],
      timeout: 60000,
    }),
  ]);

  // ログインエラーになっていたら email と password を再入力させる
  if (await page.$(".c-input_text--with_error")) {
    inputs = await recursiveInputAccount(browser, page, inputs).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  }

  // 2FA入力欄があったら入力させる
  if (await page.$('[name="2fa_code"]')) {
    inputs = await recursiveInput2FA(browser, page, inputs).catch((error) => {
      console.error(error);
      process.exit(1);
    });
  }
  // ページ遷移とカスタム絵文字セクションが見つかるまで待つ
  await page.waitForSelector("#list_emoji_section");

  TIME && console.timeEnd("[Login time]");

  // workspace が変更されている可能性があるので返しておく
  return inputs;
};
