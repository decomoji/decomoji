const { execSync } = require("child_process");
const convertBufferToArray = require("./convertBufferToArray");
const getGitTagArray = require("./getGitTagArray");

// git で rename したものの from と to の差分を返す
// to がない場合、from だけで差分を取得して返す。
const getGitDiffOfRenameArray = (from, to) => {
  const cmd = getGitTagArray().includes(to)
    ? `git diff ${from}...${to} --name-status --diff-filter=R`
    : `git diff ${from} --name-status --diff-filter=R`;
  const resultBuffer = execSync(cmd);
  if (!resultBuffer) return;
  return convertBufferToArray(resultBuffer).map((v) =>
    v.replace("R100\t", "").split("\t")
  );
};

module.exports = getGitDiffOfRenameArray;
