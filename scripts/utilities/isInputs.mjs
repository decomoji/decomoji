import { isStringOfNotEmpty } from "./isStringOfNotEmpty.mjs";

// 値が空ではない文字列であるか否か、否の場合エラーメッセージを返す
export const isInputs = (value) =>
  isStringOfNotEmpty(value) ? true : "Input required.";
