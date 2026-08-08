// configs の値からカテゴリー名を取り出す（basic も v5_basic も basic になる）
const getCategoryName = (config) => String(config).replace(/^v\d+_/, "");

// 処理の対象になるカテゴリーを返す
// term=category なら選択されたカテゴリー、それ以外（term=all や移行）ならすべてのカテゴリー
export const getTargetCategories = ({ configs = [], term }, decomojis) =>
  term === "category"
    ? configs.map(getCategoryName)
    : [...new Set(decomojis.map(({ category }) => category))];
