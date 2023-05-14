import fs from "fs/promises";

// fs.writeFileSync() を try catch する
export const writeJsonFile = async (buffer, filepath) => {
  try {
    const data = JSON.stringify(buffer, null, 2);
    await fs.writeFile(`${filepath}`, data).catch((error) => {
      console.error(error);
      throw error;
    });
    console.log(`${filepath}(length: ${data.length}) has been saved!`);
  } catch (error) {
    console.error(error);
    throw error;
  }
};