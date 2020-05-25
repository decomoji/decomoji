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
    type: "list",
    name: "mode",
    message: "Select script mode.",
    choices: [
      {
        name: "Upload",
      },
      {
        name: "Alias",
      },
      {
        name: "Remove",
      },
    ],
    filter: (answers) => {
      return answers.toLowerCase();
    },
  },
  {
    type: "checkbox",
    message: "Select categories.",
    name: "categories",
    choices: [
      {
        name: "Basic",
        value: "v5_basic",
      },
      {
        name: "Extra",
        value: "v5_extra",
      },
      // {
      //   name: "Explicit",
      // },
    ],
    filter: convertToLowerCasedArray,
    validate: isSelects,
    when: (answers) => {
      return answers.mode !== "alias";
    },
  },
  {
    type: "checkbox",
    name: "alias",
    message: "Select alias preset.",
    choices: [
      {
        name: "migration v4 to v5",
        value: "migration",
      },
    ],
    validate: isSelects,
    filter: convertToLowerCasedArray,
    when: (answers) => {
      return answers.mode === "alias";
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
