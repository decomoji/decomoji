const isStringOfNotEmpty = require("./isStringOfNotEmpty");

// 配列のアイテムを小文字に変換して返す。文字列でない場合は何もしない
const convertToLowerCasedArray = (array) => {
  return array.map((item) => {
    return isStringOfNotEmpty(item) ? item.toLowerCase() : item;
  });
};

module.exports = convertToLowerCasedArray;
