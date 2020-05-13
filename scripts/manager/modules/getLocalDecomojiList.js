const fs = require("fs");

const getLocalDecomojiList = (categories) => {
  // ディレクトリをさらってファイルパスとファイル名の配列を返す
  return categories
    .map((category) => {
      const dir = `./decomoji/${category}/`;
      const list = fs.readdirSync(dir).filter((v) => {
        return /.+\.(png|gif|jpg|jpeg)$/.test(v);
      });
      return list.map((file) => {
        const name = file.split(".")[0];
        const path = `${dir}${file}`;
        return {
          path,
          name,
        };
      });
    })
  }).flat();
};
module.exports = getLocalDecomojiList;
