# 更新手順書

このドキュメントはオーサー向けです。

## デコモジの追加・修正

```bash
# 1. リネームがある場合は git mv で行う
git mv decomoji/extra/euc_jp.png decomoji/extra/euc-jp.png
# リネームとバイナリ変更を行う場合は、git mv 後に変更をコミットして squash する（git diff で RENAME を取得するため）

# 2. 追加したデコモジを最適化する
node scripts/generator/optimize.js ./decomoji/extra_tmp/ ./decomoji/extra/

# 3. json を更新する
node scripts/generator/toDiffJson.js

# 4. LIST-***.md を更新する
node scripts/generator/toListMd.js

# 5. Prettier の意志のままに整形する
npx prettier --write .
```

## ドキュメントの追加・修正

```bash
# 1. ドキュメントで使っている画像を最適化する
node scripts/generator/optimize.js ./docs/images/
```
