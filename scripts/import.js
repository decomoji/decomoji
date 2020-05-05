const inquirer = require("./inquirer");

if (process.argv[2]) {
  const inputs = require("./inputs.json");
  console.log(inputs);
} else {
  inquirer((answers) => {
    console.log(JSON.stringify(answers, null, "  "));
  });
}
