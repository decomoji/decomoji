import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { isAbsolute } from "node:path";
import { describe, it } from "node:test";
import { getRootPath } from "../scripts/utilities/getRootPath.mjs";

describe("getRootPath", () => {
  it("リポジトリのルートを指す", () => {
    assert.equal(isAbsolute(getRootPath()), true);
    assert.equal(existsSync(getRootPath("package.json")), true);
    assert.equal(existsSync(getRootPath("database")), true);
  });

  it("セグメントを分けて渡しても同じ", () => {
    assert.equal(getRootPath("logs", "history.json"), getRootPath("logs/history.json"));
  });

  it("絶対パスはそのまま返す（二重解決しない）", () => {
    assert.equal(getRootPath("/etc/hosts"), "/etc/hosts");
    assert.equal(getRootPath(getRootPath("package.json")), getRootPath("package.json"));
  });

  it("実行時のカレントディレクトリに影響されない", () => {
    const before = getRootPath("database/v6.json");
    const cwd = process.cwd();
    try {
      process.chdir("/");
      assert.equal(getRootPath("database/v6.json"), before);
    } finally {
      process.chdir(cwd);
    }
  });
});
