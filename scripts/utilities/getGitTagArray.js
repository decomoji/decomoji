const { execSync } = require("child_process");
const convertBufferToArray = require("./convertBufferToArray");

// git でタグ一覧を配列で返す
const getGitTagArray = (versionPrefix) => {
  const cmd = versionPrefix
    ? `git tag --list | sort -V | grep -E ^${versionPrefix}`
    : "git tag --list | sort -V ";
  const resultBuffer = execSync(cmd);
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer);
};

module.exports = getGitTagArray;
