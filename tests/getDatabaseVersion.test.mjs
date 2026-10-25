// database を差し替えるので --experimental-test-module-mocks が要る（npm test 経由で実行すること）
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import * as real from "../scripts/utilities/getParsedJson.mjs";

// getDatabaseVersion は barrel ではなく getParsedJson.mjs を直接読むので、そちらを差し替える
const files = {};
mock.module(new URL("../scripts/utilities/getParsedJson.mjs", import.meta.url).href, {
  namedExports: {
    getParsedJson: async (filepath) =>
      filepath in files ? structuredClone(files[filepath]) : await real.getParsedJson(filepath),
  },
});
const { getDatabaseVersion } = await import("../scripts/utilities/getDatabaseVersion.mjs");

const setDatabase = (db) => {
  files["database/v6.json"] = db;
};
const decomoji = (id, versions) => ({ id, created: "6.0.0", updated: "", deleted: "", ...versions });

describe("getDatabaseVersion", () => {
  it("database の version を返す", async () => {
    setDatabase({ version: "6.2.0", decomojis: [decomoji("a")] });
    assert.equal(await getDatabaseVersion(), "6.2.0");
  });

  it("version が無ければエラー", async () => {
    setDatabase({ version: "", decomojis: [] });
    await assert.rejects(() => getDatabaseVersion(), /version がありません/);
  });

  it("version より新しい created があればエラー", async () => {
    setDatabase({ version: "6.0.0", decomojis: [decomoji("a", { created: "6.1.0" })] });
    await assert.rejects(() => getDatabaseVersion(), /より新しいデコモジがあります/);
  });

  it("version より新しい updated があればエラー", async () => {
    setDatabase({ version: "6.0.0", decomojis: [decomoji("a", { updated: "6.2.0" })] });
    await assert.rejects(() => getDatabaseVersion(), /より新しいデコモジがあります/);
  });

  it("version より新しい deleted があればエラー", async () => {
    setDatabase({ version: "6.0.0", decomojis: [decomoji("a", { deleted: "6.2.0" })] });
    await assert.rejects(() => getDatabaseVersion(), /より新しいデコモジがあります/);
  });

  it("エラーには該当したデコモジを出す", async () => {
    setDatabase({
      version: "6.0.0",
      decomojis: [decomoji("よかった", { updated: "6.1.0" }), decomoji("安心", { updated: "6.2.0" })],
    });
    await assert.rejects(() => getDatabaseVersion(), /よかった: 6\.1\.0[\s\S]*安心: 6\.2\.0/);
  });

  it("多い時は件数でまとめる", async () => {
    setDatabase({
      version: "6.0.0",
      decomojis: Array.from({ length: 8 }, (_, i) => decomoji(`d${i}`, { updated: "6.1.0" })),
    });
    await assert.rejects(() => getDatabaseVersion(), /ほか 3 件/);
  });

  it("version と同じバージョンなら通る", async () => {
    setDatabase({
      version: "6.2.0",
      decomojis: [decomoji("a", { created: "6.2.0", updated: "6.2.0", deleted: "6.2.0" })],
    });
    assert.equal(await getDatabaseVersion(), "6.2.0");
  });
});
