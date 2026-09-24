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

# 3. 追加したデコモジを最適化する
npm run optimize -- basic
npm run optimize -- extra
npm run optimize -- explicit

# 4. 既存のデコモジを変更した場合は一つずつコミットする
`fix: xxxx の画像を修正した`

# 5. 追加したデコモジはカテゴリごとに一括コミットする
`feat: extra のデコモジを追加した`

# 6. database/v6.json にエントリを追加・修正する
手順は検討中。

# 7. database とスクリプトを検査する
node scripts/inspector/index.mjs
npm test

エラーがあれば直す。警告は内容を見て判断する。

# 8. 検証用のワークスペースで「更新」を実行し、登録がうまくいくか確認する
npm run launch -- inputs.decomoji-dev.json

`error_name_taken_i18n` エラーなどになったら適宜ファイル名を変更する。

# 9. LIST-***.md を更新する
node scripts/generator/toListMd.mjs

# 10. Oxfmt の意志のままに整形する
npx oxfmt
```

## ドキュメント用画像の追加・修正

```bash
# 1. ドキュメントで使っている画像を最適化する
npm run optimize -- docs
```
