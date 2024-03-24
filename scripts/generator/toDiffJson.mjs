import { convertToVPrefixedVersion as v } from "../utilities/convertToVPrefixedVersion.mjs";
import { getDecomojiDiffAsCategory } from "../utilities/getDecomojiDiffAsCategory.mjs";
import { getDecomojiDiffAsFilterMode } from "../utilities/getDecomojiDiffAsFilterMode.mjs";
import { getDecomojiGitDiffAsTag } from "../utilities/getDecomojiGitDiffAsTag.mjs";
import { getGitTagPairArray } from "../utilities/getGitTagPairArray.mjs";
import { getMergedDiffOfCategories } from "../utilities/getMergedDiffOfCategories.mjs";
import { getMergedDiffOfManages } from "../utilities/getMergedDiffOfManages.mjs";
import { writeJsonFile } from "../utilities/writeJsonFile.mjs";
import { ADDITIONALS, FIRST_LETTERS } from "../models/constants.mjs";

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
const TAG_UPDATE_CANDIDATE = process.argv[2];
const TAG_PREFIX = process.argv[3] || "v5";
const TAG_PREV = process.argv[4] || "4.27.0";

if (!TAG_UPDATE_CANDIDATE) {
  throw new Error("TAG_UPDATE_CANDIDATE argument is undefined.");
}

// git tag のペアを作る
const tagPairs = getGitTagPairArray(TAG_PREV, TAG_PREFIX, TAG_UPDATE_CANDIDATE);

// git tag ごとの差分を保存する
const gitDiffAsTag = getDecomojiGitDiffAsTag(tagPairs);
// await writeJsonFile(gitDiffAsTag, `configs/${v(TAG_PREFIX)}_diff.json`);

// 実行！
Object.entries(gitDiffAsTag)
  .map((entry) => {
    const [tag, list] = entry;
    // diff-filter の結果を { fixed, upload, rename } に再分配し JSON に書き出す
    const diffAsFilterMode = getDecomojiDiffAsFilterMode(list, tag);
    writeJsonFile(diffAsFilterMode, `configs/${v(tag)}.json`);
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
Object.entries(Seeds.categories).forEach(async (entry) => {
  const [category, list] = entry;
  if (list.length < 1) return;
  const _list = (
    category === "extra" || category === "all"
      ? list.concat(ADDITIONALS.extra)
      : list
  )
    .filter(({ removed }) => !removed)
    .sort((a, b) => a.name.localeCompare(b.name));
  await writeJsonFile(_list, `configs/${v(TAG_PREFIX)}_${category}.json`);

  FIRST_LETTERS.flatMap(async (letter) => {
    const _filtered = _list.filter(({ name }) => name.slice(0, 1) === letter);
    await writeJsonFile(
      _filtered,
      `configs/${v(TAG_PREFIX)}_${category}_${letter}.json`
    );
  });
});

// v5_fixed.json, v5_rename.json を作る
Object.entries(Seeds.manages).forEach(async (entry) => {
  const [manage, list] = entry;
  const _list = (
    manage === "rename" ? list.concat(ADDITIONALS.rename) : list
  ).sort((a, b) => a.name.localeCompare(b.name));
  await writeJsonFile(_list, `configs/${v(TAG_PREFIX)}_${manage}.json`);
});
