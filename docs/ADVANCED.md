# 高度な管理方法

## JSON ファイルで対話入力を簡略化する

ログイン情報や追加削除の設定を JSON ファイルに保存すると、対話式の設定入力を簡略化できます。

まず scripts/manager/inputs.json.example を雛形に scripts/manager/inputs.json を保存してください。

```json
{
  "workspace": "<workspace>",
  "email": "<email>",
  "password": "<password>",
  "categories": ["basic", "extra"],
  "mode": "upload"
}
```

登録スクリプトに `--inputs` オプションを付与することで `inputs.json` の情報がログインに使われます。

```bash
node scripts/manager --inputs
```

## 削除時に自分以外のメンバーが登録したカスタム絵文字も強制的に削除する

scripst/manager の削除スクリプトは、デフォルトでは自分が登録した絵文字しか削除できない設定になっています。あなたのアカウントに権限があれば、他のメンバーが登録した絵文字でも強制削除することができます。

強制削除オプションは対話入力では設定できません。 inputs.json を `"mode": "remove"` として `"forceRemove": true` を追加してください。

```
{
  "workspace": "<workspace>",
  "email": "<email>",
  "password": "<password>",
  "categories": ["basic", "extra"],
  "mode": "remove",
  "forceRemove": true
}
```

**権限にかかわらず削除した絵文字はたとえ直後であっても復元できません。必ず削除前にバックアップするなどしてください。**
