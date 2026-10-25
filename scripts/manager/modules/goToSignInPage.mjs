// ログイン画面に遷移する（ログイン後にカスタム絵文字管理画面にリダイレクトさせる）
export const goToSignInPage = async (page, workspace) => {
  // SSOログインが有効になっているワークスペースでもまず ?no_sso=1 にアクセスしてログインフォームに移動する
  await page.goto(
    `https://${workspace}.slack.com/sign_in_with_password?no_sso=1&redir=%2Fcustomize%2Femoji#/`,
    {
      waitUntil: "domcontentloaded",
    },
  );

  // フォームがない場合はパスワードログインのリンクへ移動する
  if (!(await page.$("#signin_form"))) {
    const pwLink = await page
      .$eval('a[data-qa="sign_in_password_link"]', (a) => a.href)
      .catch(() => null);
    if (pwLink) {
      await page.goto(pwLink, { waitUntil: "domcontentloaded" });
    }
  }
};
