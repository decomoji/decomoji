// ファイル名から拡張子を除いた名前を返す
const toBasename = (filename) => {
  return filename.split(".")[0];
};

module.exports = toBasename;
