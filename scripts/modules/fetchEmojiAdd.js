const fetchEmojiAdd = async (team_name, name, image) => {
  const param = {
    mode: "data",
    name,
    image,
    token: window.boot_data.api_token,
  };
  try {
    await fetch(
      `https://${team_name}.slack.com/api/emoji.add`,
      {
        method: "POST",
        body: Object.keys(param).reduce(
          (o, key) => (o.set(key, param[key]), o),
          new FormData()
        ),
      }
    );
  } catch (error) {
    console.log(error);
    return error;
  }
  return;
};

module.exports = fetchEmojiAdd;
