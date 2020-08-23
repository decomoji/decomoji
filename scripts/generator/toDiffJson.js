const fs = require("fs");
const convertToDecomojiObject = require("../utilities/convertToDecomojiObject");
const getGitDiffArray = require("../utilities/getGitDiffArray");
const getGitDiffOfRenameArray = require("../utilities/getGitDiffOfRenameArray");
const getGitTagPairArray = require("../utilities/getGitTagPairArray");
const getDecomojiCategory = require("../utilities/getDecomojiCategory");
const isDecomojiFile = require("../utilities/isDecomojiFile");

// diff-filter 向け辞書
const diffTypes = [
  { type: "upload", mode: "A" },
  { type: "modify", mode: "M" },
  { type: "rename", mode: "R" },
  { type: "delete", mode: "D" },
];

// diff-filter-mode をキーにして差分を配列で持つオブジェクトをタグごとに持ったオブジェクトを返す
/**
 * {
 *  <tag>: {"upload: [...]", "modify": [...], "rename": [...], "delete": [...]},
 *  <tag>: {"upload: [...]", "modify": [...], "rename": [...], "delete": [...]},
 *  ...
 * }
 */
const getDecomojiGitDiffAsTag = (tagPairs) => {
  return tagPairs.reduce((_log, { from, to }) => {
    const tag = to;
    const log = diffTypes.reduce((_diff, { type, mode }) => {
      console.log(`Diff[${mode}]: ${from}...${to}`);
      const isRenameMode = mode === "R";
      const diff = isRenameMode
        ? getGitDiffOfRenameArray(from, to)
        : getGitDiffArray(from, to, mode);
      // "<diff-filter-mode>": [<filepath>, <filepath>, ...]
      return {
        ..._diff,
        ...{ [type]: diff.filter(isDecomojiFile) },
      };
    }, {});
    // { <tag>: {"upload: [...]", "modify": [...], "rename": [...], "delete": [...]}}
    return { ..._log, [tag]: log };
  }, {});
};

// diff-filter の結果を { fixed, upload, rename } に再分配したオブジェクトを返す
const getDecomojiDiffAsMode = (diff, tag) => {
  const upload = [];
  const fixed = [];
  const rename = [];
  Object.entries(diff).forEach((entry) => {
    const [mode, list] = entry;
    list.forEach((path) => {
      const decomoji =
        mode === "rename"
          ? {}
          : convertToDecomojiObject(path, tag, mode === "upload");

      if (mode === "delete" || mode === "modify") {
        fixed.push(decomoji);
      }
      if (mode === "upload" || mode === "modify") {
        upload.push(decomoji);
      }

      if (mode === "rename") {
        const [before, after] = path;
        fixed.push(convertToDecomojiObject(before, tag));
        upload.push(convertToDecomojiObject(after, tag));
        rename.push({
          name: before,
          alias_for: after,
        });
      }
    });
  });
  return { fixed, upload, rename };
};

// 実行！
Object.entries(getDecomojiGitDiffAsTag(getGitTagPairArray("v5", "4.27.0"))).map(
  (entry) => {
    const [tag, diff] = entry;
    try {
      fs.writeFileSync(
        `./scripts/manager/configs/${tag}.json`,
        JSON.stringify(getDecomojiDiffAsMode(diff, tag))
      );
      console.log(`./scripts/manager/configs/${tag}.json has been saved!`);
    } catch (err) {
      throw err;
    }
    // 次の reduce でカテゴリー別 JSON を作るためにそのまま返す
    return entry;
  }
);
