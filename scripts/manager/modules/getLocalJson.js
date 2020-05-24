const fs = require("fs");

const getLocalJson = (path) => {
  return JSON.parse(fs.readFileSync(path, "utf8"));
};
module.exports = getLocalJson;
