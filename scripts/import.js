"use strict";

const MESSAGE_NO_VALUE = "Input required.";
const MESSAGE_NO_SELECTION = "Choice required.";

const inquirer = require("inquirer");

// 値が空ではない文字列であるか否か、否の場合エラーメッセージを返す
const isInputs = (value) => {
  return Object.prototype.toString.call(value) === "[object String]" &&
    value.length > 0
    ? true
    : MESSAGE_NO_VALUE;
};

// 配列のアイテムが1つ以上あるか否か、否の場合エラーメッセージを返す
const isSelects = (selection) => {
  return selection.length ? true : MESSAGE_NO_SELECTION;
};

//
const convertLowerCaseMap = (array) => {
  return array.map((item) => {
    return item.toLowerCase();
  });
};

// inquirer Setting
const questions = [
  {
    type: "input",
    name: "team_name",
    message: "Enter your slack team (subdomain).",
    validate: isInputs,
  },
  {
    type: "input",
    name: "email",
    message: "Enter login email.",
    validate: isInputs,
  },
  {
    type: "password",
    name: "password",
    mask: "*",
    message: "Enter a password.",
    validate: isInputs,
  },
  {
    type: "checkbox",
    message: "Select categories.",
    name: "categories",
    choices: [
      {
        name: "Basic",
      },
      {
        name: "Extra",
      },
      {
        name: "Explicit",
      },
    ],
    filter: convertLowerCaseMap,
    validate: isSelects,
  },
  {
    type: "list",
    name: "suffix",
    message: "Select suffix mode.",
    choices: [
      {
        name: "no-suffix",
        value: false,
      },
      {
        name: "default (recommended. '_dcmj' suffixed.)",
        value: true,
      },
      {
        name: "custom",
      },
    ],
    default: true,
  },
  {
    type: "input",
    name: "custom_suffix",
    message: "Enter your suffix.",
    when: function (answers) {
      return answers.suffix === "custom";
    },
  },
  {
    type: "list",
    name: "mode",
    message: "Select script mode.",
    choices: [
      {
        name: "Import decomoji",
        value: "add",
      },
      {
        name: "Register alias to decomoji",
        value: "alias",
      },
      {
        name: "Remove decomoji",
        value: "remove",
      },
    ],
  },
];

inquirer.prompt(questions).then((answers) => {
  console.log(JSON.stringify(answers, null, "  "));
});
