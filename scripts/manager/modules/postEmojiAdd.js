const postEmojiAdd = async (page, team_name, emoji_name, emoji_path) => {
      
  const fileInputHandle = await page.$('#decomoji_file_input');
  await fileInputHandle.uploadFile(emoji_path);

  const result = await page.evaluate( async (team_name, emoji_name) => {
    const formData = new FormData(document.querySelector('#decomoji_upload_form'));
    formData.append('name', emoji_name);
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
  }, team_name, emoji_name);

  return result;
};

module.exports = postEmojiAdd;
