const { execSync } = require("child_process");
const convertBufferToArray = require("./convertBufferToArray");

// git で rename したものの from と to の差分を返す
const getGitDiffOfRenameArray = (from, to) => {
  const resultBuffer = execSync(
    `git diff ${from}...${to} --name-status --diff-filter=R`
  );
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer).map((v) =>
    v.replace("R100\t", "").split("\t")
  );
};

module.exports = getGitDiffOfRenameArray;
