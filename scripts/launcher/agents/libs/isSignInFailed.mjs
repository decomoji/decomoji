// サインインに失敗して入力画面に留まっているか否か
// エラー表示の DOM 構造ではなく「次の画面に進めたか否か」で判定する
export const isSignInFailed = async (page) => {
  // 2FA 画面に進んでいればサインイン自体は成功している
  // 2FA 画面に #email が残っていた場合の誤判定を防ぐためのガードで、2FA 無効なら単に素通りする
  if (await page.$('[name="2fa_code"]')) {
    return false;
  }
  // メールアドレスの入力欄が残っていればサインイン画面から進めていない
  return Boolean(await page.$("#email"));
};
