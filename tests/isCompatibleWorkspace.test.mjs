import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isCompatibleWorkspace } from "../scripts/utilities/isCompatibleWorkspace.mjs";

describe("isCompatibleWorkspace", () => {
  it("互換のある移行をしたらエイリアスを持つワークスペースになる", () => {
    assert.equal(isCompatibleWorkspace({ mode: "compatible_migration", compatible: false }), true);
  });

  it("移行と全削除はエイリアスを持たない", () => {
    assert.equal(isCompatibleWorkspace({ mode: "migration", compatible: true }), false);
    assert.equal(isCompatibleWorkspace({ mode: "uninstall", compatible: true }), false);
  });

  it("更新は前回の状態を引き継ぐ", () => {
    assert.equal(isCompatibleWorkspace({ mode: "update", compatible: true }), true);
    assert.equal(isCompatibleWorkspace({ mode: "update", compatible: false }), false);
  });

  it("前回の状態が不明なら引き継がない", () => {
    assert.equal(isCompatibleWorkspace({ mode: "update", compatible: undefined }), false);
    assert.equal(isCompatibleWorkspace({ mode: "update", compatible: null }), false);
  });

  it("更新を重ねても互換の状態が失われない", () => {
    // mode だけでは移行時のモードを辿れないので、状態として引き継げていることを確かめる
    let compatible = false;
    for (const mode of ["compatible_migration", "update", "update", "update"]) {
      compatible = isCompatibleWorkspace({ mode, compatible });
    }
    assert.equal(compatible, true);
  });
});
