// ファイル名がデコモジかどうか返す
const isDecomojiFile = (file) => {
  return /decomoji\/.*\.png/.test(file);
};

module.exports = isDecomojiFile;
