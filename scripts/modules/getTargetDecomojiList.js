/** @typedef {"basic" | "extra" | "explicit"} Category; */

const fs = require("fs");

/** @param {Category[]} categories */
const getTargetDecomojiList = async (categories) => {
  // ディレクトリをさらってファイル名の配列を返す
  const targetDecomojiList = await Promise.all(categories.map((category) => {
    return fs.readdirSync(`./decomoji/${category}/`);
  }));
  // 二次元配列を flat 化しつつ、 .DS_Store は取り除く
  return targetDecomojiList.flat().filter(v => v !== ".DS_Store");
};

module.exports = getTargetDecomojiList;