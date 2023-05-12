import path from "path";

// ファイルパスから拡張子なしのファイル名を返す
export const convertFilepathToBasename = (filepath) =>
  path.parse(filepath).name;
