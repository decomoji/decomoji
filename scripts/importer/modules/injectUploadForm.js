const injectUploadForm = async () => {
  const form = document.createElement('form');
  const token = window.boot_data.api_token;
  form.id = 'decomoji_upload_form';
  form.innerHTML = `
    <input type="hidden" id="decomoji_name_input" name="name">
    <input type="hidden" id="decomoji_token_input" name="token" value="${token}">
    <input type="hidden" id="decomoji_mode_input" name="mode" value="data">
    <input type="file" id="decomoji_file_input" name="image">
  `;

  document.body.append(form);
};

module.exports = injectUploadForm;
