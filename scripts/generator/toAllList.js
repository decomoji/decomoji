const fs = require("fs");

const toAllList = async (targets, output) => {
  const flattenTargetJsons = targets
    .map((jsonPath) => JSON.parse(fs.readFileSync(jsonPath)))
    .flat();

  try {
    fs.writeFileSync(output, JSON.stringify(flattenTargetJsons));
    console.log(`${output} has been saved!`);
  } catch (err) {
    throw err;
  }
};

toAllList(
  [
    "./scripts/manager/configs/list/v5_basic.json",
    "./scripts/manager/configs/list/v5_extra.json",
    "./scripts/manager/configs/list/v5_explicit.json",
  ],
  "./scripts/manager/configs/list/v5_all.json"
);
