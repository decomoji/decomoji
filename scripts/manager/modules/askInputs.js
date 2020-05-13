/**
  inputs.json もしくは inquirer のレスポンスの型定義
  @typedef {{
    workspace: string;
    email: string;
    password: string;
    categories: ("basic" | "extra" | "explicit")[];
    suffix: boolean;
    customSuffix?: boolean;
    execMode: "add" | "alias" | "remove";
  }} Inputs;
*/

const inquirer = require("inquirer");

const convertToLowerCasedArray = require("../utilities/convertToLowerCasedArray");
const isEmail = require("../utilities/isEmail");
const isInputs = require("../utilities/isInputs");
const isSelects = require("../utilities/isSelects");

// inquirer Setting
const questions = [
  {
    type: "input",
    name: "workspace",
    message: "Enter workspace (subdomain).",
    validate: isInputs,
  },
  {
    type: "input",
    name: "email",
    message: "Enter login email.",
    validate: isEmail,
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
      // {
      //   name: "Explicit",
      // },
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
  {
    type: "list",
    name: "execMode",
    message: "Select script mode.",
    choices: [
      {
        name: "Import",
        value: "add",
      },
      // {
      //   name: "Alias",
      //   value: "alias",
      // },
      {
        name: "Remove",
        value: "remove",
      },
    ],
  },
];

module.exports = (callback) => {
  /** @param {Inputs} inputs */
  inquirer.prompt(questions).then(callback);
};
