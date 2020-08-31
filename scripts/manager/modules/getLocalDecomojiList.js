const fs = require("fs");
const convertFilepathToBasename = require("../../utilities/convertFilepathToBasename");

const getLocalDecomojiList = (targets, LOG) => {
  // ディレクトリをさらってファイルパスとファイル名の配列を返す
  const localDecomojiList = targets
    .map((target) => {
      const dir = `./decomoji/${target}/`;
      const list = fs.readdirSync(dir).filter((v) => {
        return /.+\.(png|gif|jpg|jpeg)$/.test(v);
      });
      return list.map((file) => {
        const name = convertFilepathToBasename(file);
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
