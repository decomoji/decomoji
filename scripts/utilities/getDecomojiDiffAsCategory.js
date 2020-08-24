const getDecomojiCategory = require("./getDecomojiCategory");

// `getDecomojiDiffAsFilterMode()` の結果からバージョンを統合して { basic, extra, explicit } に再分配したオブジェクトを返す
const getDecomojiDiffAsCategory = (diffAsMode) => {
  const categories = {
    basic: [],
    explicit: [],
    extra: [],
    root: [],
  };
  Object.entries(diffAsMode).forEach((entry) => {
    const [filterMode, list] = entry;
    list.forEach((decomoji) => {
      if (filterMode === "rename") {
        return;
      }
      const categoryName = getDecomojiCategory(decomoji.path);
      const category = categories[categoryName];
      const indexOfCategory = category.findIndex(
        (v) => v.name === decomoji.name
      );
      // 同じ名前があったらマージして置き換える
      if (indexOfCategory > -1) {
        category.splice(indexOfCategory, 1, {
          ...category[indexOfCategory],
          ...decomoji,
        });
      } else {
        category.push(decomoji);
      }
    });
  });
  return categories;
};

module.exports = getDecomojiDiffAsCategory;
