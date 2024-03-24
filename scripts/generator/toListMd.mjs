import fs from "fs/promises";
import { convertFilepathToBasename } from "../utilities/convertFilepathToBasename.mjs";

const contents = {
  basic: `# デコモジ基本セット\n\nすぐに使えて Slack が楽しくなるセットです。\n\n`,
  extra: `# デコモジ拡張セット\n\n基本セットと合わせるとさらに Slack が便利で楽しくなるセットです。\n\n`,
  explicit: `# デコモジ露骨セット\n\n性的なもの、暴力的なもの、露骨な表現で使用には注意が必要なものを隔離したセットです。多くの場合、使わない方が良いです。\n\n`,
};

const toListMd = async (category) => {
  await fs
    .readdir(`./decomoji/${category}/`)
    .then((files) => {
      files.forEach((file) => {
        if (file === ".DS_Store") return;
        contents[category] += `![${convertFilepathToBasename(
          file,
        )}](../decomoji/${category}/${file})`;
      });
    })
    .catch((err) => {
      // ENOENT エラーを catch した場合は throw しない
      if (err.code !== "ENOENT") {
        throw err;
      }
    });
  return await fs
    .writeFile(`./docs/LIST-${category}.md`, contents[category])
    .then(() => {
      console.log(`LIST-${category}.md has been saved!`);
    })
    .catch((err) => {
      throw err;
    });
};

// 常に全カテゴリーを書き出す
Object.keys(contents).forEach(async (category) => {
  await toListMd(category);
});
