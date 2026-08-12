import inquirer from "inquirer";
import { isInputs } from "../../../utilities/index.mjs";

// 2FA利用時の再帰処理
export const recursiveInput2FA = async (browser, page, inputs) => {
  // 前の入力を空にしておく
  await page.$eval('[name="2fa_code"]', (e) => (e.value = ""));
  // 2FA試行
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
  // 最後の桁を入力した時点で自動送信されるので、入力と遷移待ちを同時に開始する
  const $2fa = await page.$(".two_factor_input_item:first-child > input");
  await Promise.all([
    $2fa.type(twofactor_code),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);
  // 2FA入力欄がなかったら2FA認証できたと見なして再帰処理を抜ける
  if (!(await page.$('[name="2fa_code"]'))) {
    console.info("2FA Verified!");
    return inputs;
  }
  // 2FA認証できるまで何度でもトライ！
  return await recursiveInput2FA(browser, page, inputs);
};
