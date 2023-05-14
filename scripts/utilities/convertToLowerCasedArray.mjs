import { isStringOfNotEmpty } from "./isStringOfNotEmpty.mjs";

// 配列のアイテムを小文字に変換して返す。文字列でない場合は何もしない
export const convertToLowerCasedArray = (array) =>
  array.map((item) => (isStringOfNotEmpty(item) ? item.toLowerCase() : item));
