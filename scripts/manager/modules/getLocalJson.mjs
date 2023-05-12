import { getParsedJson } from "../../utilities/getParsedJson.mjs";
import { outputLogJson } from "../../utilities/outputLogJson.mjs";

export const getLocalJson = async (CONFIGS, TERM, KEYS, INVOKER, LOG) => {
  LOG && console.log("getLocalJson(", { CONFIGS, TERM, INVOKER, KEYS }, ")");
  // term=category では [tag1, tag2]、term=version では [[tag1, tag2], [tag3, tag4]] で CONFIGS が渡ってくるのでどちらとも構わず平たくする
  const combined = CONFIGS.flat().flatMap(
    async (target) => await getParsedJson(`../../configs/${target}.json`)
  );
  LOG &&
    (await outputLogJson({
      data: combined,
      invoker: INVOKER,
      name: "combined",
    }));
  // term=version の時、[{ "fixed": [...], "upload": [...], "rename": [...] }, { "fixed": [...], "upload": [...], "rename": [...] }, ...] という、
  // filterMode 別のオブジェクトが v5.x.y ごとに配列になっているので、これから KEYS のプロパティだけ抽出して平たくする
  const flatten =
    TERM === "version"
      ? KEYS.flatMap((key) => combined.flatMap((item) => item[key]))
      : combined;
  LOG &&
    (await outputLogJson({
      data: flatten,
      invoker: INVOKER,
      name: "flatten",
    }));
  return flatten;
};
