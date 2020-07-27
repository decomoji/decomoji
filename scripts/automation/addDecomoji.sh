#!/bin/sh
# sh scripts/automation/addDecomoji.sh v5.1.1 extra

# 1. 追加したデコモジを最適化する
node scripts/generator/optimize.js ./decomoji/$2_tmp/ ./decomoji/$2/

# 2. v5_$2.json を更新する
node scripts/generator/toNamePathList.js $2 ./scripts/manager/configs/list/v5_$2.json

# 3. v5_all.json を更新する
node scripts/generator/toAllNamePathList.js

# 4. LIST-$2.md を更新する
node scripts/generator/toListMd.js $2

# 5. 更新分の json を作成する
node scripts/generator/toNamePathList.js $2_tmp ./scripts/manager/configs/list/$1_$2.json
## 作成後、 path フィールドを修正する

# 6.Prettier の意志のままに整形する
npx prettier --write .
