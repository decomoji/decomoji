// ログイン画面に遷移する（ログイン後にカスタム絵文字管理画面にリダイレクトさせる）
export const goToSignInPage = async (page, workspace) => {
  await page.goto(
    `https://${workspace}.slack.com/sign_in_with_password?redir=%2Fcustomize%2Femoji#/`,
    {
      waitUntil: "domcontentloaded",
    },
  );

  // SSOログインが有効なときはフォームがないのでパスワードログイン用の画面に遷移する
  if (await page.$("form[action='/?no_sso=1']")) {
    await page.goto(`https://${workspace}.slack.com/?no_sso=1&redir=%2Fcustomize%2Femoji#/`, {
      waitUntil: "domcontentloaded",
    });
  }
};
