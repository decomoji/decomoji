const writeJsonFileSync = require("./writeJsonFileSync");

const outputResultJson = (data, name, INVOKER) => {
  writeJsonFileSync(data, `./configs/_${INVOKER}_tmp_${name}.json`);
  Object.keys(data).forEach((key) => {
    console.log(`${key}: ${data[key].length}`);
  });
};

module.exports = outputResultJson;
