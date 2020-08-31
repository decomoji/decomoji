const { execSync } = require("child_process");
const convertBufferToArray = require("./convertBufferToArray");
const getGitTagArray = require("./getGitTagArray");

// git で from と to の差分を mode で diff-filter した結果を配列を返す。
// to がない場合、from だけで差分を取得して返す。
const getGitDiffArray = (from, to, mode) => {
  const cmd = getGitTagArray().includes(to)
    ? `git diff ${from}...${to} --name-only --diff-filter=${mode}`
    : `git diff ${from} --name-only --diff-filter=${mode}`;
  const resultBuffer = execSync(cmd);
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer);
};

module.exports = getGitDiffArray;
