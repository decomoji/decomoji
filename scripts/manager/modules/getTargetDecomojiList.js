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
const getTargetDecomojiList = (categories) => {
  // ディレクトリをさらってファイルパス、カテゴリ、名前の配列を返す
  return categories.map((category) => {
    const dir = `./decomoji/${category}/`;
    const list = fs.readdirSync(dir).filter((v) => v !== ".DS_Store");
    return list.map((file) => {
      const name = file.split(".")[0];
      const path = `${dir}${file}`;
      return {
        path,
        name,
        category
      }
    })
  }).flat();
};

module.exports = getTargetDecomojiList;
