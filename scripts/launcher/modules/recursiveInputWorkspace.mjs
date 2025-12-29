import inquirer from "inquirer";
import { isInputs } from "../../utilities/isInputs.mjs";
import { goToSignInPage } from "./goToSignInPage.mjs";

// 再入力を促す回数の上限
// 入力ミス以外の理由でログイン画面に到達できないとき、無限に聞き続けないようにする
const MAX_ATTEMPTS = 5;

// ワークスペースが見つからない時の再帰処理
// エラーはtry-catchせず呼び出し元の .catch() に伝播させる
export const recursiveInputWorkspace = async (page, inputs, attempt = 1) => {
  // 上限に達したら諦めて呼び出し元にエラーを伝播させる
  if (attempt > MAX_ATTEMPTS) {
    throw new Error(
      `[ERROR]Could not reach the sign in page. (tried ${MAX_ATTEMPTS} times) The workspace might be SSO only.`,
    );
  }

  const { workspace } = await inquirer.prompt({
    type: "input",
    name: "workspace",
    message: `${inputs.workspace} は見つかりませんでした。ワークスペースを再度入力してください:`,
    validate: isInputs,
  });
  // チーム名を保存し直す
  inputs.workspace = workspace;
  // ログイン画面に再び遷移する（SSO のフォールバックも含めて goToEmojiPage と同じ経路を使う）
  await goToSignInPage(page, inputs.workspace);
  // ログイン画面に遷移できたかを再びチェックし、できていたら再帰処理を抜ける
  if (await page.$("#signin_form")) {
    return inputs;
  }
  // ログインページに到達できるまで何度でもトライ！
  // ログインできたら再帰の結果をそのまま返す
  return await recursiveInputWorkspace(page, inputs, attempt + 1);
};
