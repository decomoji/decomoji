// デコモジのカテゴリー名を返す
export const getDecomojiCategory = (filepath) => {
  const splited = filepath.split("/");
  if (splited.length > 2) {
    // decomoji/hoge/name.png -> hoge
    return splited[1];
  } else {
    return "root";
  }
};
