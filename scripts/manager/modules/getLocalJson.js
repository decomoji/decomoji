const fs = require("fs");
const configsDir = "./scripts/manager/configs/";

const getLocalJson = (targets, LOG) => {
  const localJson = targets
    .map((target) => {
      return JSON.parse(fs.readFileSync(`${configsDir}${target}.json`, "utf8"));
    })
    .flat();
  LOG && console.log("localJson:", localJson, localJson.length);
  return localJson;
};
module.exports = getLocalJson;
