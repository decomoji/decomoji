import inquirer from "inquirer";
import { isInputs } from "../../utilities/isInputs";

// 2FA利用時の再帰処理
export const recursiveInput2FA = async (browser, page, inputs) => {
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
    // 2FA 利用のフラグを立てる
    inputs.twofactor_code = true;
    // フォームに入力してサインインする
    const $2fa = await page.$('[name="2fa_code"]');
    await $2fa.click({ clickCount: 3 });
    await $2fa.type(twofactor_code);
    await Promise.all([
      page.click("#signin_btn"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
    // 2FA入力欄がなかったら2FA認証できたと見なして再帰処理を抜ける
    if (await page.$('[name="2fa_code"]').then((res) => !res)) {
      console.info("2FA Verified!");
      return inputs;
    }
    // 2FA認証できるまで何度でもトライ！
    await recursiveInput2FA(browser, page, inputs);
  } catch (e) {
    return e;
  }
};
