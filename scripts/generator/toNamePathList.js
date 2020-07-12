const fs = require("fs");
const toBasename = require("../utilities/toBasename");

const toNamePathList = (category, output) => {
  const dir = `./decomoji/${category}/`;
  const list = fs.readdirSync(dir).filter((v) => {
    return /.+\.(png|gif|jpg|jpeg)$/.test(v);
  });

  const namePathList = list.map((file) => {
    const name = toBasename(file);
    const path = `${dir}${file}`;
    return {
      name,
      path,
    };
  });

  try {
    fs.writeFileSync(output, JSON.stringify(namePathList));
    console.log(`${output} has been saved!`);
  } catch (err) {
    throw err;
  }
};

toNamePathList("basic", "./scripts/manager/configs/list/v5_basic.json");
toNamePathList("extra", "./scripts/manager/configs/list/v5_extra.json");
toNamePathList("explicit", "./scripts/manager/configs/list/v5_explicit.json");
