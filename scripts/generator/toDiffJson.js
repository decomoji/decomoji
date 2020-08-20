const fs = require("fs");
const convertToFinderObject = require("../utilities/convertToFinderObject");
const getGitDiffArray = require("../utilities/getGitDiffArray");
const getGitDiffOfRenameArray = require("../utilities/getGitDiffOfRenameArray");
const getGitTagPairArray = require("../utilities/getGitTagPairArray");
const isDecomojiFile = require("../utilities/isDecomojiFile");

// diff-filter 向け辞書
const diffTypes = [
  { type: "upload", mode: "A" },
  { type: "modify", mode: "M" },
  { type: "rename", mode: "R" },
  { type: "delete", mode: "D" },
];

// ファイル名の配列が差分種別キーごとにまとまったオブジェクトとバージョンのキーバリューの配列を返す
const getDecomojiDiff = (versionPrefix, startVersion) => {
  const tagPairs = getGitTagPairArray(versionPrefix, startVersion);
  console.log(`-------------------------------------`);
  return tagPairs.reduce((_log, { from, to }) => {
    const tag = to;
    const log = diffTypes.reduce((_diff, { type, mode }) => {
      console.log(`Diff[${mode}]: ${from}...${to}`);
      const isRenameMode = mode === "R";
      const diff = isRenameMode
        ? getGitDiffOfRenameArray(from, to)
        : getGitDiffArray(from, to, mode);
      return {
        ..._diff,
        ...{ [type]: diff.filter(isDecomojiFile) },
      };
    }, {});
    console.log(`-------------------------------------`);
    return [..._log, { tag, log }];
  }, []);
};

// diff-filter のモードをデコモジファインダーで扱う世界観のキーに振り分けたオブジェクトを返す
const getMixedDecomojiDiff = (diff) => {
  const tag = diff.tag;
  const upload = [];
  const fixed = [];
  const rename = [];
  Object.entries(diff.log).forEach((entry) => {
    const [mode, list] = entry;
    console.log(tag, mode, list);

    if (mode === "upload") {
      list.forEach((v) => {
        upload.push(convertToFinderObject(v, tag, "add"));
      });
    }
    if (mode === "modify") {
      list.forEach((v) => {
        fixed.push(convertToFinderObject(v, tag));
        upload.push(convertToFinderObject(v, tag));
      });
    }
    if (mode === "delete") {
      list.forEach((v) => {
        fixed.push(convertToFinderObject(v, tag));
      });
    }
    if (mode === "rename") {
      list.forEach((v) => {
        const [before, after] = v;
        fixed.push(convertToFinderObject(before, tag));
        upload.push(convertToFinderObject(after, tag));
        rename.push({
          name: before,
          alias_for: after,
        });
      });
    }
  });

  return { fixed, upload, rename };
};

// 実行！
getDecomojiDiff("v5", "4.27.0").forEach((diff) => {
  try {
    fs.writeFileSync(
      `./scripts/manager/configs/${diff.tag}.json`,
      JSON.stringify(getMixedDecomojiDiff(diff))
    );
    console.log(`./scripts/manager/configs/${diff.tag}.json has been saved!`);
  } catch (err) {
    throw err;
  }
});
