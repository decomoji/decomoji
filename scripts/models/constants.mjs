// git 操作に失敗した子達
export const ADDITIONALS = {
  basic: [],
  extra: [
    {
      name: "joinsiyo",
      category: "extra",
      path: "decomoji/extra/joinsiyo.png",
      created: "v5.0.0",
      updated: "v5.14.1",
    },
    {
      name: "jojo",
      category: "extra",
      path: "decomoji/extra/jojo.png",
      created: "v5.15.0",
    },
  ],
  explicit: [
    {
      name: "genntennkaikinotikubi",
      category: "explicit",
      path: "decomoji/explicit/genntennkaikinotikubi.png",
      created: "v5.21.1",
    },
    {
      name: "koroso",
      category: "explicit",
      path: "decomoji/explicit/koroso.png",
      created: "v5.23.0",
    },
  ],
  rename: [
    {
      name: "euc_jp",
      alias_for: "euc-jp",
    },
  ],
};

// バージョン別の JSON に加えないファイル名のコレクション
export const IGNORES = {
  basic: [],
  explicit: [],
  extra: ["nasca\\343\\201\\247", "true false"],
  fixed: ["nasca\\343\\201\\247", "true false"],
  rename: [
    "nasca\\343\\201\\247",
    "joinsiyo",
    "zyoinsiyo",
    "true false",
    "genntennkaikinotikubi",
  ],
};

export const FIRST_LETTERS = Array.from(
  "_0123456789abcdefghijklmnopqrstuvwxyz",
);
