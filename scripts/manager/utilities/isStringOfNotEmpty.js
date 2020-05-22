// 値が空ではない文字列であるか否か
const isStringOfNotEmpty = (value) => {
  return (
    Object.prototype.toString.call(value) === "[object String]" &&
    value.length > 0
  );
};

module.exports = isStringOfNotEmpty;
