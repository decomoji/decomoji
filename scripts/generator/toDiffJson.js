const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const diffTypes = [
  { type: "upload", mode: "A" },
  { type: "modify", mode: "M" },
  { type: "rename", mode: "R" },
  { type: "delete", mode: "D" },
];

// タグ一覧を返す
const getTags = (versionPrefix) => {
  const resultBuffer = execSync(`git tag --list | grep -E ^${versionPrefix}`);
  if (!resultBuffer) return;
  return bufferToArray(resultBuffer);
};

// バッファを配列にする
const bufferToArray = (buffer) => {
  return buffer
    .toString()
    .split("\n")
    .filter((v) => v !== "");
};

// ファイル名がデコモジかどうか返す
const isDecomojiFile = (fileName) => {
  return /decomoji\/.*\.png/.test(fileName);
};

// from と to の差分を mode で diff-filter した配列を返す
const getDiff = (from, to, mode) => {
  const resultBuffer = execSync(
    `git diff ${from}...${to} --name-only --diff-filter=${mode}`
  );
  if (!resultBuffer) return;
  const diffItemList = bufferToArray(resultBuffer);
  return diffItemList.filter(isDecomojiFile);
};

// renameしたものの from と to の差分を返す
const getRenameDiff = (from, to) => {
  const resultBuffer = execSync(
    `git diff ${from}...${to} --name-status --diff-filter=R`
  );
  if (!resultBuffer) return;
  const diffItemList = bufferToArray(resultBuffer);
  return diffItemList
    .map((v) => v.replace("R100\t", "").split("\t"))
    .filter(isDecomojiFile);
};

// タグ一覧において自身と次のバージョンのペアオブジェクトを配列で返す
const getVersionPairs = (versionPrefix) => {
  const tags = getTags(versionPrefix);
  return tags.reduce((memo, cr, i, versions) => {
    const next = versions[i + 1];
    const from = cr;
    const to = next;
    return next ? [...memo, { from, to }] : memo;
  }, []);
};

// ファイル名の配列が差分種別キーごとにまとまったオブジェクトとバージョンのキーバリューの配列を返す
const getLogs = (versionPrefix) => {
  const versionPairs = getVersionPairs(versionPrefix);
  console.log(`-------------------------------------`);
  return versionPairs.reduce((_log, { from, to }) => {
    const tag = to;
    const log = diffTypes.reduce((_diff, { type, mode }) => {
      console.log(`Diff[${mode}]: ${from}...${to}`);
      const isRenameMode = mode === "R";
      const diff = isRenameMode
        ? getRenameDiff(from, to)
        : getDiff(from, to, mode);
      return {
        ..._diff,
        ...{ [type]: diff },
      };
    }, {});
    console.log(`-------------------------------------`);
    return [..._log, { tag, log }];
  }, []);
};

// ファイルパスから拡張子なしのファイル名を返す
const toPurename = (filepath) => {
  return path.basename(filepath).split(".png")[0];
};

// デコモジファインダー用のフォーマットに変換する
const formatToFinderObject = (value, tag, add) => {
  return {
    name: toPurename(value),
    path: `./${value}`,
    ...(add ? { created_ver: tag } : { update_ver: tag }),
  };
};
