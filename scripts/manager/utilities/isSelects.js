// 配列のアイテムが1つ以上あるか否か、否の場合エラーメッセージを返す
const isSelects = (selection) => {
  return selection.length ? true : "Choice required.";
};

module.exports = isSelects;
