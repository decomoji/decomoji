import { execSync } from "child_process";
import { convertBufferToArray } from "./convertBufferToArray";

// タグとタギングした日付を返す
export const getGitTaggingDateArray = () => {
  const cmd =
    'git for-each-ref --format="%(refname:short) %(taggerdate) %(authordate)" refs/tags';
  const resultBuffer = execSync(cmd);
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer);
};
