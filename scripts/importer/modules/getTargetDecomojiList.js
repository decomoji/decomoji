/** @typedef {"basic" | "extra" | "explicit"} Category; */

const fs = require("fs");

/** @param {Category[]} categories */
const getTargetDecomojiList = async (categories) => {
  // ディレクトリをさらってファイル名の配列を返す
  const targetDecomojiList = await Promise.all(
    categories.map((category) => {
      // .DS_Store を取り除いたものを返す
      return fs.readdirSync(`./decomoji/${category}/`).filter((v) => v !== ".DS_Store");
    })
  );
  // categories の順番ごとに二次元配列になっているのでそのまま返す
  return targetDecomojiList;
};

module.exports = getTargetDecomojiList;
