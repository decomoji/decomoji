const fs = require("fs");
const configsDir = "./configs/";
const writeJsonFileSync = require("../../utilities/writeJsonFileSync");

const getLocalJson = (targets, TERM, KEYS, INVOKER, LOG) => {
  LOG && console.log("getLocalJson(", { targets, TERM, INVOKER, KEYS }, ")");
  // カテゴリータームでは [tag1, tag2]、バージョンタームでは [[tag1, tag2], [tag3, tag4]] で渡ってくるのでどちらとも構わず平たくする
  const combined = targets
    .flat()
    .flatMap((target) =>
      JSON.parse(fs.readFileSync(`${configsDir}${target}.json`, "utf8"))
    );
  LOG && writeJsonFileSync(combined, `./configs/_${INVOKER}_tmp_combined.json`);
  const filtered =
    TERM === "version"
      ? KEYS.flatMap((key) => combined.flatMap((item) => item[key]))
      : combined;
  LOG && writeJsonFileSync(filtered, `./configs/_${INVOKER}_tmp_flatten.json`);
  return filtered;
};
module.exports = getLocalJson;
