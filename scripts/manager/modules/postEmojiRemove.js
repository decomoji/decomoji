const postEmojiRemove = async (page, workspace, emojiName) => {
  // 埋め込んだ情報をもとにAPIにアクセスする
  const result = await page.evaluate(
    async (workspace, emojiName) => {
      const formData = new FormData();
      formData.append("name", emojiName);
      formData.append("token", window.boot_data.api_token);
      try {
        const response = await fetch(
          `https://${workspace}.slack.com/api/emoji.remove`,
          {
            method: "POST",
            body: formData,
          }
        );
        return await response.json();
      } catch (error) {
        return error;
      }
    },
    workspace,
    emojiName
  );

  return result;
};

module.exports = postEmojiRemove;
