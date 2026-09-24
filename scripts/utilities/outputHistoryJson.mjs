import fs from "fs/promises";
import { join } from "path";
import { getRootPath } from "./getRootPath.mjs";
import { writeJsonFile } from "./writeJsonFile.mjs";

// 実行ごとの履歴を残す上限
// 何回前まで遡れれば足りるか次第だが、無限に抱えても仕方がない
const MAX_HISTORY_FILES = 30;

// ファイル名に使えない文字を落とす
// ISO 8601 のコロンは Windows ではファイル名に使えず、macOS でも Finder では / に見える
// 桁が固定なので、置き換えても名前順＝日時順のままになる
const toFilenameSafeTimestamp = (timestamp) => String(timestamp).replaceAll(":", "-");

// 増えすぎた履歴を古いものから消す
// 掃除に失敗しても実行そのものは成功しているので、知らせるだけで止めない
const pruneHistoryFiles = async () => {
  try {
    const directory = getRootPath("logs");
    const files = (await fs.readdir(directory))
      .filter((name) => name.startsWith("history_") && name.endsWith(".json"))
      .sort();

    await Promise.all(
      files
        .slice(0, -MAX_HISTORY_FILES)
        .map((name) => fs.rm(join(directory, name), { force: true })),
    );
  } catch (error) {
    console.warn(`古い履歴を消せませんでした: ${error.message}`);
  }
};

// 実行結果を logs/ に残す
// history.json は常に最新の実行結果で上書きし、実行日時をファイル名に持つ履歴も同時に残す
export const outputHistoryJson = async (params) => {
  await writeJsonFile(params, "logs/history.json");
  await writeJsonFile(params, `logs/history_${toFilenameSafeTimestamp(params.timestamp)}.json`);
  await pruneHistoryFiles();
};
