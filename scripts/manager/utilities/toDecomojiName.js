// ファイル名からデコモジ名を返す
const toDecomojiName = (file) => {
  return file.split(".")[0];
};

module.exports = toDecomojiName;
