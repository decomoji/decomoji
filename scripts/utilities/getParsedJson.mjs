import fs from "fs/promises";
import { getRootPath } from "./getRootPath.mjs";

// JSON を読み込んでパースする
// パスはリポジトリのルート基準で解決されるので、書き出し側（writeJsonFile）と基準が揃う
export const getParsedJson = async (filepath) => {
  try {
    return JSON.parse(await fs.readFile(getRootPath(filepath), "utf8"));
  } catch (error) {
    // 読めなかった時にどのファイルの話か分からないと直しようがないので、パスを添えて投げ直す
    throw new Error(`[ERROR]JSON を読めませんでした: ${filepath}\n${error.message}`, {
      cause: error,
    });
  }
};
