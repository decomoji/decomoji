# 更新手順書

このドキュメントはオーサー向けです。

## デコモジファイルの追加・修正

```bash
# 1. リネームがある場合は git mv で行う
git mv decomoji/extra/euc_jp.png decomoji/extra/euc-jp.png
# リネームとバイナリ変更を行う場合は、git mv 後に変更をコミットして squash する（git diff で RENAME を取得するため）

# 2. 書き出したデコモジファイルをカテゴリー別の一次フォルダに格納する
basic => basic_tmp
extra => extra_tmp
explicit => explicit_tmp

# 2. 追加したデコモジを最適化する
node scripts/generator/optimize.mjs basic
node scripts/generator/optimize.mjs extra
node scripts/generator/optimize.mjs explicit

# 3. 既存のデコモジを変更した場合は一つずつコミットする
`fix(decomoji): xxxx の画像を修正した`

# 4. json を更新する
node scripts/generator/toDiffJson.mjs v5.x.0
コマンドに更新する予定のバージョン名が必要。

# 5. `--additinal` オプションで登録スクリプトを実行し、登録がうまくいくか確認する
node scripts/manager/index.mjs -l -t --additional v5.x.0

`error_name_taken_i18n` エラーなどになったら適宜ファイル名を変更する。

# 6. LIST-***.md を更新する
node scripts/generator/toListMd.mjs

# 7. Prettier の意志のままに整形する
npx prettier --write .
```

## ドキュメント用画像の追加・修正

```bash
# 1. ドキュメントで使っている画像を最適化する
node scripts/generator/optimize.mjs docs
```
