import fs from "fs/promises";
import {
  getParsedSemVerObject,
  isStringOfNotEmpty,
} from "../../utilities/index.mjs";

export const curator = async () => {
  // history.json があれば読み込む
  const history = fs.existsSync("../logs/histor.json")
    ? await getParsedJson("../logs/histor.json")
    : { version: "5.99.99" };
  const database = await getParsedJson("../database/v6.json");

  // curator 関数の文脈では history.version よりデコモジの created か updated が新しい場合にfilterすべきとして true を返す
  const shouldBeFiltered = ({ current, history }) => {
    // current.major が大きいなら true
    if (current.major > history.major) return true;
    // major が同じなら minor を見る
    if (current.major === history.major && current.minor > history.minor)
      return true;
    // major と minor が同じなら patch を見る
    if (
      current.major === history.major &&
      current.minor === history.minor &&
      current.patch > history.patch
    )
      return true;
    // それ以外は false
    return false;
  };

  // history の version より新しいデコモジだけを抽出して返す
  const getCuratedDecomojis = (historyVersion) =>
    database.decomojis
      .map((item, i) =>
        // TODO: この map の処理はテストなので後で消す
        i % 5 === 0
          ? { ...item, updated: "5.23.0" }
          : i % 7 === 0
            ? { ...item, updated: "6.0.0" }
            : i % 13 === 0
              ? { ...item, created: "6.0.0" }
              : item,
      )
      .filter(({ created, updated }) =>
        shouldBeFiltered({
          current: getParsedSemVerObject(
            isStringOfNotEmpty(updated) ? updated : created,
          ),
          history: getParsedSemVerObject(historyVersion),
        }),
      );

  return getCuratedDecomojis(history.version);
};
