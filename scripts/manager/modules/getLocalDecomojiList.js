const fs = require("fs");
const toBasename = require("../../utilities/toBasename");

const getLocalDecomojiList = (targets, LOG) => {
  // ディレクトリをさらってファイルパスとファイル名の配列を返す
  const localDecomojiList = targets
    .map((target) => {
      const dir = `./decomoji/${target}/`;
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
  LOG &&
    console.log(
      "localDecomojiList:",
      localDecomojiList,
      localDecomojiList.length
    );
  return localDecomojiList;
};
module.exports = getLocalDecomojiList;
