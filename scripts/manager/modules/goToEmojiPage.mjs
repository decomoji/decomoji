import { goToSignInPage } from "./goToSignInPage.mjs";
import { isSignInFailed } from "./isSignInFailed.mjs";
import { recursiveInputWorkspace } from "./recursiveInputWorkspace.mjs";
import { recursiveInputAccount } from "./recursiveInputAccount.mjs";
import { recursiveInput2FA } from "./recursiveInput2FA.mjs";

// 再帰処理から伝播したエラーを受け取り、ブラウザを閉じてから終了する
const exitWithError = async (browser, error) => {
  console.error(error);
  await browser.close();
  process.exit(1);
};

export const goToEmojiPage = async (browser, page, inputs) => {
  const TIME = inputs.time;

  TIME && console.time("[Login time]");
  // ログイン画面に遷移する（チームのカスタム絵文字管理画面へのリダイレクトパラメータ付き）
  await goToSignInPage(page, inputs.workspace);

  // ログインフォームが見つからない場合、チームが存在しないと判断して workspace を再入力させる
  if (!(await page.$("#signin_form"))) {
    inputs = await recursiveInputWorkspace(page, inputs).catch((error) =>
      exitWithError(browser, error),
    );
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
    // クリックする前に遷移の待ち受けを張る
    // 遷移しないままエラーが表示されることもあるので、待ち受けの失敗は下の状態チェックに委ねる
    page
      .waitForNavigation({
        waitUntil: ["load", "networkidle2"],
        timeout: 60000,
      })
      .catch(() => void 0),
    page.click("#signin_btn"),
  ]);

  // サインイン画面から進めていなかったら email と password を再入力させる
  if (await isSignInFailed(page)) {
    inputs = await recursiveInputAccount(browser, page, inputs).catch((error) =>
      exitWithError(browser, error),
    );
  }

  // 2FA入力欄があったら入力させる
  if (await page.$('[name="2fa_code"]')) {
    inputs = await recursiveInput2FA(browser, page, inputs).catch((error) =>
      exitWithError(browser, error),
    );
  }
  // ページ遷移とカスタム絵文字セクションが見つかるまで待つ
  await page.waitForSelector("#list_emoji_section");

  TIME && console.timeEnd("[Login time]");

  // workspace が変更されている可能性があるので返しておく
  return inputs;
};
