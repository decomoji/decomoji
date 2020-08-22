const convertFilepathToBasename = require("./convertFilepathToBasename");

// デコモジファインダー用のフォーマットに変換する
const convertToDecomojiObject = (path, tag, upload) => {
  return {
    name: convertFilepathToBasename(path),
    path,
    ...(upload ? { created_ver: tag } : { update_ver: tag }),
  };
};

module.exports = convertToDecomojiObject;
