const fs = require("fs");
const diffsDir = "./diffs/";

const getLocalJson = (targets, LOG) => {
  const localJson = targets
    .map((target) => {
      return JSON.parse(fs.readFileSync(`${diffsDir}${target}.json`, "utf8"));
    })
    .flat();
  LOG && console.log("localJson:", localJson, localJson.length);
  return localJson;
};
module.exports = getLocalJson;
