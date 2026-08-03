import { isStringOfNotEmpty } from "./isStringOfNotEmpty.mjs";

// デコモジのデータから Slack に登録する絵文字名を作る
// 表記・訓令式・ヘボン式を繋ぐことで「意図」と「糸」のような同音異義語の衝突を避け、
// どの読み方で検索してもヒットするようにする
// 例) { name: "安心", kunnrei: "annsinn", hepburn: "anshin" }       -> "安心_annsinn_anshin"
// 例) { name: "よかった", kunnrei: "yokatta", hepburn: "" }          -> "よかった_yokatta"
// 例) { name: "CSSISAWESOME", kunnrei: "cssisawesome", hepburn: "" } -> "cssisawesome"
export const getDecomojiName = ({ id, name, kunnrei, hepburn }) =>
  // 記号を含む id は name に置換済みのものが入っているので name を優先する
  [isStringOfNotEmpty(name) ? name : id, kunnrei, hepburn]
    .filter(isStringOfNotEmpty)
    .map((value) => value.toLowerCase())
    // 表記がラテン文字の場合など、同じ文字列になるものは重ねない
    .filter((value, i, values) => values.indexOf(value) === i)
    .join("_");
