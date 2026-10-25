import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { getParsedJson } from "../scripts/utilities/getParsedJson.mjs";

let dir;
before(async () => {
  dir = await fs.mkdtemp(join(tmpdir(), "decomoji-test-"));
});
after(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("getParsedJson", () => {
  it("リポジトリのルート基準で読める", async () => {
    assert.equal((await getParsedJson("package.json")).name, "decomoji");
  });

  it("絶対パスも読める", async () => {
    const filepath = join(dir, "ok.json");
    await fs.writeFile(filepath, '{ "a": 1 }');
    assert.deepEqual(await getParsedJson(filepath), { a: 1 });
  });

  it("ファイルが無ければどのファイルか分かるエラーになる", async () => {
    await assert.rejects(() => getParsedJson("no/such/file.json"), {
      message: /\[ERROR\]JSON を読めませんでした: no\/such\/file\.json/,
    });
  });

  it("JSON が壊れていてもどのファイルか分かる", async () => {
    const filepath = join(dir, "malformed.json");
    await fs.writeFile(filepath, "{ not json");
    await assert.rejects(() => getParsedJson(filepath), {
      message: /\[ERROR\]JSON を読めませんでした: .*malformed\.json/,
    });
  });

  it("元のエラーを cause に残す", async () => {
    const filepath = join(dir, "malformed2.json");
    await fs.writeFile(filepath, "{ not json");
    const error = await getParsedJson(filepath).catch((e) => e);
    assert.ok(error.cause instanceof SyntaxError);
  });
});
