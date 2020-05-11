const postEmojiAdd = async (page, team_name, targetCategoryName, targetBasename, item) => {
      
  const fileInputHandle = await page.$('#decomoji_file_input');
  const filePath = `./decomoji/${targetCategoryName}/${item}`;
  await fileInputHandle.uploadFile(filePath);

  await page.evaluate(() => {
    console.log('The quick brown fox jumps over the lazy dog.')
  })

  const result = await page.evaluate( async (team_name, targetBasename) => {
    const formData = new FormData(document.querySelector('#decomoji_upload_form'));
    formData.append('name', targetBasename);
    try {
      const response = await fetch(`https://${team_name}.slack.com/api/emoji.add`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        body: formData
      })
      return await response.json();
    } catch (error) {
      return error;
    }
  }, team_name, targetBasename);

  return result;
};

module.exports = postEmojiAdd;
