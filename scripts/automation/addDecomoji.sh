#!/bin/sh

# 1. 追加したデコモジを最適化する
node scripts/generator/optimize.js ./decomoji/extra_tmp/ ./decomoji/extra/

# 2. v5_extra.json を更新する
node scripts/generator/toNamePathList.js extra ./scripts/manager/configs/list/v5_extra.json

# 3. v5_all.json を更新する
node scripts/generator/toAllNamePathList.js

# 4. LIST-extra.md を更新する
node scripts/generator/toListMd.js extra

# 5. 更新分の json を作成する
node scripts/generator/toNamePathList.js extra_tmp ./scripts/manager/configs/list/v5.1.json
## 作成後、 path フィールドを修正する

# 6.Prettier の意志のままに整形する
npx prettier --write .
