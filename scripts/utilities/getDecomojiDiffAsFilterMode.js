import { convertFilepathToBasename } from "./convertFilepathToBasename";
import { convertToDecomojiObject } from "./convertToDecomojiObject";
import { IGNORES } from "../models/constants";

// diff-filter の結果を { fixed, upload, rename } に再分配したオブジェクトを返す
export const getDecomojiDiffAsFilterMode = (diff, tag) => {
  const isFirstOfMajorVerison = /\.0\.0$/.test(tag);
  const upload = [];
  const fixed = [];
  const rename = [];
  Object.entries(diff).forEach((entry) => {
    const [filterMode, list] = entry;
    list.forEach((path) => {
      const A = filterMode === "upload";
      const M = filterMode === "modify";
      const D = filterMode === "delete";
      const R = filterMode === "rename";
      const decomoji = R ? {} : convertToDecomojiObject(path, tag, filterMode);

      // x.0.0 では upload と modify だけ扱う
      if (isFirstOfMajorVerison) {
        if (A || M) {
          upload.push(convertToDecomojiObject(path, tag, "upload"));
        }
        return;
      }
      if (D) {
        fixed.push(decomoji);
      }
      if (A) {
        upload.push(decomoji);
      }
      if (M) {
        fixed.push(decomoji);
        upload.push(decomoji);
      }
      if (R) {
        const [before, after] = path;
        fixed.push(convertToDecomojiObject(before, tag, "delete"));
        upload.push(convertToDecomojiObject(after, tag, "upload"));
        rename.push({
          name: convertFilepathToBasename(before),
          alias_for: convertFilepathToBasename(after),
        });
      }
    });
  });

  return {
    fixed: fixed
      .filter(({ name }) => !IGNORES.fixed.includes(name))
      .sort((a, b) => a.name.localeCompare(b.name)),
    upload: upload
      .filter(({ name }) => !IGNORES.basic.includes(name))
      .filter(({ name }) => !IGNORES.extra.includes(name))
      .filter(({ name }) => !IGNORES.explicit.includes(name))
      .sort((a, b) => a.name.localeCompare(b.name)),
    rename: rename
      .filter(({ name }) => !IGNORES.rename.includes(name))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
};
