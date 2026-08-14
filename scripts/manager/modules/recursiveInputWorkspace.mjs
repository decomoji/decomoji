import inquirer from "inquirer";
import { isInputs } from "../../utilities/isInputs.mjs";
import { goToSignInPage } from "./goToSignInPage.mjs";

// ワークスペースが見つからない時の再帰処理
// エラーはtry-catchせず呼び出し元の .catch() に伝播させる
export const recursiveInputWorkspace = async (page, inputs) => {
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
  return await recursiveInputWorkspace(page, inputs);
};
