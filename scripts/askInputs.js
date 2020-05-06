const inquirer = require("inquirer");

const convertToLowerCasedArray = require("./utilities/convertToLowerCasedArray");
const isEmail = require("./utilities/isEmail");
const isInputs = require("./utilities/isInputs");
const isSelects = require("./utilities/isSelects");

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
      {
        name: "Explicit",
      },
    ],
    filter: convertToLowerCasedArray,
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

module.exports = (callback) => {
  inquirer.prompt(questions).then(callback);
};
