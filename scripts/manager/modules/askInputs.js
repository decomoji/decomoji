const inquirer = require("inquirer");

const convertToLowerCasedArray = require("../../utilities/convertToLowerCasedArray");
const isEmail = require("../../utilities/isEmail");
const isInputs = require("../../utilities/isInputs");
const isSelects = require("../../utilities/isSelects");

// inquirer Setting
const questions = [
  {
    type: "input",
    name: "workspace",
    message: "ワークスペース（サブドメイン）を入力してください:",
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
    type: "list",
    name: "mode",
    message: "モードを選択してください:",
    choices: [
      {
        name: "登録",
        value: "upload",
      },
      {
        name: "エイリアス登録",
        value: "alias",
      },
      {
        name: "削除",
        value: "remove",
      },
      {
        name:
          "v4 から v5 への移行（v4 を全て削除し、v5 の基本セットと拡張セットを登録します）",
        value: "migration-v4-to-v5",
      },
      {
        name:
          "最新版の v5 への更新",
        value: "update-v5",
      },
    ],
  },
  {
    when: (answers) => {
      return answers.mode === "upload";
    },
    type: "checkbox",
    message: "追加するカテゴリーを選択してください:",
    name: "categories",
    choices: [
      {
        name: "基本セット（v5_basic）",
        value: "v5_basic",
      },
      {
        name: "拡張セット（v5_extra）",
        value: "v5_extra",
      },
      {
        name: "露骨セット（v5_explicit）",
        value: "v5_explicit",
      },
      {
        name:
          "修正セット（v5_fixed）",
        value: "v5_fixed",
      },
    ],
    filter: convertToLowerCasedArray,
    validate: isSelects,
  },
  {
    when: (answers) => {
      return answers.mode === "alias";
    },
    type: "checkbox",
    name: "alias",
    message: "エイリアスを選択してください:",
    choices: [
      {
        name: "v4 の修正セット（v4_fixed）",
        value: "v4_fixed",
      },
      {
        name:
          "v5 の修正セット（v5_fixed）",
        value: "v5_fixed",
      },
    ],
    validate: isSelects,
    filter: convertToLowerCasedArray,
  },
  {
    when: (answers) => {
      return answers.mode === "remove";
    },
    type: "checkbox",
    message: "削除するカテゴリーを選択してください:",
    name: "categories",
    choices: [
      {
        name: "v4 時代にファイル名を修正したセット",
        value: "v4_fixed",
      },
      {
        name: "v4 の基本セット",
        value: "v4_basic",
      },
      {
        name: "v4 の拡張セット",
        value: "v4_extra",
      },
      new inquirer.Separator(),
      {
        name: "v5 の基本セット",
        value: "v5_basic",
      },
      {
        name: "v5 の拡張セット",
        value: "v5_extra",
      },
      {
        name: "v5 の露骨セット",
        value: "v5_explicit",
      },
      {
        name: "v5 の修正セット（v5_fixed）",
        value: "v5_fixed",
      },
    ],
    filter: convertToLowerCasedArray,
    validate: isSelects,
  },
  // {
  //   type: "list",
  //   name: "suffix",
  //   message: "Select suffix mode.",
  //   choices: [
  //     {
  //       name: "nothing",
  //       value: false,
  //     },
  //     {
  //       name: "recommended ('_dcmj')",
  //       value: true,
  //     },
  //     {
  //       name: "custom",
  //     },
  //   ],
  //   default: true,
  // },
  // {
  //   type: "input",
  //   name: "customSuffix",
  //   message: "Enter your suffix.",
  //   when: function (answers) {
  //     return answers.suffix === "custom";
  //   },
  // },
];

module.exports = (callback) => {
  inquirer.prompt(questions).then(callback);
};
