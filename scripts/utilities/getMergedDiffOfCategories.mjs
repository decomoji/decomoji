// categories にデコモジオブジェクトを push （場合によってはアイテムをマージ）し、オブジェクトを返す
export const getMergedDiffOfCategories = (diffAsCategory, categories) => {
  const _categories = categories;
  Object.entries(diffAsCategory).forEach((entry) => {
    const [categoryName, list] = entry;
    list.forEach((decomoji) => {
      // カテゴリー別に配列に格納する
      const category = _categories[categoryName];
      const indexOfCategory = category.findIndex(
        (v) => v.name === decomoji.name
      );
      if (indexOfCategory > -1) {
        // 同じ名前があったらマージして置き換える
        category.splice(indexOfCategory, 1, {
          ...category[indexOfCategory],
          ...decomoji,
        });
      } else {
        category.push(decomoji);
      }
      // 全リストにも格納する
      const all = _categories["all"];
      const indexOfAll = all.findIndex((v) => v.name === decomoji.name);
      if (indexOfAll > -1) {
        // 同じ名前があったらマージして置き換える
        all.splice(indexOfAll, 1, { ...all[indexOfAll], ...decomoji });
      } else {
        all.push(decomoji);
      }
    });
  });
  return _categories;
};
