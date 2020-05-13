const fetchRemoteEmojiList = async (page, inputs) => {

  const { team_name } = inputs;

  inputs.debug && inputs.fatlog &&
    console.log('\nStart to fetch remote emoji list...');

  const remoteEmojiList = await page.evaluate( async (team_name) => {

    /** @type {EmojiAdminList} */
    let emojiAdminList = [];
    const fetchEmojiAdminList = async (nextPage) => {
      const param = {
        page: nextPage || 1,
        count: 100,
        token: window.boot_data.api_token,
      };
      try {
        const response = await fetch(
          `https://${team_name}.slack.com/api/emoji.adminList`,
          {
            method: "POST",
            headers: { Accept: "application/json" },
            body: Object.keys(param).reduce(
              (o, key) => (o.set(key, param[key]), o),
              new FormData()
            ),
          }
        );
        const data = await response.json();
        emojiAdminList.push(...data.emoji);
        // 最終ページまで fetch したら resolve する
        if (data.paging.page === data.paging.pages) {
          return;
        }
        // 次のページを fetch
        await fetchEmojiAdminList(data.paging.page + 1);
      } catch (e) {
        return e;
      }
    };

    // 絵文字を全件取得する
    await fetchEmojiAdminList();
    return emojiAdminList;

  }, team_name);

  inputs.debug && inputs.fatlog &&
    console.log('Complete to fetch remote emoji list!\n');

  return remoteEmojiList;
};

module.exports = fetchRemoteEmojiList;