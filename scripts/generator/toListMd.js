"use strict";

let fs = require("fs");

const header = {
  basic: `# デコモジ基本セット\n\nすぐに使えて Slack が楽しくなるセットです。\n\n`,
  extra: `# デコモジ拡張セット\n\n基本セットと合わせるとさらに Slack が便利で楽しくなるセットです。\n\n`,
  explicit: `# デコモジ露骨セット\n\n性的なもの、暴力的なもの、露骨な表現で使用には注意が必要なものを隔離したセットです。多くの場合、使わない方が良いです。\n\n`,
};

const toListMd = (category) => {
  fs.readdir(`./decomoji/${category}/`, (err, files) => {
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
      text += `![${file.split(".")[0]}](../decomoji/${category}/${file})`;
    });

    try {
      fs.writeFileSync(`./docs/LIST-${category}.md`, header[category] + text);
      console.log(`LIST-${category}.md has been saved!`);
    } catch (err) {
      throw err;
    }
  });
};

toListMd(process.argv[2]);
