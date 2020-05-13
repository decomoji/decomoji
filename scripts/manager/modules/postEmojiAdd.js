const postEmojiAdd = async (page, team_name, emoji_name, emoji_path) => {

  const upload_form_id = "decomoji_upload_form";

  // 1度だけページにアップロード用の form 要素を挿入する
  if (await page.$(`#${upload_form_id}`).then((res) => !res)) {
    console.log('初回だけformを追加する');
    await page.evaluate(async (upload_form_id) => {
      const form = document.createElement('form');
      const token = window.boot_data.api_token;
      form.id = upload_form_id;
      form.innerHTML = `
      <input type="hidden" id="decomoji_name_input" name="name">
      <input type="hidden" id="decomoji_token_input" name="token" value="${token}">
      <input type="hidden" id="decomoji_mode_input" name="mode" value="data">
      <input type="file" id="decomoji_file_input" name="image">
    `;
      document.body.append(form);
    }, upload_form_id);
  }

  // 画像ファイルをinput[type=file]にセットする
  const fileInputHandle = await page.$('#decomoji_file_input');
  await fileInputHandle.uploadFile(emoji_path);

  // 埋め込んだ情報をもとにAPIにアクセスする
  const result = await page.evaluate( async (team_name, upload_form_id, emoji_name) => {
    const formData = new FormData(document.querySelector(`#${upload_form_id}`));
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
  }, team_name, upload_form_id, emoji_name);

  return result;
};

module.exports = postEmojiAdd;
