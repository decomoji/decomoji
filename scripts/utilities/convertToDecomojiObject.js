const convertFilepathToBasename = require("./convertFilepathToBasename");

// デコモジファインダー用のフォーマットに変換する
const convertToDecomojiObject = (path, tag, mode) => {
  return {
    name: convertFilepathToBasename(path),
    path,
    ...(mode === "upload" ? { created: tag } : {}),
    ...(mode === "modify" ? { updated: tag } : {}),
    ...(mode === "delete" ? { removed: tag } : {}),
  };
};

module.exports = convertToDecomojiObject;
