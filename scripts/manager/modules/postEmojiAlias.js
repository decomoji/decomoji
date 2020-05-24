const postEmojiAlias = async (page, workspace, emojiName, aliasFor) => {
  // 埋め込んだ情報をもとにAPIにアクセスする
  const result = await page.evaluate(
    async (workspace, emojiName, aliasFor) => {
      const formData = new FormData();
      formData.append("mode", "alias");
      formData.append("name", emojiName);
      formData.append("alias_for", aliasFor);
      formData.append("token", window.boot_data.api_token);
      try {
        const response = await fetch(
          `https://${workspace}.slack.com/api/emoji.add`,
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
    emojiName,
    aliasFor
  );

  return result;
};

module.exports = postEmojiAlias;
