const fs = require("fs");
const configsDir = "./scripts/manager/configs/";

const getLocalJson = (targets, mode, LOG) => {
  const opt = mode === "alias" ? "alias/" : "list/";
  const localJson = targets
    .map((target) => {
      return JSON.parse(
        fs.readFileSync(`${configsDir}${opt}${target}.json`, "utf8")
      );
    })
    .flat();
  LOG && console.log(`localJson(${localJson.length}): ${localJson}`);
  return localJson;
};
module.exports = getLocalJson;
