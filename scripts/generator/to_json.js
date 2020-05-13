"use strict";

let fs = require("fs");

function generate_decomoji_json(type) {
  fs.readdir(`./decomoji/${type}/`, (err, files) => {
    if (err) {
      if (err.code === "ENOENT") {
        files = [".DS_Store"];
      } else {
        throw err;
      }
    }

    const decomoji_array = files.reduce((memo, file) => {
      return file === ".DS_Store" ? memo : memo.concat(file.split(".")[0]);
    }, []);

    if (!fs.existsSync("./json")) fs.mkdirSync("./json");

    fs.writeFile(
      `./json/${type}.json`,
      `{"${type}": ${JSON.stringify(decomoji_array)}}`,
      (err) => {
        if (err) throw err;
        console.log(`${type}.json has been saved!`);
      }
    );
  });
}

generate_decomoji_json("basic");
generate_decomoji_json("extra");
