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

  fs.writeFileSync(output, JSON.stringify(namePathList), (err) => {
    if (err) throw err;
    console.log(`${output} has been saved!`);
  });
};

toNamePathList("basic", "./scripts/manager/configs/list/v4_basic.json");
toNamePathList("extra", "./scripts/manager/configs/list/v4_extra.json");
