import fs from "fs";

// fs.writeFileSync() を try catch する
export const writeJsonFileSync = (buffer, filepath, silent) => {
  try {
    const data = JSON.stringify(buffer, null, 2);
    fs.writeFileSync(`${filepath}`, data);
    !silent &&
      console.log(`${filepath}(length: ${data.length}) has been saved!`);
  } catch (err) {
    throw err;
  }
};
