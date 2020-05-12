const postEmojiAdd = require("./postEmojiAdd");
const injectUploadForm = require("./injectUploadForm");

const importer = async (page, inputs, targets) => {
  await page.evaluate(injectUploadForm);

  const targetLength = targets.length;
  let currentCategory = '';
  let i = 0;

  while(i < targetLength) {
    const target = targets[i];
    const { category, name, path } = target;
    const currentIdx = i + 1;

    if (currentCategory === '' && currentCategory !== category) {
      console.log(`\n[${category}] category start!`)
      currentCategory = category;
    }

    console.log(`${currentIdx}/${targetLength}: importing ${name}...`);

    const result = await postEmojiAdd(page, inputs.team_name, name, path);

    if (!result.ok) {
      console.log(`${currentIdx}/${targetLength}: ${result.error} ${name}.`);
      // ratelimited が返ってきていたら、インデックスをインクリメントせず3秒待ってもう一度実行する
      if (result.error === "ratelimited") {
        console.log("waiting...");
        await page.waitFor(3000);
      }
      continue;
    }

    console.log(`${currentIdx}/${targetLength}: imported ${name}.`);
    i++;
  }

  return;
};

module.exports = importer;
