const fs = require("fs");

// fs.writeFileSync() を try catch する
const writeJsonFileSync = (buffer, filepath, silent) => {
  try {
    fs.writeFileSync(`${filepath}`, JSON.stringify(buffer, null, 2));
    !silent && console.log(`${filepath} has been saved!`);
  } catch (err) {
    throw err;
  }
};

module.exports = writeJsonFileSync;
