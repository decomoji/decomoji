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
    type: "list",
    name: "mode",
    message: "モードを選択してください:",
    choices: [
      {
        name: "更新",
        value: "update",
      },
      {
        name: "登録",
        value: "upload",
      },
      {
        name: "削除",
        value: "remove",
      },
      {
        name: "エイリアス登録",
        value: "alias",
      },
      {
        name: "移行（v4 を v5 に置換）",
        value: "migration",
      },
    ],
  },
  {
    when: (answers) => {
      return answers.mode === "upload";
    },
    type: "checkbox",
    message: "登録するカテゴリーを選択してください:",
    name: "categories",
    choices: [
      {
        name: "基本セット",
        value: "v5_basic",
      },
      {
        name: "拡張セット",
        value: "v5_extra",
      },
      {
        name: "露骨セット",
        value: "v5_explicit",
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
    message: "登録するエイリアスを選択してください:",
    choices: [
      {
        name: "v5 以降でファイル名を修正したもの",
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
        name: "基本セット",
        value: "v5_basic",
      },
      {
        name: "拡張セット",
        value: "v5_extra",
      },
      {
        name: "露骨セット",
        value: "v5_explicit",
      },
      {
        name: "v5 以降でファイル名にミスがあったもの",
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
