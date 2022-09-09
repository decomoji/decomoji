const writeJsonFileSync = require("./writeJsonFileSync");
const getFormatedDateTime = require("./getFormatedDateTime");

const outputResultJson = (data, name, INVOKER) => {
  writeJsonFileSync(
    data,
    `./configs/_${INVOKER}_tmp_${name}_${getFormatedDateTime()}.json`
  );
  Object.keys(data).forEach((key) => {
    console.log(`${key}: ${data[key].length}`);
  });
};

module.exports = outputResultJson;
