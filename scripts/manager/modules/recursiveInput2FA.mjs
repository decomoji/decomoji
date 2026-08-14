import inquirer from "inquirer";
import { isInputs } from "../../utilities/isInputs.mjs";

// 2FA利用時の再帰処理
// エラーはtry-catchせず呼び出し元の .catch() に伝播させる
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
  // フォームに入力する
  // 最終桁の入力で自動サブミットされるため、type より先に遷移の待ち受けを張る
  const $2fa = await page.$(".two_factor_input_item:first-child > input");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2" }),
    $2fa.type(twofactor_code),
  ]);
  // 2FA入力欄がなかったら2FA認証できたと見なして再帰処理を抜ける
  if (!(await page.$('[name="2fa_code"]'))) {
    console.info("2FA Verified!");
    return inputs;
  }
  // 2FA認証できるまで何度でもトライ！
  // 認証できたら再帰の結果をそのまま返す
  return await recursiveInput2FA(browser, page, inputs);
};
