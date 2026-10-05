import { isEmail, isInputs, prompt } from "../../utilities/index.mjs";

// 対話式の質問群
const questions = [
  {
    type: "input",
    name: "workspace",
    message: "ワークスペースのサブドメインを入力してください:",
    validate: isInputs,
  },
  {
    type: "input",
    name: "email",
    message: "メールアドレスを入力してください:",
    validate: isEmail,
  },
  {
    type: "password",
    name: "password",
    mask: "*",
    message: "パスワードを入力してください:",
    validate: isInputs,
  },
  {
    type: "rawlist",
    name: "mode",
    message: "実行モードを選択してください:",
    choices: [
      {
        name: "更新",
        value: "update",
      },
      {
        name: "全削除",
        value: "uninstall",
      },
      {
        name: "移行（v4/v5 を削除して v6 を追加）",
        value: "migration",
      },
      {
        name: "互換のある移行（移行 + v5 -> v6のエイリアス登録）",
        value: "compatible_migration",
      },
    ],
  },
  {
    type: "rawlist",
    name: "debug",
    message: "デバッグモードで実行しますか？:",
    choices: [
      {
        name: "いいえ",
        value: false,
      },
      {
        name: "はい",
        value: true,
      },
    ],
  },
];

export const dialoger = async (callback) => await prompt(questions).then(callback);
