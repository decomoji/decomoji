// エージェントを差し替えるので --experimental-test-module-mocks が要る（npm test 経由で実行すること）
import assert from "node:assert/strict";
import { beforeEach, describe, it, mock } from "node:test";

// 呼ばれた順番を記録し、任意のエージェントを失敗させたり投げさせたりする偽エージェント
const calls = [];
const behavior = {};
const setBehavior = (b) => {
  for (const key of Object.keys(behavior)) {
    delete behavior[key];
  }
  Object.assign(behavior, b);
};

const fake = (name) => async ({ inputs, history, compatible, nsfwAdded }) => {
  calls.push({ name, compatible, nsfwAdded });
  if (behavior[name]?.throws) {
    throw new Error(behavior[name].throws);
  }
  return {
    inputs: behavior[name]?.inputs ?? inputs,
    result: { ok: [`${name}-done`], error: [] },
    failed: behavior[name]?.failed === true,
  };
};

mock.module(new URL("../scripts/launcher/agents/index.mjs", import.meta.url).href, {
  namedExports: { uploader: fake("uploader"), remover: fake("remover"), pretender: fake("pretender") },
});
const { assigner } = await import("../scripts/launcher/handlers/assigner.mjs");

const run = async (mode, overrides = {}) =>
  await assigner({
    inputs: { mode },
    history: { compatible: true },
    compatible: true,
    nsfwAdded: false,
    ...overrides,
  });
const order = () => calls.map((c) => c.name);

beforeEach(() => {
  calls.length = 0;
  setBehavior({});
});

describe("assigner / mode ごとのエージェントと順番", () => {
  it("消してから入れて、最後にエイリアスを貼る", async () => {
    await run("compatible_migration");
    assert.deepEqual(order(), ["remover", "uploader", "pretender"]);
  });

  it("更新でもエイリアスを貼り直す", async () => {
    await run("update");
    assert.deepEqual(order(), ["remover", "uploader", "pretender"]);
  });

  it("移行はエイリアスを貼らない", async () => {
    await run("migration");
    assert.deepEqual(order(), ["remover", "uploader"]);
  });

  it("全削除は消すだけ", async () => {
    await run("uninstall");
    assert.deepEqual(order(), ["remover"]);
  });

  it("知らない mode はエラー", async () => {
    await assert.rejects(() => run("bogus"), /Unknown mode: bogus/);
  });
});

describe("assigner / 状態の引き回し", () => {
  it("compatible と nsfwAdded を全エージェントに渡す", async () => {
    await run("compatible_migration", { compatible: true, nsfwAdded: true });
    assert.deepEqual(
      calls.map((c) => [c.compatible, c.nsfwAdded]),
      [
        [true, true],
        [true, true],
        [true, true],
      ],
    );
  });

  it("入力し直された inputs を次のエージェントへ渡す", async () => {
    setBehavior({ remover: { inputs: { mode: "update", workspace: "renamed" } } });
    const { inputs } = await run("update");
    assert.equal(inputs.workspace, "renamed");
  });
});

describe("assigner / 失敗したら後続を回さない", () => {
  it("failed を返したエージェントで止まる", async () => {
    setBehavior({ uploader: { failed: true } });
    const { failed, results } = await run("compatible_migration");
    assert.deepEqual(order(), ["remover", "uploader"]);
    assert.equal(failed, true);
    // 先に成功した結果は残す
    assert.deepEqual(results.remover.ok, ["remover-done"]);
  });

  it("例外を投げたエージェントでも止まり、投げ返さない", async () => {
    // curator() やブラウザの起動はエージェント自身の try より前にあるのでここまで上がってくる
    setBehavior({ uploader: { throws: "ENOENT: no such file or directory, open 'database/v6.json'" } });
    const { failed, results } = await run("compatible_migration");
    assert.deepEqual(order(), ["remover", "uploader"]);
    assert.equal(failed, true);
    assert.deepEqual(results.uploader.error, [
      { message: "ENOENT: no such file or directory, open 'database/v6.json'" },
    ]);
  });

  it("投げても先に成功したエージェントの結果は失われない", async () => {
    setBehavior({ uploader: { throws: "Failed to launch the browser process!" } });
    const { results } = await run("compatible_migration");
    assert.deepEqual(results.remover.ok, ["remover-done"]);
  });

  it("最初のエージェントが投げたらそこで終わる", async () => {
    setBehavior({ remover: { throws: "boom" } });
    const { failed } = await run("update");
    assert.deepEqual(order(), ["remover"]);
    assert.equal(failed, true);
  });

  it("何事も無ければ failed は立たない", async () => {
    const { failed } = await run("compatible_migration");
    assert.equal(failed, false);
  });
});
