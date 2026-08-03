import fs from "fs/promises";

// fs.writeFileSync() を try catch する
export const writeJsonFile = async (buffer, filepath) => {
  try {
    const data = JSON.stringify(buffer, null, 2);
    await fs.writeFile(`${filepath}`, data).catch((error) => {
      console.error(error);
      throw error;
    });

    const parsedData = JSON.parse(data);
    const parsedDataType = Object.prototype.toString.call(parsedData);
    switch (parsedDataType) {
      case "[object Array]":
        console.log(`${filepath}, ${parsedData.length}`);
        break;
      case "[object Object]":
        Object.keys(parsedData).forEach((key) => {
          const value = parsedData[key];
          // 配列なら件数を、それ以外は値そのものを出す
          console.log(
            `${filepath}, ${key.padEnd(6)}: ${Array.isArray(value) ? value.length : value}`,
          );
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
