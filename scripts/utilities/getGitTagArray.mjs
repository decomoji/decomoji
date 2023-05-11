import { execSync } from "child_process";
import { convertBufferToArray } from "./convertBufferToArray.mjs";

// git でタグ一覧を配列で返す
export const getGitTagArray = (versionPrefix) => {
  const cmd = versionPrefix
    ? `git tag --list | sort -V | grep -E ^${versionPrefix}`
    : "git tag --list | sort -V ";
  const resultBuffer = execSync(cmd);
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer);
};
