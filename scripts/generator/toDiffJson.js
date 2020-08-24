const v = require("../utilities/convertToVPrefixedVersion");
const getDecomojiDiffAsCategory = require("../utilities/getDecomojiDiffAsCategory");
const getDecomojiDiffAsFilterMode = require("../utilities/getDecomojiDiffAsFilterMode");
const getDecomojiGitDiffAsTag = require("../utilities/getDecomojiGitDiffAsTag");
const getGitTagPairArray = require("../utilities/getGitTagPairArray");
const getMergedDiffOfCategories = require("../utilities/getMergedDiffOfCategories");
const getMergedDiffOfManages = require("../utilities/getMergedDiffOfManages");
const writeJsonFileSync = require("../utilities/writeJsonFileSync");

// デコモジオブジェクトの格納先
const Seeds = {
  categories: {
    all: [],
    basic: [],
    explicit: [],
    extra: [],
    root: [],
  },
  manages: {
    fixed: [],
    rename: [],
  },
};

// バージョン定数
const TAG_PREFIX = process.argv[2] || "v5";
const TAG_PREV = process.argv[3] || "4.27.0";

// git tag のペアを作る
const tagPairs = getGitTagPairArray(TAG_PREFIX, TAG_PREV);

// git tag ごとの差分を保存する
const gitDiffAsTag = getDecomojiGitDiffAsTag(tagPairs);
// writeJsonFileSync(gitDiffAsTag, `./configs/${v(TAG_PREFIX)}_diff.json`);

// 実行！
Object.entries(gitDiffAsTag)
  .map((entry) => {
    const [tag, list] = entry;
    // diff-filter の結果を { fixed, upload, rename } に再分配し JSON に書き出す
    const diffAsFilterMode = getDecomojiDiffAsFilterMode(list, tag);
    writeJsonFileSync(diffAsFilterMode, `./configs/${v(tag)}.json`);
    return diffAsFilterMode;
  })
  .forEach((diffAsFilterMode) => {
    // diffAsFilterMode からバージョンを統合して { basic, extra, explicit } に再分配する
    const diffAsCategory = getDecomojiDiffAsCategory(diffAsFilterMode);
    // Seeds に差分をマージしてまとめる
    Seeds.categories = getMergedDiffOfCategories(
      diffAsCategory,
      Seeds.categories
    );
    Seeds.manages = getMergedDiffOfManages(diffAsFilterMode, Seeds.manages);
  });

// v5_all.json, v5_basic.json, v5_extra.json, v5_explicit.json を作る
Object.entries(Seeds.categories).forEach((entry) => {
  const [category, list] = entry;
  if (list.length < 1) return;
  writeJsonFileSync(
    list
      .filter(({ removed }) => !removed)
      .sort((a, b) => a.name.localeCompare(b.name)),
    `./configs/${v(TAG_PREFIX)}_${category}.json`
  );
});

// v5_fixed.json, v5_rename.json を作る
Object.entries(Seeds.manages).forEach((entry) => {
  const [manage, list] = entry;
  const _list =
    manage === "rename"
      ? list.concat({ name: "euc_jp", alias_for: "euc-jp" })
      : list;
  writeJsonFileSync(
    _list.sort((a, b) => a.name.localeCompare(b.name)),
    `./configs/${v(TAG_PREFIX)}_${manage}.json`
  );
});
