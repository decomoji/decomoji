const fs = require("fs");
const toBasename = require("../../utilities/toBasename");

const getLocalDecomojiList = (categories) => {
  // ディレクトリをさらってファイルパスとファイル名の配列を返す
  return categories
    .map((category) => {
      const dir = `./decomoji/${category}/`;
      const list = fs.readdirSync(dir).filter((v) => {
        return /.+\.(png|gif|jpg|jpeg)$/.test(v);
      });
      return list.map((file) => {
        const name = toBasename(file);
        const path = `${dir}${file}`;
        return {
          path,
          name,
        };
      });
    })
    .flat();
};
module.exports = getLocalDecomojiList;
