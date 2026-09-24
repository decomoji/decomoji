import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { curator, decomoji, setDatabase, v4, v5, v6 } from "./databaseFixture.mjs";

// v6 に2件、v5 には v6 と同名+消えたもの、v4 には v4 だけのもの
const V6 = [decomoji("あんしん", { kunnrei: "annsinn", hepburn: "anshin" }), decomoji("うるさい", { category: "explicit" })];

beforeEach(() => {
  setDatabase({
    "database/v6.json": v6(V6),
    "database/v5.json": v5(["annsinn", "anshin", "きえたv5"]),
    "database/v4.json": v4(["v4only"]),
  });
});

const ask = async (overrides) =>
  await curator({
    initial_run: true,
    version: null,
    compatible: true,
    nsfwAdded: false,
    includeNsfw: true,
    ...overrides,
  });

const names = async (overrides) => (await ask(overrides)).map((d) => d.name).sort();

describe("curator / mode と invoker の掛け合わせで見る母集団", () => {
  it("migration は v4/v5 を消して v6 を入れる", async () => {
    assert.deepEqual(
      await names({ mode: "migration", invoker: "remover" }),
      ["annsinn", "anshin", "きえたv5", "v4only"].sort(),
    );
    assert.deepEqual(
      await names({ mode: "migration", invoker: "uploader" }),
      ["あんしん_annsinn_anshin", "うるさい"].sort(),
    );
  });

  it("migration はエイリアスを貼らない", async () => {
    assert.deepEqual(await names({ mode: "migration", invoker: "pretender" }), []);
  });

  it("compatible_migration は v5 の名前を v6 へのエイリアスにする", async () => {
    const aliases = await ask({ mode: "compatible_migration", invoker: "pretender" });
    assert.deepEqual(
      aliases.sort((a, b) => a.name.localeCompare(b.name)),
      [
        { name: "annsinn", alias_for: "あんしん_annsinn_anshin" },
        { name: "anshin", alias_for: "あんしん_annsinn_anshin" },
      ],
    );
  });

  it("v5 に無い名前はエイリアスにしない（貼り先が無い）", async () => {
    const aliases = await ask({ mode: "compatible_migration", invoker: "pretender" });
    assert.equal(
      aliases.some((a) => a.name === "うるさい"),
      false,
    );
  });

  it("uninstall は v6 と v4/v5 の両方を消す", async () => {
    assert.deepEqual(
      await names({ mode: "uninstall", invoker: "remover" }),
      ["annsinn", "anshin", "うるさい", "あんしん_annsinn_anshin", "きえたv5", "v4only"].sort(),
    );
  });

  it("uninstall は追加もエイリアスもしない", async () => {
    assert.deepEqual(await names({ mode: "uninstall", invoker: "uploader" }), []);
    assert.deepEqual(await names({ mode: "uninstall", invoker: "pretender" }), []);
  });

  it("知らない mode は空を返す", async () => {
    assert.deepEqual(await names({ mode: "bogus", invoker: "uploader" }), []);
  });
});

describe("curator / compatible", () => {
  it("更新では compatible なワークスペースだけエイリアスを貼る", async () => {
    const base = { mode: "update", invoker: "pretender", initial_run: false, version: "6.1.0" };
    setDatabase({
      "database/v6.json": v6([decomoji("あんしん", { kunnrei: "annsinn", hepburn: "anshin", updated: "6.2.0" })]),
      "database/v5.json": v5(["annsinn"]),
      "database/v4.json": v4([]),
    });
    assert.deepEqual(await names({ ...base, compatible: true }), ["annsinn"]);
    assert.deepEqual(await names({ ...base, compatible: false }), []);
  });
});

describe("curator / 返す形", () => {
  it("invoker ごとに必要なプロパティだけ返す", async () => {
    const [uploaded] = await ask({ mode: "migration", invoker: "uploader" });
    assert.deepEqual(Object.keys(uploaded).sort(), ["category", "name", "path"]);

    const [removed] = await ask({ mode: "uninstall", invoker: "remover" });
    assert.deepEqual(Object.keys(removed), ["name"]);

    const [aliased] = await ask({ mode: "compatible_migration", invoker: "pretender" });
    assert.deepEqual(Object.keys(aliased).sort(), ["alias_for", "name"]);
  });

  it("名前が重複するデコモジは間引く", async () => {
    // v6 の名前がラテン文字だけになると v4/v5 の名前と衝突することがある
    setDatabase({
      "database/v6.json": v6([decomoji("v4only", { kunnrei: "v4only" })]),
      "database/v5.json": v5(["v4only"]),
      "database/v4.json": v4(["v4only"]),
    });
    assert.deepEqual(await names({ mode: "uninstall", invoker: "remover" }), ["v4only"]);
  });
});
