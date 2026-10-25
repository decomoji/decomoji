// テスト用に curator が読む database を差し替える仕組み
//
// 実際の database/v6.json を読ませると、デコモジが増減するたびにテストが壊れるうえ、
// 「差し替えられた explicit」のようにデータに無い組み合わせを試せない
//
// --experimental-test-module-mocks が要るので、npm test 経由で実行すること
import { mock } from "node:test";
import * as utilities from "../scripts/utilities/index.mjs";

const UTILITIES = new URL("../scripts/utilities/index.mjs", import.meta.url).href;

// テストごとに差し替える中身。モックは一度しか張れないのでここを書き換える
const files = {};

export const setDatabase = (fixtures) => {
  for (const key of Object.keys(files)) {
    delete files[key];
  }
  Object.assign(files, fixtures);
};

mock.module(UTILITIES, {
  namedExports: {
    ...utilities,
    // 差し替えたファイルだけ偽物を返し、それ以外は本物を読む
    getParsedJson: async (filepath) =>
      filepath in files ? structuredClone(files[filepath]) : await utilities.getParsedJson(filepath),
  },
});

// モックを張ってから読み込ませる
export const { curator } = await import("../scripts/launcher/handlers/curator.mjs");

// テストで組み立てやすくするための最小のデコモジ
export const decomoji = (id, overrides = {}) => ({
  id,
  name: id,
  kunnrei: id,
  hepburn: "",
  category: "basic",
  created: "6.0.0",
  updated: "",
  deleted: "",
  ...overrides,
});

export const v6 = (decomojis, version = "6.2.0") => ({
  version,
  versions: ["6.0.0", "6.1.0", "6.2.0"],
  decomojis,
});

// v5 の履歴。エイリアスの貼り先として使う
export const v5 = (names) => ({
  decomojis: names.map((name) => ({ name, category: "basic" })),
  decomojis_full: names.map((name) => ({ name, category: "basic" })),
});

export const v4 = (names) =>
  names.map((name) => ({ name, path: `./decomoji/basic/${name}.png` }));
