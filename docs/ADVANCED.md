# 高度な管理方法

## JSON ファイルで対話入力を簡略化する

ログイン情報や実行モードの設定を JSON ファイルに保存すると、対話式の設定入力を省略できます。

まず scripts/launcher/inputs.example.json を雛形に scripts/launcher/inputs.json を保存してください。

値の型については後述しています。

```json
// scripts/launcher/inputs.json
{
  "workspace": "<workspace>",
  "email": "<email>",
  "password": "<password>",
  "mode": "install",
  "term": "category",
  "configs": ["v5_basic", "v5_extra"]
}
```

登録スクリプトに `--inputs` オプション（または `-i`）を付与することで `inputs.json` の情報がログインに使われます。

```bash
npm run launch --  --inputs
```

## 追加・更新モードでバージョンごとを選択した時、バージョンに含まれる「露骨」カテゴリーのデコモジを追加対象から除外する

追加と更新モードでバージョンごとに実行する場合、選択したバージョンには「露骨」カテゴリーのデコモジが含まれてることがあります。

含まれている「露骨」カテゴリーのデコモジは**デフォルトで除外されて**追加・更新が実行されますが、**意図して除外しない場合**は、`includeExplicit: true` を追記してください。

```json
// scripts/launcher/inputs.json
{
  "workspace": "<workspace>",
  "email": "<email>",
  "password": "<password>",
  "mode": "update",
  "term": "version",
  "configs": ["v5.18.0"],
  "includeExplicit": true
}
```

`includeExplicit` キーが存在しない場合、 `includeExplicit: false` として振る舞います。この振る舞いはデフォルトです。

このオプションは追加か更新モード（`mode === "install" || mode === "update"`）でかつ対象タイプがバージョン（`term === "version"`）の時のみ有効です。

「露骨」カテゴリーを対象に追加モードを実行している時（`mode === "install"` かつ `term === "category"` かつ `configs === ["v5_explicit"]`）は、 `includeExplicit` キーの値に関係なく「露骨」カテゴリーのデコモジを追加します。

## タギングされていないオリジナルのバージョンを登録する

登録スクリプトに `--aditional` オプション（または `-a`）を付与すると、バージョン別の選択肢に git でタギングされていないバージョンを含められます。

このバージョンの中身は toDiffJson.js であらかじめ `configs/` に出力しておいてください。

```bash
node scripts/generator/toDiffJson.js v5.100.0
```

指定のバージョンを `--additinal` または `-a` オプションに渡すと、

```bash
npm run launch --a v5.100.0
```

登録スクリプト実行時のバージョン選択に「ユーザーが追加したバージョン」として表示されます。

```bash
% npm run launch -a v5.100.0
? ワークスペースのサブドメインを入力してください: decomoji-dev
? メールアドレスを入力してください: otiext@gmail.com
? パスワードを入力してください: **********
? モードを選択してください: 更新
? 対象タイプを選択してください: バージョンごと
? バージョンを選択してください: (Press <space> to select, <a> to toggle all, <i> to invert selection)
 ──────────────
❯◯ v5.100.0（ユーザーが追加したバージョン）
 ◯ v5.19.1（2022年1月7日公開）
 ◯ v5.19.0（2021年12月30日公開）
```

## オリジナルのエイリアスを登録する

`configs/` に下記のフォーマットで my-alias.json ファイルを置き、inputs.json に設定を追記してください。

```json
// configs/my-alias.json
[
  {
    "name": "ナルホド", // エイリアス名
    "alias_for": ":naruhodo:" // エイリアスが貼られるカスタム絵文字名
  }
]
```

```json
// scripts/launcher/inputs.json
{
  "workspace": "<workspace>",
  "email": "<email>",
  "password": "<password>",
  "mode": "alias",
  "configs": ["my-alias"]
}
```

`/index.mjs -i` を実行して登録が完了すると、`:ナルホド:` を入力して `:naruhodo:` と同じカスタム絵文字が引き当てられるようになります。

エイリアス名に登録しようとしている文字列が、エイリアスなのかカスタム絵文字自体なのかに関わらず、ワークスペースにすでに登録されている場合には、そのエイリアスは登録されません。

Slack の仕様により、１つのエイリアス名には複数のエイリアスは登録できないためです。

## inputs.json の型

| キー            | 値の型                                                                                                                                                                         | 値の凡例                                             | 注記                                                                                                               |
| :-------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| workspace       | `string`                                                                                                                                                                       | `"decomoji"`                                         | ワークスペースのサブドメインです。                                                                                 |
| email           | `email`                                                                                                                                                                        | `"otiext@gmail.com"`                                 |                                                                                                                    |
| password        | `string`                                                                                                                                                                       | `"hogehoge"`                                         |                                                                                                                    |
| mode            | `"install" \| "alias" \| "uninstall" \| "update"`                                                                                                                              | `"install"`                                          |
| term            | `"category" \| "version"`                                                                                                                                                      | `"category"`                                         | デコモジをカテゴリーごとに選択するかバージョンごとに選択するか                                                     |
| configs         | `("v4_all" \| "v4_basic" \| "v4_extra" \| "v4_fixed" \| "v5_all" \| "v5_basic" \| "v5_extra" \| "v5_explicit" \| "v4_rename" \| "v5_rename \| <TAG_VERSION_NAME> \| string)[]` | `["v5_basic", "v5_extra"]`, `["v5.18.0", "v5.17.3"]` | configs/ に格納した json ファイル名を値にとる配列                                                                  |
| excludeExplicit | `boolean`                                                                                                                                                                      | `true`                                               | mode="install" か mode="update" でかつ term="version" の時のみ有効です。デフォルトでは `true` として振る舞います。 |
