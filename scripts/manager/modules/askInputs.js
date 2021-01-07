const inquirer = require("inquirer");
const format = require("date-fns/format");

const getGitTagArray = require("../../utilities/getGitTagArray");
const isEmail = require("../../utilities/isEmail");
const isInputs = require("../../utilities/isInputs");
const isSelects = require("../../utilities/isSelects");

const MODE_ITEMS = [
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
];

const CATEGORY_ITEMS = [
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
];

const MONTH_LIST = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
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
    choices: MODE_ITEMS,
  },
  {
    when: ({ mode }) =>
      mode === "update" || mode === "upload" || mode === "remove",
    type: "list",
    message: "対象タイプを選択してください:",
    name: "term",
    choices: [
      {
        name: "カテゴリーごと",
        value: "category",
      },
      {
        name: "バージョンごと",
        value: "version",
      },
    ],
    validate: isSelects,
  },
  {
    when: ({ term }) => term === "category",
    type: "checkbox",
    message: "カテゴリーを選択してください:",
    name: "configs",
    choices: ({ mode }) => {
      return mode === "remove"
        ? [
            ...CATEGORY_ITEMS,
            {
              name: "v5 以降でファイル名にミスがあったもの",
              value: "v5_fixed",
            },
          ]
        : CATEGORY_ITEMS;
    },
    validate: isSelects,
  },
  {
    when: ({ term }) => term === "version",
    type: "checkbox",
    message: "バージョンを選択してください:",
    name: "configs",
    choices: [new inquirer.Separator(), ...[]],
    validate: isSelects,
  },
  {
    when: ({ mode }) => mode === "alias",
    type: "checkbox",
    name: "configs",
    message: "エイリアスを選択してください:",
    choices: [
      {
        name: "v5 以降でファイル名を修正したもの",
        value: "v5_rename",
      },
    ],
    validate: isSelects,
  },
  {
    when: ({ mode }) =>
      mode === "update" || mode === "remove" || mode === "migration",
    type: "list",
    message: "削除の強さを選択してください:",
    name: "forceRemove",
    choices: [
      {
        name: "強（権限があれば他メンバーが登録したデコモジも消す）",
        value: true,
      },
      {
        name: "弱（自分が登録したデコモジだけ消す）",
        value: false,
      },
    ],
    validate: isSelects,
  },
];

module.exports = (callback) => {
  inquirer.prompt(questions).then(callback);
};
