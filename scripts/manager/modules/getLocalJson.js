const fs = require("fs");
const configsDir = "./configs/";

const getLocalJson = (targets, TERM, KEYS, LOG) => {
  // カテゴリータームでは [tag1, tag2]、バージョンタームでは [[tag1, tag2], [tag3, tag4]] で渡ってくるのでどちらとも構わず平たくする
  const json = targets
    .flat()
    .flatMap((target) =>
      JSON.parse(fs.readFileSync(`${configsDir}${target}.json`, "utf8"))
    );
  const formattedJson =
    TERM === "category"
      ? json
      : KEYS.flatMap((key) => json.flatMap((item) => item[key]));
  LOG && console.log("formattedJson:", formattedJson, formattedJson.length);
  return formattedJson;
};
module.exports = getLocalJson;
