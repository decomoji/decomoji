import inquirer from "inquirer";
import { isEmail } from "../../utilities/isEmail.mjs";
import { isInputs } from "../../utilities/isInputs.mjs";
import { isSelects } from "../../utilities/isSelects.mjs";

// v6 では常に database/v6.json の内容（＝最新版）を対象にするので、バージョンは選ばせない
const MODE_ITEMS = [
  {
    name: "追加（更新）",
    value: "install",
  },
  {
    name: "移行（v5 から v6 へ）",
    value: "migration",
  },
  {
    name: "アンインストール",
    value: "uninstall",
  },
];

const TERM_ITEMS = [
  {
    name: "すべて",
    value: "all",
  },
  {
    name: "カテゴリーを指定",
    value: "category",
  },
];

const CATEGORY_ITEMS = [
  {
    name: "基本セット",
    value: "basic",
  },
  {
    name: "拡張セット",
    value: "extra",
  },
  {
    name: "露骨セット",
    value: "explicit",
  },
];

// inquirer 用の質問群
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
    message: "モードを選択してください:",
    choices: MODE_ITEMS,
  },
  {
    // 移行はすべてが対象になるので選ばせない
    when: ({ mode }) => mode === "install" || mode === "uninstall",
    type: "rawlist",
    name: "term",
    message: "対象を選択してください:",
    choices: TERM_ITEMS,
  },
  // {
  //   when: ({ term }) => term === "category",
  //   type: "checkbox",
  //   name: "configs",
  //   message: "カテゴリーを選択してください:",
  //   choices: CATEGORY_ITEMS,
  //   validate: isSelects,
  // },
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
    validate: isSelects,
  },
];

export const dialoger = async (callback) => await inquirer.prompt(questions).then(callback);
