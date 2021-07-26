const fs = require("fs");

const writeJsonFileSync = require("./writeJsonFileSync");

const outputLogJson = (data, name, INVOKER) => {
  writeJsonFileSync(data, `./configs/_${INVOKER}_tmp_${name}.json`);
  console.log(`_${INVOKER}_tmp_${name}.json length:`, data.length);
};

module.exports = outputLogJson;
