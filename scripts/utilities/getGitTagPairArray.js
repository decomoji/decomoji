const getGitTagArray = require("./getGitTagArray");

// git のタグ一覧において自身と次のバージョンのペアオブジェクトを配列で返す
const getGitTagPairArray = (versionPrefix, start) => {
  const tagArray = getGitTagArray(versionPrefix);
  const tags = start ? [start, ...tagArray] : tagArray;
  return tags.reduce((memo, cr, i, versions) => {
    const next = versions[i + 1];
    const from = cr;
    const to = next;
    return next ? [...memo, { from, to }] : memo;
  }, []);
};

module.exports = getGitTagPairArray;
