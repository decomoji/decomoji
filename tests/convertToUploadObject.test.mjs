import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { convertToUploadObject } from "../scripts/utilities/convertToUploadObject.mjs";
import { getDecomojiPath } from "../scripts/utilities/getDecomojiPath.mjs";

describe("getDecomojiPath", () => {
  it("画像ファイル名は v5 の頃から訓令式のまま", () => {
    assert.equal(
      getDecomojiPath({ category: "basic", kunnrei: "annsinn" }),
      "decomoji/basic/annsinn.png",
    );
  });

  it("リポジトリのルートからの相対パスを返す（解決は読み書き側に任せる）", () => {
    const path = getDecomojiPath({ category: "explicit", kunnrei: "urusai" });
    assert.equal(path.startsWith("/"), false);
    assert.equal(path, "decomoji/explicit/urusai.png");
  });
});

describe("convertToUploadObject", () => {
  it("database のデコモジを uploader が扱う形に変換する", () => {
    assert.deepEqual(
      convertToUploadObject({
        id: "安心",
        name: "安心",
        kunnrei: "annsinn",
        hepburn: "anshin",
        category: "basic",
      }),
      { name: "安心_annsinn_anshin", category: "basic", path: "decomoji/basic/annsinn.png" },
    );
  });
});
