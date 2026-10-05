import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { styleText } from "node:util";

// Ctrl+C や入力の終端でプロンプトを閉じた時のエラー
// 異常ではないので、呼び出し元はこの name を見て静かに終われる
const createCanceledError = () => {
  const error = new Error("Prompt was canceled.");
  error.name = "PromptCanceledError";
  return error;
};

// 画面上の幅を数える。全角は2マスとして扱う
const getWidth = (text) => [...text].reduce((width, char) => width + (char.codePointAt(0) > 0xff ? 2 : 1), 0);

// inquirer.prompt の代わりに、使っている type（input / password / rawlist）だけを readline で賄う
// 質問を1つでも配列でも受け取り、name をキーにした回答のオブジェクトを返す
export const prompt = async (questions, { input = process.stdin, output = process.stdout } = {}) => {
  // password の入力中は readline のエコーを止めたいので、出力の手前に蛇口を挟む
  let muted = false;
  const echo = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) {
        output.write(chunk, encoding);
      }
      callback();
    },
  });
  const terminal = Boolean(input.isTTY && output.isTTY);
  const rl = createInterface({ input, output: echo, terminal });
  // パイプで渡された入力は一度に何行も届くので、取りこぼさないようイテレータで1行ずつ受け取る
  const lines = rl[Symbol.asyncIterator]();
  rl.on("SIGINT", () => {
    // password の入力中は readHidden が改行するので、それ以外の時だけ改行してから閉じる
    if (!muted) {
      output.write("\n");
    }
    rl.close();
  });
  // 入力が先に終わっても読み残しの行は受け取れるが、閉じた後の rl.prompt() は投げるので見分ける
  let closed = false;
  rl.on("close", () => (closed = true));

  // 色は端末に出す時だけ付ける（NO_COLOR なども styleText が見てくれる）
  const style = (format, text) => styleText(format, text, { stream: output });

  // 回答後に質問ごと1行へまとめ直すため、質問を出してから何行使ったかを数える
  // 端末の幅で折り返した分も1行として数える
  let rows = 0;
  const countRows = (text) => {
    rows += Math.max(1, Math.ceil(getWidth(text.replace(/\x1b\[[0-9;]*m/g, "")) / (output.columns || Infinity)));
  };
  const writeLine = (text) => {
    output.write(`${text}\n`);
    countRows(text);
  };

  // 1行読む。prefill は聞き直す時に前回の入力を入れておくためのもの
  // 読み残しも無く閉じられていたら中断として扱う
  const readLine = async (text, prefill = "") => {
    if (closed) {
      output.write(text);
    } else {
      rl.setPrompt(text);
      rl.prompt();
      if (terminal && prefill) {
        rl.write(prefill);
      }
    }
    const { value, done } = await lines.next();
    if (done) {
      throw createCanceledError();
    }
    countRows(`${text}${muted ? "" : value}`);
    return value;
  };

  // 打った文字の代わりに mask を表示しながら1行読む
  const readHidden = async (text, mask, prefill) => {
    // readline が rl.line を更新した後に呼ばれるので、毎回プロンプトごと描き直す
    const render = () => output.write(`\r\x1b[2K${text}${mask.repeat([...rl.line].length)}`);
    const onKeypress = (_, key = {}) => {
      if (key.name !== "return" && key.name !== "enter") {
        render();
      }
    };
    output.write(text);
    muted = true;
    if (terminal) {
      input.on("keypress", onKeypress);
      // prefill は readLine の中で入るので、入った後に一度描いておく
      queueMicrotask(render);
    }
    try {
      return await readLine(text, prefill);
    } finally {
      input.off("keypress", onKeypress);
      muted = false;
      output.write("\n");
    }
  };

  // 回答が決まったら、質問から回答までを `? 質問 回答` の1行に描き直す
  const settle = (message, display) => {
    if (terminal) {
      output.write(`\x1b[${rows}A\r\x1b[0J${message}${style("cyan", display)}\n`);
    }
    rows = 0;
  };

  const writeError = (result) => writeLine(style("red", `>> ${result}`));

  // 通るまで聞き直す
  const ask = async (question) => {
    const message = `${style(["green", "bold"], "?")} ${style("bold", question.message)} `;
    rows = 0;

    if (question.type === "rawlist") {
      writeLine(message);
      question.choices.forEach((choice, index) => writeLine(`  ${index + 1}) ${choice.name}`));
      let answer = "";
      for (;;) {
        answer = await readLine("  Answer: ", answer);
        const choice = question.choices[Number(answer.trim()) - 1];
        if (choice) {
          settle(message, choice.name);
          return choice.value;
        }
        writeError("Please enter a valid index.");
      }
    }

    const defaultValue = question.default;
    const text = defaultValue === undefined ? message : `${message}${style("dim", `(${defaultValue})`)} `;
    const mask = question.mask ?? "*";
    let answer = "";
    for (;;) {
      answer = question.type === "password" ? await readHidden(text, mask, answer) : await readLine(text, answer);
      const value = answer === "" && defaultValue !== undefined ? defaultValue : answer;
      const result = question.validate ? question.validate(value) : true;
      if (result === true) {
        settle(message, question.type === "password" ? mask.repeat([...value].length) : value);
        return value;
      }
      writeError(result);
    }
  };

  try {
    const answers = {};
    for (const question of [questions].flat()) {
      answers[question.name] = await ask(question);
    }
    return answers;
  } finally {
    rl.close();
  }
};
