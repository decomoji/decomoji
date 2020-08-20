const convertFilepathToBasename = require("./convertFilepathToBasename");

// デコモジファインダー用のフォーマットに変換する
const convertToFinderObject = (path, tag, add) => {
  return {
    name: convertFilepathToBasename(path),
    path: `./${path}`,
    ...(add ? { created_ver: tag } : { update_ver: tag }),
  };
};

module.exports = convertToFinderObject;
