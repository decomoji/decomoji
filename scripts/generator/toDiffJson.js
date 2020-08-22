const fs = require("fs");
const convertToDecomojiObject = require("../utilities/convertToDecomojiObject");
const getGitDiffArray = require("../utilities/getGitDiffArray");
const getGitDiffOfRenameArray = require("../utilities/getGitDiffOfRenameArray");
const getGitTagPairArray = require("../utilities/getGitTagPairArray");
const getDecomojiCategory = require("../utilities/getDecomojiCategory");
const isDecomojiFile = require("../utilities/isDecomojiFile");
const { version } = require("punycode");

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

// diff-filter の結果を { fixed, upload, rename } に再分配したオブジェクトを返す
/**
 * type DecomojiObject =
    {
      name!: decomojiName
      path!: decomojiFilepath
      created_ver?: SemVer
      update_ver?: SemVer
    }

 * {
 *   fixed!: DecomojiObject[]
 *   upload!: DecomojiObject[]
 *   rename!: DecomojiObject[]
 * }
 */
const getDecomojiDiffAsTag = (diff) => {
  const tag = diff.tag;
  const upload = [];
  const fixed = [];
  const rename = [];
  Object.entries(diff.log).forEach((entry) => {
    const [mode, list] = entry;
    console.log(tag, mode, list);

    if (mode === "upload") {
      list.forEach((v) => {
        upload.push(convertToDecomojiObject(v, tag, "upload"));
      });
    }
    if (mode === "modify") {
      list.forEach((v) => {
        fixed.push(convertToDecomojiObject(v, tag));
        upload.push(convertToDecomojiObject(v, tag));
      });
    }
    if (mode === "delete") {
      list.forEach((v) => {
        fixed.push(convertToDecomojiObject(v, tag));
      });
    }
    if (mode === "rename") {
      list.forEach((v) => {
        const [before, after] = v;
        fixed.push(convertToDecomojiObject(before, tag));
        upload.push(convertToDecomojiObject(after, tag));
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
getDecomojiDiff("v5", "4.27.0")
  .map((diff) => {
    try {
      fs.writeFileSync(
        `./scripts/manager/configs/${diff.tag}.json`,
        JSON.stringify(getDecomojiDiffAsTag(diff))
      );
      console.log(`./scripts/manager/configs/${diff.tag}.json has been saved!`);
    } catch (err) {
      throw err;
    }
    // 次の reduce でカテゴリー別 JSON を作るためにそのまま返す
    return diff;
  })
  .reduce((_version, diff) => {}, {});
