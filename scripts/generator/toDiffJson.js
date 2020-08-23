const fs = require("fs");
const convertToDecomojiObject = require("../utilities/convertToDecomojiObject");
const getGitDiffArray = require("../utilities/getGitDiffArray");
const getGitDiffOfRenameArray = require("../utilities/getGitDiffOfRenameArray");
const getGitTagPairArray = require("../utilities/getGitTagPairArray");
const getDecomojiCategory = require("../utilities/getDecomojiCategory");
const isDecomojiFile = require("../utilities/isDecomojiFile");

// バージョン定数
const MAJOR_TAG_PREFIX = process.argv[2] || "v5";
const LATEST_PREV_TAG = process.argv[3] || "4.27.0";

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
        mode === "rename" ? {} : convertToDecomojiObject(path, tag, mode);

      if (mode === "delete" || mode === "modify") {
        fixed.push(decomoji);
      }
      if (mode === "upload" || mode === "modify") {
        upload.push(decomoji);
      }

      if (mode === "rename") {
        const [before, after] = path;
        fixed.push(convertToDecomojiObject(before, tag, "delete"));
        upload.push(convertToDecomojiObject(after, tag, "upload"));
        rename.push({
          name: before,
          alias_for: after,
        });
      }
    });
  });
  return { fixed, upload, rename };
};

// diff-filter の結果からバージョンを統合して { basic, extra, explicit } に再分配したオブジェクトを返す
const getDecomojiDiffAsCategory = (diffAsMode) => {
  const c = {
    basic: [],
    extra: [],
    explicit: [],
  };
  Object.entries(diffAsMode).forEach((entry) => {
    const [mode, list] = entry;

    list.forEach((decomoji) => {
      if (mode === "rename") {
        return;
      }
      const categoryName = getDecomojiCategory(decomoji.path);
      const target = c[categoryName];
      const index = target.findIndex((v) => v.name === decomoji.name);
      // 同じ名前があったらマージして置き換える
      if (index > -1) {
        target.splice(index, 1, { ...target[index], ...decomoji });
      } else {
        target.push(decomoji);
      }
    });
  });
  return c;
};

// 実行！
const categories = {
  basic: [],
  extra: [],
  explicit: [],
};
const tagPairs = getGitTagPairArray(MAJOR_TAG_PREFIX, LATEST_PREV_TAG);
const diffAsTag = getDecomojiGitDiffAsTag(tagPairs);
Object.entries(diffAsTag)
  .map((entry) => {
    const [tag, list] = entry;
    const diffAsMode = getDecomojiDiffAsMode(list, tag);
    try {
      fs.writeFileSync(
        `./scripts/manager/configs/${tag}.json`,
        JSON.stringify(diffAsMode)
      );
      console.log(`./scripts/manager/configs/${tag}.json has been saved!`);
    } catch (err) {
      throw err;
    }

    return diffAsMode;
  })
  .map((diffAsMode) => {
    const diffAsCategory = getDecomojiDiffAsCategory(diffAsMode);
    Object.entries(diffAsCategory).forEach((entry) => {
      const [categoryName, list] = entry;
      list.forEach((decomoji) => {
        const target = categories[categoryName];
        const index = target.findIndex((v) => v.name === decomoji.name);
        // 同じ名前があったらマージして置き換える
        if (index > -1) {
          target.splice(index, 1, { ...target[index], ...decomoji });
        } else {
          target.push(decomoji);
        }
      });
    });

    // タグごとに毎回上書きする
    Object.entries(categories).forEach((entry) => {
      const [category, list] = entry;
      // removed キーを持つものを弾く
      const filtedList = list.filter(({ removed }) => !removed);
      // name キーでソートする
      const sortedList = filtedList.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      try {
        fs.writeFileSync(
          `./scripts/manager/configs/v5_${category}.json`,
          JSON.stringify(sortedList)
        );
        console.log(
          `./scripts/manager/configs/v5_${category}.json has been saved!`
        );
      } catch (err) {
        throw err;
      }
    });
  });
