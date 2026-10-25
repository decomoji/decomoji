// ログイン画面に遷移する（ログイン後にカスタム絵文字管理画面にリダイレクトさせる）
// ワークスペースが存在しなかったか否かを返す
export const goToSignInPage = async (page, workspace) => {
  // SSOログインが有効になっているワークスペースでもまず ?no_sso=1 にアクセスしてログインフォームに移動する
  const response = await page.goto(
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

  // 存在しないワークスペースは 404 になる
  // フォームが見つからなくても 404 でなければワークスペースは存在する（SSO 専用など）
  return { notFound: response?.status() === 404 };
};
