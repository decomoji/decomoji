import { getParsedJson } from "../../utilities/getParsedJson.mjs";
import { outputLogJson } from "../../utilities/outputLogJson.mjs";

export const getConfigJson = async ({ CONFIGS, TERM, KEYS, INVOKER, LOG }) => {
  LOG && console.log("getConfigJson(", { CONFIGS, TERM, KEYS, INVOKER }, ")");
  const combined = await Promise.all(
    CONFIGS.map(
      async (name) => await getParsedJson(`../../configs/${name}.json`),
    ),
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
      : combined.flat();
  LOG &&
    (await outputLogJson({
      data: flatten,
      invoker: INVOKER,
      name: "flatten",
    }));
  return flatten;
};
