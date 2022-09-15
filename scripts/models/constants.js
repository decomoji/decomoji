module.exports.ADDITIONALS = {
  extra: [
    {
      name: "joinsiyo",
      path: "decomoji/extra/joinsiyo.png",
      created: "v5.0.0",
      updated: "v5.14.1",
    },
    {
      name: "jojo",
      path: "decomoji/extra/jojo.png",
      created: "v5.15.0",
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
module.exports.IGNORES = {
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
