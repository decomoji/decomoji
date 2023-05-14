import { execSync } from "child_process";
import { convertBufferToArray } from "./convertBufferToArray.mjs";
import { getGitTagArray } from "./getGitTagArray.mjs";

// git で rename したものの from と to の差分を返す
// to がない場合、from だけで差分を取得して返す。
export const getGitDiffOfRenameArray = (from, to) => {
  const cmd = getGitTagArray().includes(to)
    ? `git diff ${from}...${to} --name-status --diff-filter=R`
    : `git diff ${from} --name-status --diff-filter=R`;
  const resultBuffer = execSync(cmd);
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer).map((v) =>
    v.replace("R100\t", "").split("\t")
  );
};
