import { writeJsonFile } from "./writeJsonFile.mjs";

// 実行結果を logs/ に残す
// history.json は常に最新の実行結果で上書きし、実行日時をファイル名に持つ履歴も同時に残す
export const outputHistoryJson = async ({ data, timestamp }) => {
  await writeJsonFile(data, "logs/history.json");
  await writeJsonFile(data, `logs/history_${timestamp}.json`);
};
