const isStringOfNotEmpty = require("./isStringOfNotEmpty");
const MESSAGE = require("../configs/MESSAGES");

// 値が空ではない文字列であるか否か、否の場合エラーメッセージを返す
const isInputs = (value) => {
  return isStringOfNotEmpty(value) ? true : MESSAGE.NO_INPUT_VALUE;
};

module.exports = isInputs;
