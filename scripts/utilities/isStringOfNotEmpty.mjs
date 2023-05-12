// 値が空ではない文字列であるか否か
export const isStringOfNotEmpty = (value) =>
  Object.prototype.toString.call(value) === "[object String]" &&
  value.length > 0;
