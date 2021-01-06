const fs = require("fs");
const configsDir = "./configs/";

const getLocalJson = (targets, TERM, KEYS, LOG) => {
  // カテゴリータームでは [tag1, tag2]、バージョンタームでは [[tag1, tag2], [tag3, tag4]] で渡ってくるのでどちらとも構わず平たくする
  const combined = targets
    .flat()
    .flatMap((target) =>
      JSON.parse(fs.readFileSync(`${configsDir}${target}.json`, "utf8"))
    );
  const filtered =
    TERM === "version"
      ? KEYS.flatMap((key) => combined.flatMap((item) => item[key]))
      : combined;
  LOG && console.log("formattedJson:", formattedJson, formattedJson.length);
  return filtered;
};
module.exports = getLocalJson;
