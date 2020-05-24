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
    when: (answers) => {
      return answers.mode !== "Alias";
    },
  },
  {
    type: "list",
    name: "alias",
    message: "Select alias preset.",
    choices: [
      {
        name: "v4 to v5",
        value: "scripts/manager/configs/oldies.json",
      },
    ],
    when: (answers) => {
      return answers.mode === "Alias";
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
