import fs from "fs/promises";
import { relative } from "path";
import { getRootPath } from "./getRootPath.mjs";

// fs.writeFile() を try catch する
// パスはリポジトリのルート基準で解決されるので、読み込み側（getParsedJson）と基準が揃う
export const writeJsonFile = async (buffer, filepath) => {
  const absolutePath = getRootPath(filepath);
  // 標準出力に流すのはルートからの相対パスにしておく
  const displayPath = relative(getRootPath(), absolutePath);

  try {
    const data = JSON.stringify(buffer, null, 2);
    await fs.writeFile(absolutePath, data).catch((error) => {
      console.error(error);
      throw error;
    });

    const parsedData = JSON.parse(data);
    const parsedDataType = Object.prototype.toString.call(parsedData);
    switch (parsedDataType) {
      case "[object Array]":
        console.log(`${displayPath}, ${parsedData.length}`);
        break;
      case "[object Object]":
        Object.keys(parsedData).forEach((key) => {
          const value = parsedData[key];
          // 配列なら件数を、それ以外は値そのものを出す
          console.log(
            `${displayPath}, ${key.padEnd(6)}: ${Array.isArray(value) ? value.length : value}`,
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
