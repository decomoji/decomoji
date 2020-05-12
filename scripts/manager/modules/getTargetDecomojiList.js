/**
  emoji.adminList が返す配列のアイテムの型定義
  @typedef {{
    name: string;
    is_alias: number;
    alias_for: string;
    url: string;
    created: number;
    team_id: string;
    user_id: string;
    user_display_name: string;
    avatar_hash: string;
    can_delete: boolean;
    is_bad: boolean;
    synonyms: string[];
  }} EmojiItem;

  emoji.adminList が返すレスポンスの型定義
  @typedef {EmojiItem[]} EmojiAdminList;
*/

const fs = require("fs");

/** @param {("basic" | "extra" | "explicit")[]} categories */
const getTargetDecomojiList = async (categories) => {
  // ディレクトリをさらってファイル名の配列を返す
  const targetDecomojiList = await Promise.all(
    categories.map((category) => {
      // .DS_Store を取り除いたものを返す
      return fs.readdirSync(`./decomoji/${category}/`).filter((v) => v !== ".DS_Store");
    })
  );
  // categories の順番ごとに二次元配列になっているのでそのまま返す
  return targetDecomojiList;
};

module.exports = getTargetDecomojiList;
