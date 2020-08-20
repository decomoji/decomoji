const path = require("path");

// ファイルパスから拡張子なしのファイル名を返す
const convertFilepathToBasename = (filepath) => {
  return path.basename(filepath).split(".")[0];
};

module.exports = convertFilepathToBasename;
