import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isNewerThan } from "../scripts/utilities/isNewerThan.mjs";

describe("isNewerThan", () => {
  it("メジャーが大きければ新しい", () => {
    assert.equal(isNewerThan("6.0.0", "5.35.0"), true);
    assert.equal(isNewerThan("5.35.0", "6.0.0"), false);
  });

  it("マイナーが大きければ新しい", () => {
    assert.equal(isNewerThan("6.1.0", "6.0.0"), true);
    assert.equal(isNewerThan("6.0.0", "6.1.0"), false);
  });

  it("パッチが大きければ新しい", () => {
    assert.equal(isNewerThan("6.0.1", "6.0.0"), true);
    assert.equal(isNewerThan("6.0.0", "6.0.1"), false);
  });

  it("同じバージョンは新しくない", () => {
    assert.equal(isNewerThan("6.2.0", "6.2.0"), false);
  });

  it("v5 の v 接頭辞ありと v6 の接頭辞なしを比べられる", () => {
    assert.equal(isNewerThan("6.0.0", "v5.35.0"), true);
    assert.equal(isNewerThan("v5.35.0", "6.0.0"), false);
    assert.equal(isNewerThan("v5.35.0", "v5.34.0"), true);
  });

  it("比較できない値は false を返す（updated が無いデコモジなど）", () => {
    assert.equal(isNewerThan("", "6.0.0"), false);
    assert.equal(isNewerThan("6.0.0", ""), false);
    assert.equal(isNewerThan(undefined, "6.0.0"), false);
    assert.equal(isNewerThan("6.0.0", undefined), false);
    assert.equal(isNewerThan("   ", "6.0.0"), false);
  });
});
