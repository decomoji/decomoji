import fs from "fs/promises";
import { getRootPath } from "./getRootPath.mjs";

// JSON を読み込んでパースする
// パスはリポジトリのルート基準で解決されるので、書き出し側（writeJsonFile）と基準が揃う
export const getParsedJson = async (filepath) => {
  try {
    return JSON.parse(await fs.readFile(getRootPath(filepath), "utf8"));
  } catch (e) {
    throw e;
  }
};
