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
    ],
  },
  {
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
    ],
    filter: convertToLowerCasedArray,
    validate: isSelects,
    when: (answers) => {
      return answers.mode === "upload";
    },
  },
  {
    type: "checkbox",
    name: "alias",
    message: "エイリアスを選択してください:",
    choices: [
      {
        name:
          "v4_fixed to v5（v4 時代のミスのあったデコモジを v5 の新しいデコモジにリンクします）",
        value: "migration",
      },
    ],
    validate: isSelects,
    filter: convertToLowerCasedArray,
    when: (answers) => {
      return answers.mode === "alias";
    },
  },
  {
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
    ],
    filter: convertToLowerCasedArray,
    validate: isSelects,
    when: (answers) => {
      return answers.mode === "remove";
    },
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
