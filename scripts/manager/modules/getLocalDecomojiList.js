const fs = require("fs");

/** @param {("basic" | "extra" | "explicit")[]} categories */
const getLocalDecomojiList = (categories) => {
  // ディレクトリをさらってファイルパス、カテゴリ、名前の配列を返す
  return categories
    .map((category) => {
      const dir = `./decomoji/${category}/`;
      const list = fs.readdirSync(dir).filter((v) => v !== ".DS_Store");
      return list.map((file) => {
        const name = file.split(".")[0];
        const path = `${dir}${file}`;
        return {
          path,
          name,
          category,
        };
      });
    })
    .flat();
};

module.exports = getLocalDecomojiList;
