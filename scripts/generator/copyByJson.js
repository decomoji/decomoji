const fs = require("fs");

const copyByJson = (jsonPath, destDir, mode) => {
  const fileList = JSON.parse(fs.readFileSync(jsonPath));

  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir);

  fileList.forEach(({ path, name }) => {
    const destPath = `${destDir}${name}.png`;
    try {
      if (mode === "move") {
        fs.renameSync(path, destPath);
      } else {
        fs.copyFileSync(path, destPath);
      }
      console.log(`${path} has been copied!`);
    } catch (err) {
      throw err;
    }
  });
};

// node scripts/generator/copyByJson.js ~/Downloads/my-collection.json ./decomoji/my-collection/
// node scripts/generator/copyByJson.js ~/Downloads/my-collection.json ./decomoji/my-collection/ move
copyByJson(process.argv[2], process.argv[3], process.argv[4]);
