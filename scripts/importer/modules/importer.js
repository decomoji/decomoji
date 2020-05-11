const fs = require("fs");
const postEmojiAdd = require("./postEmojiAdd");

const importer = async (page, inputs, targets, existsName) => {
  for(let i=0; i<targets.length; i++) {
    const targetAsCategory = targets[i];
    const amountAsCategory = targetAsCategory.length;
    const targetCategoryName = inputs.categories[i];

    console.log(`\n[${targetCategoryName}] category start!`)

    for(let i=0; i<amountAsCategory; i++) {
      const item = targetAsCategory[i];
      const targetBasename = item.split(".")[0];

      // 登録済みカスタム絵文字に追加しようとしているデコモジと同じファイル名がある場合はスキップする
      if (existsName.has(targetBasename)) {
        console.log(`Skip ${targetBasename}... Already exists.`);
        continue;
      }

      console.log(`${i+1}/${amountAsCategory}: importing ${targetBasename}...`)
      
      const file = await fs.readFileSync(`./decomoji/${targetCategoryName}/${item}`, "binary");
      await page.evaluate(postEmojiAdd, inputs.team_name, targetBasename, file);
    }
  }
  return;
};

module.exports = importer;
