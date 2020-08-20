const { execSync } = require("child_process");
const convertBufferToArray = require("./convertBufferToArray");

// git で from と to の差分を mode で diff-filter した結果を配列を返す
const getGitDiffArray = (from, to, mode) => {
  const resultBuffer = execSync(
    `git diff ${from}...${to} --name-only --diff-filter=${mode}`
  );
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer);
};

module.exports = getGitDiffArray;
