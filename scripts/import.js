const inquirer = require("./inquirer");

let inputs = {};

inquirer((answers) => {
  // console.log(JSON.stringify(answers, null, "  "));
  inputs = { ...answers }
  console.log(inputs)
});
