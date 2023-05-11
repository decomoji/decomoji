import { getGitTagArray } from "./getGitTagArray";

// git のタグ一覧において自身と次のバージョンのペアオブジェクトを配列で返す
export const getGitTagPairArray = (start, versionPrefix, end) => {
  const tagArray = getGitTagArray(versionPrefix);
  const tags = start ? [start, ...tagArray] : tagArray;
  return tags.reduce((memo, from, i, versions) => {
    const next = versions[i + 1];
    const to = next ? next : end;
    return to ? [...memo, { from, to }] : memo;
  }, []);
};
