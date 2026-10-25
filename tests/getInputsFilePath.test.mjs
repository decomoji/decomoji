import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInputsFilePath } from "../scripts/utilities/getInputsFilePath.mjs";
import { getRootPath } from "../scripts/utilities/getRootPath.mjs";

describe("getInputsFilePath", () => {
  it("リポジトリのルート基準で見つける", async () => {
    assert.equal(
      await getInputsFilePath("scripts/launcher/inputs.example.json"),
      getRootPath("scripts/launcher/inputs.example.json"),
    );
  });

  it("絶対パスはそのまま返す", async () => {
    const filepath = getRootPath("package.json");
    assert.equal(await getInputsFilePath(filepath), filepath);
  });

  it("引数が無ければ null（＝対話式に進む）", async () => {
    assert.equal(await getInputsFilePath(null), null);
    assert.equal(await getInputsFilePath(""), null);
  });

  it("process.argv は見ない（オプションをパスと誤解しないため）", async () => {
    // 既定値を持たせていると --include-nsfw を設定ファイルとして拾ってしまう
    assert.equal(await getInputsFilePath(undefined), null);
  });

  it("渡されたのに見つからない時は黙って対話式に落とさずエラー", async () => {
    await assert.rejects(() => getInputsFilePath("no/such/inputs.json"), {
      message: /\[ERROR\]設定ファイルが見つかりません: no\/such\/inputs\.json/,
    });
  });
});
