import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { curator, decomoji, setDatabase, v4, v5, v6 } from "./databaseFixture.mjs";

// 更新の差分判定に使う典型的な database
// created だけのもの / 差し替えられたもの / 配布をやめたもの / NSFW を1件ずつ置く
const DECOMOJIS = [
  decomoji("すえおき"),
  decomoji("さしかえ", { updated: "6.2.0" }),
  decomoji("はいしorg", { deleted: "6.2.0" }),
  decomoji("あたらしい", { created: "6.2.0" }),
  decomoji("うるさい", { category: "explicit" }),
];

const ask = async (overrides) =>
  await curator({
    initial_run: false,
    version: "6.1.0",
    compatible: false,
    nsfwAdded: false,
    mode: "update",
    includeNsfw: true,
    invoker: "uploader",
    ...overrides,
  });

const names = async (overrides) => (await ask(overrides)).map((d) => d.name).sort();

beforeEach(() => {
  setDatabase({
    "database/v6.json": v6(DECOMOJIS),
    "database/v5.json": v5(["すえおき", "さしかえ", "うるさい", "きえた"]),
    "database/v4.json": v4(["v4only"]),
  });
});

describe("curator / mode=update の差分", () => {
  it("追加は created か updated が前回より新しいものだけ", async () => {
    assert.deepEqual(await names({ invoker: "uploader" }), ["あたらしい", "さしかえ"]);
  });

  it("削除は差し替えと、前回より後に配布をやめたもの", async () => {
    assert.deepEqual(await names({ invoker: "remover" }), ["さしかえ", "はいしorg"]);
  });

  it("配布をやめたデコモジは追加しない", async () => {
    assert.equal((await names({ invoker: "uploader" })).includes("はいしorg"), false);
  });

  it("前回より後に追加されたものは、配布をやめていても削除しない（入っていないため）", async () => {
    setDatabase({
      "database/v6.json": v6([decomoji("すぐ消えた", { created: "6.2.0", deleted: "6.2.0" })]),
      "database/v5.json": v5([]),
      "database/v4.json": v4([]),
    });
    assert.deepEqual(await names({ invoker: "remover" }), []);
  });

  it("差分が無ければ空", async () => {
    assert.deepEqual(await names({ invoker: "uploader", version: "6.2.0" }), []);
    assert.deepEqual(await names({ invoker: "remover", version: "6.2.0" }), []);
  });

  it("初回実行はすべて追加、削除は無し", async () => {
    assert.deepEqual(await names({ invoker: "uploader", initial_run: true, version: null }), [
      "あたらしい",
      "うるさい",
      "さしかえ",
      "すえおき",
    ]);
    assert.deepEqual(await names({ invoker: "remover", initial_run: true, version: null }), []);
  });

  it("バージョンが不明な時も初回と同じ扱い（全削除のあとの更新）", async () => {
    assert.deepEqual(
      await names({ invoker: "uploader", version: null }),
      ["あたらしい", "うるさい", "さしかえ", "すえおき"],
    );
  });
});

describe("curator / includeNsfw", () => {
  it("false なら NSFW を追加も削除もしない", async () => {
    setDatabase({
      "database/v6.json": v6([decomoji("うるさい", { category: "explicit", updated: "6.2.0" })]),
      "database/v5.json": v5(["うるさい"]),
      "database/v4.json": v4([]),
    });
    assert.deepEqual(await names({ invoker: "uploader", includeNsfw: false }), []);
    assert.deepEqual(await names({ invoker: "remover", includeNsfw: false }), []);
  });

  it("true なら通常の差分に乗る", async () => {
    setDatabase({
      "database/v6.json": v6([decomoji("うるさい", { category: "explicit", updated: "6.2.0" })]),
      "database/v5.json": v5(["うるさい"]),
      "database/v4.json": v4([]),
    });
    assert.deepEqual(await names({ invoker: "uploader", includeNsfw: true }), ["うるさい"]);
  });
});

describe("curator / nsfwAdded（NSFW をあとから有効にした時）", () => {
  it("バージョンを問わず NSFW を追加する", async () => {
    // created が version より古いので、通常の差分では拾えない
    assert.deepEqual(await names({ invoker: "uploader", nsfwAdded: true }), [
      "あたらしい",
      "うるさい",
      "さしかえ",
    ]);
  });

  it("NSFW でないものは通常の差分のまま", async () => {
    const result = await names({ invoker: "uploader", nsfwAdded: true });
    assert.equal(result.includes("すえおき"), false);
  });

  it("削除は通常の判定に任せる（差し替えられた NSFW を消せるように）", async () => {
    // ここを免除すると、消さずに追加しにいって error_name_taken になり差し替えが失われる
    setDatabase({
      "database/v6.json": v6([decomoji("うるさい", { category: "explicit", updated: "6.2.0" })]),
      "database/v5.json": v5(["うるさい"]),
      "database/v4.json": v4([]),
    });
    assert.deepEqual(await names({ invoker: "remover", nsfwAdded: true }), ["うるさい"]);
  });

  it("差し替えられていない NSFW は削除しない", async () => {
    assert.deepEqual(await names({ invoker: "remover", nsfwAdded: true }), ["さしかえ", "はいしorg"]);
  });
});
