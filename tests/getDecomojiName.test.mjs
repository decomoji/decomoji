import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getDecomojiName } from "../scripts/utilities/getDecomojiName.mjs";

describe("getDecomojiName", () => {
  it("表記・訓令式・ヘボン式を _ で繋ぐ", () => {
    assert.equal(
      getDecomojiName({ name: "安心", kunnrei: "annsinn", hepburn: "anshin" }),
      "安心_annsinn_anshin",
    );
  });

  it("ヘボン式が無ければ繋がない", () => {
    assert.equal(getDecomojiName({ name: "よかった", kunnrei: "yokatta", hepburn: "" }), "よかった_yokatta");
  });

  it("同じ文字列は重ねない（表記がラテン文字の場合）", () => {
    assert.equal(
      getDecomojiName({ name: "CSSISAWESOME", kunnrei: "cssisawesome", hepburn: "" }),
      "cssisawesome",
    );
    assert.equal(getDecomojiName({ name: "37564", kunnrei: "37564", hepburn: "37564" }), "37564");
  });

  it("name が無ければ id を使う", () => {
    assert.equal(getDecomojiName({ id: "ぬるぽ", name: "", kunnrei: "nurupo" }), "ぬるぽ_nurupo");
  });

  it("小文字に揃える", () => {
    assert.equal(getDecomojiName({ name: "OK", kunnrei: "OK", hepburn: "" }), "ok");
  });
});
