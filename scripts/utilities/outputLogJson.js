const writeJsonFileSync = require("./writeJsonFileSync");
const getFormatedDateTime = require("./getFormatedDateTime");

const outputLogJson = (data, name, INVOKER) => {
  const filename = `_${INVOKER}_tmp_${name}_${getFormatedDateTime()}.json`;
  writeJsonFileSync(data, `./configs/${filename}`);
  console.log(`${filename} length:`, data.length);
};

module.exports = outputLogJson;
