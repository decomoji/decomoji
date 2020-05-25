const fs = require("fs");

const getLocalJson = (path, LOG) => {
  const localJson = JSON.parse(fs.readFileSync(path, "utf8"));
  LOG && console.log(`localJson(${localJson.length}): ${localJson}`);
  return localJson;
};
module.exports = getLocalJson;
