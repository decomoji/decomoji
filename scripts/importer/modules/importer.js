const postEmojiAdd = require("./postEmojiAdd");
const injectUploadForm = require("./injectUploadForm");

const importer = async (page, inputs, targets) => {
  await page.evaluate(injectUploadForm);

  for(let i=0; i<targets.length; i++) {
    const targetAsCategory = targets[i];
    const amountAsCategory = targetAsCategory.length;
    const targetCategoryName = inputs.categories[i];

    console.log(`\n[${targetCategoryName}] category start!`)

    let j = 0;
    while(j < amountAsCategory) {
      const item = targetAsCategory[j];
      const targetBasename = item.split(".")[0];
  
      console.log(`${j + 1}/${amountAsCategory}: importing ${targetBasename}...`);
  
      const result = await postEmojiAdd(page, inputs.team_name, targetCategoryName, targetBasename, item);
  
      if (!result.ok) {
        console.log(`${j + 1}/${amountAsCategory}: ${result.error} ${targetBasename}.`);
        // ratelimited が返ってきていたら、インデックスをインクリメントせず3秒待ってもう一度実行する
        if (result.error === "ratelimited") {
          console.log("waiting...");
          await page.waitFor(3000);
        }
        continue;
      }
  
      console.log(`${j + 1}/${amountAsCategory}: imported ${targetBasename}.`);
      j++;
    }
  }
  return;
};

module.exports = importer;
