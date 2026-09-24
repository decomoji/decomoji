import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getValidatedInputs } from "../scripts/utilities/getValidatedInputs.mjs";

const VALID = {
  workspace: "example",
  email: "oti@example.com",
  password: "secret",
  mode: "update",
  includeNsfw: false,
  debug: false,
};

const validate = (overrides) => getValidatedInputs({ ...VALID, ...overrides }, "inputs.json");

describe("getValidatedInputs / 通るもの", () => {
  it("揃っていればそのまま返す", () => {
    assert.deepEqual(getValidatedInputs(VALID, "inputs.json"), VALID);
  });

  it("省略できる項目は無くてよい", () => {
    const { includeNsfw, debug, ...rest } = VALID;
    assert.deepEqual(getValidatedInputs(rest, "inputs.json"), rest);
  });

  it("mode は見ない（assigner が知っているモードと突き合わせる）", () => {
    assert.doesNotThrow(() => validate({ mode: "bogus" }));
  });

  it("知らないキーがあっても弾かない", () => {
    assert.doesNotThrow(() => validate({ term: "all" }));
  });
});

describe("getValidatedInputs / 必須の項目", () => {
  it("workspace が空", () => {
    assert.throws(() => validate({ workspace: "" }), /workspace: Input required\./);
  });

  it("workspace が無い", () => {
    const { workspace, ...rest } = VALID;
    assert.throws(() => getValidatedInputs(rest, "inputs.json"), /workspace: Input required\./);
  });

  it("email の形式が不正", () => {
    assert.throws(() => validate({ email: "oti@" }), /email: Invalid Email format\./);
    assert.throws(() => validate({ email: "" }), /email: Invalid Email format\./);
  });

  it("password が空", () => {
    assert.throws(() => validate({ password: "" }), /password: Input required\./);
  });

  it("文字列でない値も弾く", () => {
    assert.throws(() => validate({ workspace: 123 }), /workspace: Input required\./);
    assert.throws(() => validate({ password: null }), /password: Input required\./);
  });
});

describe("getValidatedInputs / 真偽値の項目", () => {
  it('"false" のような文字列を弾く（常に真になってしまうため）', () => {
    assert.throws(() => validate({ debug: "false" }), /debug: Boolean required\. \("false"\)/);
    assert.throws(
      () => validate({ includeNsfw: "true" }),
      /includeNsfw: Boolean required\. \("true"\)/,
    );
  });

  it("数値も弾く", () => {
    assert.throws(() => validate({ debug: 1 }), /debug: Boolean required\. \(1\)/);
  });

  it("true / false は通す", () => {
    assert.doesNotThrow(() => validate({ includeNsfw: true, debug: true }));
  });
});

describe("getValidatedInputs / まとめて知らせる", () => {
  it("駄目なところを一度に全部出す", () => {
    let message = "";
    try {
      getValidatedInputs({ workspace: "", email: "oti@", password: "", debug: "no" }, "inputs.json");
    } catch (error) {
      message = error.message;
    }
    assert.match(message, /workspace: Input required\./);
    assert.match(message, /email: Invalid Email format\./);
    assert.match(message, /password: Input required\./);
    assert.match(message, /debug: Boolean required\./);
  });

  it("どのファイルかを出す", () => {
    assert.throws(() => getValidatedInputs({}, "path/to/inputs.json"), /path\/to\/inputs\.json/);
  });

  it("オブジェクトでなければその旨を出す", () => {
    assert.throws(() => getValidatedInputs([], "inputs.json"), /オブジェクトで書いてください/);
    assert.throws(() => getValidatedInputs("x", "inputs.json"), /オブジェクトで書いてください/);
    assert.throws(() => getValidatedInputs(null, "inputs.json"), /オブジェクトで書いてください/);
  });
});
