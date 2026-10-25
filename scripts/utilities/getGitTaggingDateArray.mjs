import { execSync } from "child_process";
import { convertBufferToArray } from "./convertBufferToArray.mjs";

// タグとタギングした日付を返す
// ZIP でダウンロードした場合など git リポジトリでない時は空配列を返す
export const getGitTaggingDateArray = () => {
  const cmd = 'git for-each-ref --format="%(refname:short) %(taggerdate) %(authordate)" refs/tags';
  try {
    // git のエラーメッセージは表示しない
    const resultBuffer = execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] });
    return convertBufferToArray(resultBuffer);
  } catch {
    return [];
  }
};
