const convertFilepathToBasename = require("./convertFilepathToBasename");
const convertToDecomojiObject = require("./convertToDecomojiObject");

// diff-filter の結果を { fixed, upload, rename } に再分配したオブジェクトを返す
const getDecomojiDiffAsFilterMode = (diff, tag) => {
  const upload = [];
  const fixed = [];
  const rename = [];
  Object.entries(diff).forEach((entry) => {
    const [filterMode, list] = entry;
    list.forEach((path) => {
      const decomoji =
        filterMode === "rename"
          ? {}
          : convertToDecomojiObject(path, tag, filterMode);

      if (tag === "v5.0.0" && filterMode !== "rename") {
        // v5.0.0 では rename 以外全て upload 扱いにする
        upload.push(convertToDecomojiObject(path, tag, "upload"));
      } else {
        if (filterMode === "delete" || filterMode === "modify") {
          fixed.push(decomoji);
        }
        if (filterMode === "upload" || filterMode === "modify") {
          upload.push(decomoji);
        }
        if (filterMode === "rename") {
          const [before, after] = path;
          fixed.push(convertToDecomojiObject(before, tag, "delete"));
          upload.push(convertToDecomojiObject(after, tag, "upload"));
          rename.push({
            name: convertFilepathToBasename(before),
            alias_for: convertFilepathToBasename(after),
          });
        }
      }
    });
  });

  return {
    fixed: fixed.sort((a, b) => a.name.localeCompare(b.name)),
    upload: upload.sort((a, b) => a.name.localeCompare(b.name)),
    rename: rename.sort((a, b) => a.name.localeCompare(b.name)),
  };
};

module.exports = getDecomojiDiffAsFilterMode;
