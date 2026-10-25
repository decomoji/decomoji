// getRootPath を差し替えるので --experimental-test-module-mocks が要る（npm test 経由で実行すること）
import assert from "node:assert/strict";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, beforeEach, describe, it, mock } from "node:test";

// 本物の logs/ を書き潰さないよう、リポジトリのルートを一時ディレクトリに向ける
const root = fsSync.mkdtempSync(join(tmpdir(), "decomoji-logs-"));
const logs = join(root, "logs");

mock.module(new URL("../scripts/utilities/getRootPath.mjs", import.meta.url).href, {
  namedExports: { getRootPath: (...segments) => resolve(root, ...segments) },
});
const { outputHistoryJson } = await import("../scripts/utilities/outputHistoryJson.mjs");

// writeJsonFile が書き出すたびに標準出力へ流すので黙らせる
mock.method(console, "log", () => {});

const write = async (timestamp) => await outputHistoryJson({ timestamp, version: "6.2.0" });
const listHistories = async () =>
  (await fs.readdir(logs)).filter((name) => name.startsWith("history_")).sort();

beforeEach(async () => {
  await fs.rm(logs, { recursive: true, force: true });
  await fs.mkdir(logs, { recursive: true });
});

after(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

describe("outputHistoryJson / ファイル名", () => {
  it("コロンを含まない（Windows ではファイル名に使えないため）", async () => {
    await write("2026-09-24T05:56:39.849Z");
    const [name] = await listHistories();
    assert.equal(name.includes(":"), false);
    assert.equal(name, "history_2026-09-24T05-56-39.849Z.json");
  });

  it("最新の history.json と実行日時つきの履歴を両方書く", async () => {
    await write("2026-09-24T05:56:39.849Z");
    assert.deepEqual((await fs.readdir(logs)).sort(), [
      "history_2026-09-24T05-56-39.849Z.json",
      "history.json",
    ].sort());
  });

  it("中身の timestamp は ISO 8601 のまま（変えるのはファイル名だけ）", async () => {
    await write("2026-09-24T05:56:39.849Z");
    const saved = JSON.parse(await fs.readFile(join(logs, "history.json"), "utf8"));
    assert.equal(saved.timestamp, "2026-09-24T05:56:39.849Z");
  });

  it("名前順が日時順のままになる", async () => {
    for (const t of ["2026-01-02T03:04:05.000Z", "2026-01-02T03:04:04.000Z", "2025-12-31T23:59:59.000Z"]) {
      await write(t);
    }
    assert.deepEqual(await listHistories(), [
      "history_2025-12-31T23-59-59.000Z.json",
      "history_2026-01-02T03-04-04.000Z.json",
      "history_2026-01-02T03-04-05.000Z.json",
    ]);
  });
});

describe("outputHistoryJson / 古い履歴の掃除", () => {
  const timestampOf = (i) => `2026-01-01T00:00:${String(i).padStart(2, "0")}.000Z`;

  it("上限までは消さない", async () => {
    for (let i = 0; i < 30; i++) {
      await write(timestampOf(i));
    }
    assert.equal((await listHistories()).length, 30);
  });

  it("上限を超えたら古いものから消える", async () => {
    for (let i = 0; i < 35; i++) {
      await write(timestampOf(i));
    }
    const files = await listHistories();
    assert.equal(files.length, 30);
    // 古い 5 件（00〜04）が消えて、05 が最古になる
    assert.equal(files.at(0), "history_2026-01-01T00-00-05.000Z.json");
    assert.equal(files.at(-1), "history_2026-01-01T00-00-34.000Z.json");
  });

  it("history.json は消さない", async () => {
    for (let i = 0; i < 35; i++) {
      await write(timestampOf(i));
    }
    assert.equal(fsSync.existsSync(join(logs, "history.json")), true);
  });

  it("関係ないファイルは消さない", async () => {
    await fs.writeFile(join(logs, "_tmp_uploader_combined.json"), "[]");
    for (let i = 0; i < 35; i++) {
      await write(timestampOf(i));
    }
    assert.equal(fsSync.existsSync(join(logs, "_tmp_uploader_combined.json")), true);
  });

  it("掃除に失敗しても実行を止めない", async () => {
    // 消せないもの（ディレクトリ）を一番古い履歴として置いておく
    await fs.mkdir(join(logs, "history_2020-01-01T00-00-00.000Z.json"));
    for (let i = 0; i < 31; i++) {
      await write(timestampOf(i));
    }
    // 書き出し自体は成功している
    assert.equal(fsSync.existsSync(join(logs, "history.json")), true);
    assert.equal(fsSync.existsSync(join(logs, `history_${timestampOf(30).replaceAll(":", "-")}.json`)), true);
  });
});
