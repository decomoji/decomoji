"use strict";

let fs = require("fs");

const header = {
  basic: `# デコモジ基本セット\n\nすぐに使えて Slack が楽しくなる基本セットです。\n\n`,
  extra: `# デコモジ拡張セット\n\n作りたいと思った気持ちのままに作った拡張セットです。使い方にご注意ください。\n\n`,
};

function toListMd(type) {
  fs.readdir(`./decomoji/${type}/`, (err, files) => {
    if (err) {
      if (err.code === "ENOENT") {
        files = [".DS_Store"];
      } else {
        throw err;
      }
    }

    let text = "";

    files.forEach((file) => {
      if (file === ".DS_Store") return;
      text += `![${file.split(".")[0]}](../decomoji/${type}/${file})`;
    });

    try {
      fs.writeFileSync(`./docs/decomoji-${type}.md`, header[type] + text);
      console.log(`decomoji-${type}.md has been saved!`);
    } catch (err) {
      throw err;
    }
  });
}

toListMd("basic");
toListMd("extra");
