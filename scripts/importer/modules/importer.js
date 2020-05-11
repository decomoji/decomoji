const postEmojiAdd = require("./postEmojiAdd");
const injectUploadForm = require("./injectUploadForm");

const importer = async (page, inputs, targets, existsNames) => {
  await page.evaluate(injectUploadForm);

  for(let i=0; i<targets.length; i++) {
    const targetAsCategory = targets[i];
    const amountAsCategory = targetAsCategory.length;
    const targetCategoryName = inputs.categories[i];

    console.log(`\n[${targetCategoryName}] category start!`)

    for(let i=0; i<amountAsCategory; i++) {
      const item = targetAsCategory[i];
      const targetBasename = item.split(".")[0];

      // 登録済みカスタム絵文字に追加しようとしているデコモジと同じファイル名がある場合はスキップする
      if (existsNames.has(targetBasename)) {
        console.log(`Skip ${targetBasename}... Already exists.`);
        continue;
      }

      console.log(`${i + 1}/${amountAsCategory}: importing ${targetBasename}...`);

      const result = await postEmojiAdd(page, inputs.team_name, targetCategoryName, targetBasename, item);

      if (!result.ok) {
        console.log(`${i + 1}/${amountAsCategory}: ${result.error} ${targetBasename}.`);
        continue;
      }

      console.log(`${i + 1}/${amountAsCategory}: imported ${targetBasename}.`);
    }
  }
  return;
};

module.exports = importer;
