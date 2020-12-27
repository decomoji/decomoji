const inquirer = require("inquirer");
const isInputs = require("../../utilities/isInputs");

// ワークスペースが見つからない時の再帰処理
const recursiveInputWorkspace = async (page, inputs) => {
  try {
    const { workspace } = await inquirer.prompt({
      type: "input",
      name: "workspace",
      message: `${inputs.workspace} は見つかりませんでした。ワークスペースを再度入力してください:`,
      validate: isInputs,
    });
    // チーム名を保存し直す
    inputs.workspace = workspace;
    // ログイン画面に再び遷移する
    await page.goto(
      `https://${workspace}.slack.com/?redir=%2Fcustomize%2Femoji#/`,
      {
        waitUntil: "domcontentloaded",
      }
    );
    // ログイン画面に遷移できたかを再びチェックし、できていたら再帰処理を抜ける
    if (await page.$("#signin_form").then((res) => !!res)) {
      return inputs;
    }
    // ログインページに到達できるまで何度でもトライ！
    await recursiveInputWorkspace(page, inputs);
  } catch (e) {
    return e;
  }
};

module.exports = recursiveInputWorkspace;
