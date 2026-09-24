import { isEmail } from "./isEmail.mjs";
import { isInputs } from "./isInputs.mjs";

// 設定ファイルの中身を実行前に確かめて、駄目なところをまとめて知らせる
//
// 対話式は inquirer の validate が弾いてくれるが、inputs.json は素通しになる
// 打ち間違いに気づくのがブラウザを起動してログイン画面に着いてからでは遅い
//
// mode は assigner() が自分の知っているモードと突き合わせるので、ここでは見ない
export const getValidatedInputs = (inputs, filepath) => {
  if (Object.prototype.toString.call(inputs) !== "[object Object]") {
    throw new Error(`[ERROR]設定ファイルはオブジェクトで書いてください: ${filepath}`);
  }

  // 対話式と同じ validator を通すので、駄目な時は同じ文言が返る
  const required = [
    ["workspace", isInputs(inputs.workspace)],
    ["email", isEmail(inputs.email)],
    ["password", isInputs(inputs.password)],
  ].filter(([, result]) => result !== true);

  // 省略はできるが、書くなら真偽値であること
  // "false" のような文字列は常に真になるので、黙って意図と逆に振る舞ってしまう
  const optional = ["includeNsfw", "debug"]
    .filter((key) => key in inputs && typeof inputs[key] !== "boolean")
    .map((key) => [key, `Boolean required. (${JSON.stringify(inputs[key])})`]);

  const problems = [...required, ...optional];

  if (problems.length > 0) {
    throw new Error(
      [
        `[ERROR]設定ファイルの内容が正しくありません: ${filepath}`,
        ...problems.map(([key, message]) => `  ${key}: ${message}`),
      ].join("\n"),
    );
  }

  return inputs;
};
