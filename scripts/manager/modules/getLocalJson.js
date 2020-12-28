const fs = require("fs");
const configsDir = "./configs/";

const getLocalJson = (targets, TERM, KEY, LOG) => {
  // カテゴリータームでは [tag1, tag2]、バージョンタームでは [[tag1, tag2], [tag3, tag4]] で渡ってくるのでどちらとも構わず平たくする
  const json = targets
    .flat()
    .flatMap((target) =>
      JSON.parse(fs.readFileSync(`${configsDir}${target}.json`, "utf8"))
    );
  const formattedJson =
    TERM === "category" ? json : json.flatMap((item) => item[KEY]);
  LOG && console.log("formattedJson:", formattedJson, formattedJson.length);
  return formattedJson;
};
module.exports = getLocalJson;
