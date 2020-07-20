# 高度な管理方法

## JSON ファイルで対話入力を簡略化する

ログイン情報や追加削除の設定を JSON ファイルに保存すると、対話式の設定入力を簡略化できます。

まず scripts/manager/inputs.json.example を雛形に scripts/manager/inputs.json を保存してください。

値の型については後述しています。

```json
// inputs.json
{
  "workspace": "<workspace>",
  "email": "<email>",
  "password": "<password>",
  "mode": "upload",
  "categories": ["v5_basic", "v5_extra"]
}
```

登録スクリプトに `--inputs` オプション（または `-i`）を付与することで `inputs.json` の情報がログインに使われます。

```bash
node scripts/manager --inputs
node scripts/manager -i
```

## 削除時に自分以外のメンバーが登録したカスタム絵文字も強制的に削除する

scripst/manager の削除スクリプトは、デフォルトでは自分が登録した絵文字しか削除できない設定になっています。**あなたのアカウントに権限があれば**、他のメンバーが登録した絵文字でも強制削除することができます。

強制削除オプションは対話入力では設定できません。 inputs.json を `"mode": "remove"` として `"forceRemove": true` を追加してください。

```json
// inputs.json
{
  "workspace": "<workspace>",
  "email": "<email>",
  "password": "<password>",
  "mode": "upload",
  "categories": ["v4_basic", "v4_extra"],
  "forceRemove": true
}
```

**権限にかかわらず削除した絵文字はたとえ直後であっても復元できません。必ず削除前にバックアップするなどしてください。**

バックアップには Chrome エクステンションの[Slack Custom Emoji Manager](https://chrome.google.com/webstore/detail/slack-custom-emoji-manage/cgipifjpcbhdppbjjphmgkmmgbeaggpc)が便利です。

## オリジナルのエイリアスを登録する

scripst/manager/alias/ に下記のフォーマットで my-alias.json ファイルを置き、inputs.json に設定を追加してください。

```json
// my-alias.json
[
  {
    "name": "ナルホド", // エイリアス名
    "alias_for": ":naruhodo:" // エイリアスが貼られるカスタム絵文字名
  }
]
```

```json
// inputs.json
{
  "workspace": "<workspace>",
  "email": "<email>",
  "password": "<password>",
  "mode": "alias",
  "alias": ["my-alias"]
}
```

`node scripts/manager -i` を実行して登録が完了すると、`:ナルホド:` を入力して `:naruhodo:` と同じカスタム絵文字が引き当てられるようになります。

エイリアス名に登録しようとしている文字列が、エイリアスなのかカスタム絵文字自体なのかに関わらず、ワークスペースにすでに登録されている場合には、そのエイリアスは登録されません。

Slack の仕様により、１つのエイリアス名には複数のエイリアスは登録できないためです。

## inputs.json の型

| キー        | 値の型                                                                                                              | 値の凡例                   | 注記                                                                                                                                 |
| :---------- | :------------------------------------------------------------------------------------------------------------------ | :------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- |
| workspace   | `string`                                                                                                            | `"decomoji"`               | ワークスペースのサブドメインです。                                                                                                   |
| email       | `email`                                                                                                             | `"otiext@gmail.com"`       |                                                                                                                                      |
| password    | `string`                                                                                                            | `"hogehoge"`               |                                                                                                                                      |
| mode        | `"upload" | "alias" | "remove"`                                                                                     | `"upload"`                 |                                                                                                                                      |
| categories  | `("v4_all" | "v4_basic" | "v4_extra" | "v4_fixed" | "v5_all" | "v5_basic" | "v5_extra" | "v5_explicit" | string)[]` | `["v5_basic", "v5_extra"]` | scripts/manager/configs/list/ に格納した json ファイル名を値にとる配列                                                               |
| alias       | `("v4_fixed-to-v5" | string)[]`                                                                                     | `["v4_fixed-to-v5"]`       | scripts/manager/configs/alias/ に格納した json ファイル名を値にとる配列                                                              |
| forceRemove | `boolean`                                                                                                           | `false`                    | mode="remove" で `true` の時、他ユーザーが登録したカスタム絵文字も削除対象に含めます。対象に含めても権限がない場合は削除されません。 |
| browser     | `boolean`                                                                                                           | `false`                    | `true` の時、puppeteer で Chromium をヘッドフルにして実行します。                                                                    |
| log         | `boolean`                                                                                                           | `false`                    | `true` の時、処理確認用のログをターミナルの標準出力に送ります。                                                                      |
| time        | `boolean`                                                                                                           | `false`                    | `true` の時、処理時間をターミナルの標準出力に送ります。                                                                              |
| debug       | `boolean`                                                                                                           | `false`                    | `true` の時、browser, log, time を全て `true` にして実行します。                                                                     |
