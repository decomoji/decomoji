const fs = require("fs");

// ファイル名がデコモジかどうか返す
const writeJsonFileSync = (buffer, filename) => {
  try {
    fs.writeFileSync(
      `./scripts/manager/configs/${filename}.json`,
      JSON.stringify(buffer)
    );
    console.log(`${filename}.json has been saved!`);
  } catch (err) {
    throw err;
  }
};

module.exports = writeJsonFileSync;
