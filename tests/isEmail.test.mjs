import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isEmail } from "../scripts/utilities/isEmail.mjs";

const ERROR = "Invalid Email format.";

describe("isEmail", () => {
  it("一般的なメールアドレスを通す", () => {
    assert.equal(isEmail("user@example.com"), true);
    assert.equal(isEmail("first.last+tag@sub.example.co.jp"), true);
    assert.equal(isEmail("a-b_c@ex-ample.io"), true);
  });

  it("空・非文字列を弾く", () => {
    assert.equal(isEmail(""), ERROR);
    assert.equal(isEmail(undefined), ERROR);
    assert.equal(isEmail(null), ERROR);
  });

  it("形式が不正なものを弾く", () => {
    assert.equal(isEmail("plainaddress"), ERROR);
    assert.equal(isEmail("@example.com"), ERROR);
    assert.equal(isEmail("user@"), ERROR);
    assert.equal(isEmail("user@example"), ERROR);
    assert.equal(isEmail("user@@example.com"), ERROR);
    assert.equal(isEmail(".user@example.com"), ERROR);
    assert.equal(isEmail("user..name@example.com"), ERROR);
    assert.equal(isEmail("user@example.c"), ERROR);
    assert.equal(isEmail("user name@example.com"), ERROR);
  });

  it("長さの上限を超えるものを弾く", () => {
    assert.equal(isEmail(`${"a".repeat(64)}@example.com`), true);
    assert.equal(isEmail(`${"a".repeat(65)}@example.com`), ERROR);
    assert.equal(isEmail(`user@${"a".repeat(63)}.com`), true);
    assert.equal(isEmail(`user@${"a".repeat(64)}.com`), ERROR);
    assert.equal(isEmail(`user@${"a".repeat(62)}.${"b".repeat(62)}.${"c".repeat(62)}.${"d".repeat(62)}.com`), ERROR);
  });
});
