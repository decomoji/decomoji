// 配列のアイテムが1つ以上あるか否か、否の場合エラーメッセージを返す
export const isSelects = (selection) =>
  selection.length ? true : "Choice required.";
