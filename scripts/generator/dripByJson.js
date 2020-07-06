const fs = require("fs");

const dripByJson = (jsonPath, targetDir) => {
  const json = JSON.parse(fs.readFileSync(jsonPath));

  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

  json.forEach((item) => {
    fs.copyFile(item.path, `${targetDir}${item.name}.png`, (err) => {
      if (err) throw err;
      console.log(`${item.path} has copied!`);
    });
  });
};

// node scripts/generator/dripByJson.js ~/Desktop/candidate_basic.json ~/Desktop/basic/
dripByJson(process.argv[2], process.argv[3]);
