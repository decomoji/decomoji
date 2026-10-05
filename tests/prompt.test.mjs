import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { describe, it } from "node:test";
import { prompt } from "../scripts/utilities/prompt.mjs";

// 渡した行を入力として流し込み、回答と画面に出た文字列を返す
const run = async (questions, lines) => {
  const input = new PassThrough();
  const output = new PassThrough();
  let printed = "";
  output.on("data", (chunk) => (printed += chunk));
  input.end(lines.map((line) => `${line}\n`).join(""));
  const answers = await prompt(questions, { input, output });
  return { answers, printed };
};

const isFilled = (value) => (value ? true : "Input required.");

describe("prompt / input", () => {
  it("入力した値を name をキーにして返す", async () => {
    const { answers } = await run({ type: "input", name: "workspace", message: "ws:" }, ["example"]);
    assert.deepEqual(answers, { workspace: "example" });
  });

  it("配列で渡した質問を順に聞く", async () => {
    const { answers } = await run(
      [
        { type: "input", name: "a", message: "a:" },
        { type: "input", name: "b", message: "b:" },
      ],
      ["1", "2"],
    );
    assert.deepEqual(answers, { a: "1", b: "2" });
  });

  it("空で確定したら default を使う", async () => {
    const { answers, printed } = await run(
      { type: "input", name: "email", message: "email:", default: "oti@example.com" },
      [""],
    );
    assert.equal(answers.email, "oti@example.com");
    assert.match(printed, /\(oti@example\.com\)/);
  });

  it("validate が通るまで聞き直し、エラーメッセージを出す", async () => {
    const { answers, printed } = await run({ type: "input", name: "workspace", message: "ws:", validate: isFilled }, [
      "",
      "example",
    ]);
    assert.equal(answers.workspace, "example");
    assert.match(printed, />> Input required\./);
  });
});

describe("prompt / password", () => {
  it("入力した値を返し、画面には出さない", async () => {
    const { answers, printed } = await run({ type: "password", name: "password", mask: "*", message: "pw:" }, [
      "secret",
    ]);
    assert.equal(answers.password, "secret");
    assert.doesNotMatch(printed, /secret/);
  });
});

describe("prompt / rawlist", () => {
  const question = {
    type: "rawlist",
    name: "debug",
    message: "debug?",
    choices: [
      { name: "いいえ", value: false },
      { name: "はい", value: true },
    ],
  };

  it("番号で選んだ choice の value を返す", async () => {
    const { answers, printed } = await run(question, ["2"]);
    assert.equal(answers.debug, true);
    assert.match(printed, /1\) いいえ/);
    assert.match(printed, /2\) はい/);
  });

  it("範囲外や数字以外は聞き直す", async () => {
    const { answers, printed } = await run(question, ["0", "abc", "", "1"]);
    assert.equal(answers.debug, false);
    assert.equal(printed.match(/>> Please enter a valid index\./g).length, 3);
  });
});

describe("prompt / 中断", () => {
  it("答える前に入力が終わったら PromptCanceledError を投げる", async () => {
    await assert.rejects(run({ type: "input", name: "workspace", message: "ws:" }, []), {
      name: "PromptCanceledError",
    });
  });
});
