const isStringOfNotEmpty = require("./isStringOfNotEmpty");

// 値が空ではない文字列であるか否か、否の場合エラーメッセージを返す
const isInputs = (value) => {
  return isStringOfNotEmpty(value) ? true : "Input required.";
};

module.exports = isInputs;
