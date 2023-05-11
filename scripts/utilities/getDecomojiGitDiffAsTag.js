import { getGitDiffArray } from "./getGitDiffArray";
import { getGitDiffOfRenameArray } from "./getGitDiffOfRenameArray";
import { isDecomojiFile } from "./isDecomojiFile";

// diff-filter-mode をキーにして差分を配列で持つオブジェクトをタグごとに持ったオブジェクトを返す
export const getDecomojiGitDiffAsTag = (tagPairs) => {
  /**
   * {
   *  <tag>: {"upload: [...]", "modify": [...], "rename": [...], "delete": [...]},
   *  <tag>: {"upload: [...]", "modify": [...], "rename": [...], "delete": [...]},
   *  ...
   * }
   */
  return tagPairs.reduce((_log, { from, to }) => {
    const log = [
      { filterMode: "upload", symbol: "A" },
      { filterMode: "modify", symbol: "M" },
      { filterMode: "rename", symbol: "R" },
      { filterMode: "delete", symbol: "D" },
    ].reduce((_diff, { filterMode, symbol }) => {
      const diff =
        symbol === "R"
          ? getGitDiffOfRenameArray(from, to)
          : getGitDiffArray(from, to, symbol);
      const filterdDiff = diff.filter(isDecomojiFile);
      console.log(
        `Diff[ ${symbol} ][ ${from}...${to} ]: ${filterdDiff.length}`
      );
      // "<diff-filter-mode>": [<filepath>, <filepath>, ...]
      return {
        ..._diff,
        ...{ [filterMode]: filterdDiff },
      };
    }, {});
    console.log(`----------------------------------`);
    // { <tag>: {"upload: [...]", "modify": [...], "rename": [...], "delete": [...]}}
    return { ..._log, [to]: log };
  }, {});
};
