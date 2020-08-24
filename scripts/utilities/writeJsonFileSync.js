const fs = require("fs");

// ファイル名がデコモジかどうか返す
const writeJsonFileSync = (buffer, filepath) => {
  try {
    fs.writeFileSync(`${filepath}`, JSON.stringify(buffer));
    console.log(`${filepath} has been saved!`);
  } catch (err) {
    throw err;
  }
};

module.exports = writeJsonFileSync;
