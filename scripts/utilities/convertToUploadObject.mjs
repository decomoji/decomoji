import { getDecomojiName } from "./getDecomojiName.mjs";
import { getDecomojiPath } from "./getDecomojiPath.mjs";

// database/v6.json のデコモジを uploader/remover が扱う { name, category, path } 形式に変換する
export const convertToUploadObject = (decomoji) => ({
  name: getDecomojiName(decomoji),
  category: decomoji.category,
  path: getDecomojiPath(decomoji),
});
