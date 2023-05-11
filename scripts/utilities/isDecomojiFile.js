// ファイル名がデコモジかどうか返す
export const isDecomojiFile = (file) => {
  return /decomoji\/.*\.png/.test(file);
};
