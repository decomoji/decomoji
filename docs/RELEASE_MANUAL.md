# 更新手順書

このドキュメントはオーサー向けです。

## デコモジの追加・修正

```bash
# 1. 追加したデコモジを最適化する
node scripts/generator/optimize.js ./decomoji/extra_tmp/ ./decomoji/extra/

# 2. v5_extra.json を更新する
node scripts/generator/toNamePathList.js extra ./scripts/manager/configs/list/v5_extra.json

# 3. v5_all.json を更新する
node scripts/generator/toAllNamePathList.js

# 4. LIST-extra.md を更新する
node scripts/generator/toListMd.js extra

# 5. 更新分の json を作成する
node scripts/generator/toAllNamePathList.js extra_tmp ./scripts/manager/configs/list/v5_xxx.json
## 作成後、 path フィールドを修正する
```

## ドキュメントの追加・修正

```bash
# 1. ドキュメントで使っている画像を最適化する
node scripts/generator/optimize.js ./docs/images/
```
