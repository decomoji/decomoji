import { convertToVPrefixedVersion as v } from "../utilities/convertToVPrefixedVersion.mjs";
import { getDecomojiDiffAsCategory } from "../utilities/getDecomojiDiffAsCategory.mjs";
import { getDecomojiDiffAsFilterMode } from "../utilities/getDecomojiDiffAsFilterMode.mjs";
import { getDecomojiGitDiffAsTag } from "../utilities/getDecomojiGitDiffAsTag.mjs";
import { getGitTagPairArray } from "../utilities/getGitTagPairArray.mjs";
import { getMergedDiffOfCategories } from "../utilities/getMergedDiffOfCategories.mjs";
import { getMergedDiffOfManages } from "../utilities/getMergedDiffOfManages.mjs";
import { writeJsonFile } from "../utilities/writeJsonFile.mjs";
import { ADDITIONALS } from "../models/constants.mjs";

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
// [{ "from": "4.27.0", "to": "v5.0.0" }, { "from": "5.0.0", "to": "v5.1.0" }, ...]
const tagPairs = getGitTagPairArray(TAG_PREV, TAG_PREFIX, TAG_UPDATE_CANDIDATE);

// git tag ごとの差分を保存する
const gitDiffAsTagRaw = getDecomojiGitDiffAsTag(tagPairs);
// await writeJsonFile(gitDiffAsTag, `configs/${v(TAG_PREFIX)}_diff.json`);

// デコモジファイルの変更があるバージョンのみに抽出する
/**
 * 例えば以下のようなバージョンを除外する
 * "v5.33.1": {
    "upload": [],
    "modify": [],
    "rename": [],
    "delete": []
  }
 */
const gitDiffAsTag = Object.fromEntries(
  Object.entries(gitDiffAsTagRaw).filter(
    ([_, diff]) =>
      diff.upload.length > 0 ||
      diff.modify.length > 0 ||
      diff.rename.length > 0 ||
      diff.delete.length > 0,
  ),
);

// 有効なバージョンのリストを configs/v5_versions.json に書き出す
writeJsonFile(Object.keys(gitDiffAsTag), `configs/${v(TAG_PREFIX)}_versions.json`);

// Seeds に差分をマージしてまとめる
Object.entries(gitDiffAsTag)
  .map(([tag, list]) => {
    // diff-filter の結果を { fixed, upload, rename } に再分配し JSON に書き出す
    const diffAsFilterMode = getDecomojiDiffAsFilterMode(list, tag);
    writeJsonFile(diffAsFilterMode, `configs/${v(tag)}.json`);
    return diffAsFilterMode;
  })
  .forEach((diffAsFilterMode) => {
    // diffAsFilterMode からバージョンを統合して { basic, extra, explicit } に再分配する
    const diffAsCategory = getDecomojiDiffAsCategory(diffAsFilterMode);
    // Seeds に差分をマージしてまとめる
    Seeds.categories = getMergedDiffOfCategories(diffAsCategory, Seeds.categories);
    Seeds.manages = getMergedDiffOfManages(diffAsFilterMode, Seeds.manages);
  });

// Seeds.categoriesから v5_all.json, v5_basic.json, v5_extra.json, v5_explicit.json を作る
Object.entries(Seeds.categories).forEach(async ([category, list]) => {
  if (list.length < 1) return;
  const _list = (
    category === "all"
      ? [...list, ...ADDITIONALS.basic, ...ADDITIONALS.extra, ...ADDITIONALS.explicit]
      : [...list, ...ADDITIONALS[category]]
  )
    .filter(({ removed }) => !removed)
    .sort((a, b) => a.name.localeCompare(b.name));
  await writeJsonFile(_list, `configs/${v(TAG_PREFIX)}_${category}.json`);
});

// Seeds.managesから v5_fixed.json, v5_rename.json を作る
Object.entries(Seeds.manages).forEach(async ([manage, list]) => {
  const _list = (manage === "rename" ? list.concat(ADDITIONALS.rename) : list).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  await writeJsonFile(_list, `configs/${v(TAG_PREFIX)}_${manage}.json`);
});
