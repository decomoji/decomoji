const fs = require("fs");

const copyByJson = (jsonPath, destDir) => {
  const fileList = JSON.parse(fs.readFileSync(jsonPath));

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

  fileList.forEach(({path, name}) => {
    const destPath = `${destDir}${name}.png`;
    try {
      fs.copyFileSync(path, destPath);
      console.log(`${path} has copied!`);
    } catch (err) {
      throw err
    }
  });
};

// node scripts/generator/copyByJson.js ~/Desktop/candidate_basic.json ~/Desktop/candidate_basic/
copyByJson(process.argv[2], process.argv[3]);
