const fs = require("fs");
const toBasename = require("../utilities/toBasename");

const toNamePathList = (type, output) => {
  const dir = `./decomoji/${type}/`;
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

toNamePathList("basic", "./scripts/manager/configs/list/v4_basic.json");
toNamePathList("extra", "./scripts/manager/configs/list/v4_extra.json");
toNamePathList("preview", "./scripts/manager/configs/list/v5_all.json");
