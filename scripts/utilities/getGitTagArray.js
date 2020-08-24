const { execSync } = require("child_process");
const convertBufferToArray = require("./convertBufferToArray");

// git でタグ一覧を配列で返す
const getGitTagArray = (versionPrefix) => {
  const resultBuffer = versionPrefix
    ? execSync(`git tag --list | grep -E ^${versionPrefix}`)
    : execSync("git tag --list");
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer);
};

module.exports = getGitTagArray;
