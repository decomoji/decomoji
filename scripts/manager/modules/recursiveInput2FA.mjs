import inquirer from "inquirer";
import { isInputs } from "../../utilities/isInputs.mjs";

// 2FAコードの入力欄（先頭の桁）を指すセレクタの候補
// 桁ごとに input が分かれている UI とそうでない UI の両方に備える
const TWO_FACTOR_INPUT_SELECTORS = [
  ".two_factor_input_item:first-child > input",
  '[name="2fa_code"]',
];

// 再入力を促す回数の上限
// 入力ミス以外の理由で認証できないとき、無限に聞き続けないようにする
const MAX_ATTEMPTS = 5;

// 2FA利用時の再帰処理
// エラーはtry-catchせず呼び出し元の .catch() に伝播させる
export const recursiveInput2FA = async (browser, page, inputs, attempt = 1) => {
  // 上限に達したら諦めて呼び出し元にエラーを伝播させる
  if (attempt > MAX_ATTEMPTS) {
    throw new Error(`[ERROR]Failed to verify the 2FA code. (tried ${MAX_ATTEMPTS} times)`);
  }

  // 前の入力を空にしておく
  // 桁ごとに input が分かれていることもあるので $$eval で全てクリアする
  await page.$$eval('[name="2fa_code"], .two_factor_input_item > input', (elements) =>
    elements.forEach((element) => (element.value = "")),
  );

  // 入力欄が無いのは想定外の画面にいるということなので、呼び出し元にエラーを伝播させる
  let $2fa = null;
  for (const selector of TWO_FACTOR_INPUT_SELECTORS) {
    $2fa = await page.$(selector);
    if ($2fa) {
      break;
    }
  }
  if (!$2fa) {
    throw new Error("[ERROR]Could not find the 2FA input. Slack might have changed the page.");
  }

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
  // 最終桁の入力で自動サブミットされることがあるため、type する前に遷移の待ち受けを張る
  await Promise.all([
    // 自動サブミットされず遷移しないこともあるので、待ち受けの失敗は下の入力欄チェックに委ねる
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => void 0),
    $2fa.type(twofactor_code),
  ]);
  // 2FA入力欄がなかったら2FA認証できたと見なして再帰処理を抜ける
  if (!(await page.$('[name="2fa_code"]'))) {
    console.info("2FA Verified!");
    return inputs;
  }
  // 2FA認証できるまで何度でもトライ！
  // 認証できたら再帰の結果をそのまま返す
  return await recursiveInput2FA(browser, page, inputs, attempt + 1);
};
