// デコモジのカテゴリー名を返す
const getDecomojiCategory = (filepath) => {
  return filepath.split("/")[1];
};

module.exports = getDecomojiCategory;
