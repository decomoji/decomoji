const { execSync } = require("child_process");
const convertBufferToArray = require("./convertBufferToArray");

// タグとタギングした日付を返す
const getGitTaggingDateArray = () => {
  const cmd =
    'git for-each-ref --format="%(refname:short) %(taggerdate) %(authordate)" refs/tags';
  const resultBuffer = execSync(cmd);
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer);
};

module.exports = getGitTaggingDateArray;
