import path from "path";

// ファイルパスから拡張子なしのファイル名を返す
export const convertFilepathToBasename = (filepath) => {
  return path.basename(filepath).split(".")[0];
};
