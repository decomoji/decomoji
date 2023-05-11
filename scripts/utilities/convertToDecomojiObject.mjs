import { convertFilepathToBasename } from "./convertFilepathToBasename.mjs";

// デコモジファインダー用のフォーマットに変換する
export const convertToDecomojiObject = (path, tag, mode) => {
  return {
    name: convertFilepathToBasename(path),
    category: /.+\/(.+)\//.exec(path)[1],
    path,
    ...(mode === "upload" ? { created: tag } : {}),
    ...(mode === "modify" ? { updated: tag } : {}),
    ...(mode === "delete" ? { removed: tag } : {}),
  };
};
