import { writeJsonFile } from "./writeJsonFile.mjs";

// 実行結果を logs/ に残す
// history.json は常に最新の実行結果で上書きし、実行日時をファイル名に持つ履歴も同時に残す
export const outputHistoryJson = async (params) => {
  await writeJsonFile(params, "logs/history.json");
  await writeJsonFile(params, `logs/history_${params.timestamp}.json`);
};
