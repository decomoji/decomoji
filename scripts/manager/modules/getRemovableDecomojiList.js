const fetchRemoteEmojiList = require("./fetchRemoteEmojiList");
const getLocalDecomojiList = require("./getLocalDecomojiList");

const getRemovableDecomojiList = async (page, inputs) => {
  const LOG = inputs.debug || inputs.log;
  // 登録済みのカスタム絵文字リストを取得する
  const remoteEmojiList = await fetchRemoteEmojiList(page, inputs);

  // 対象デコモジリストを取得する
  const localDecomojiList = getLocalDecomojiList(inputs.categories, LOG);

  // remoteEmojiList と localDecomojiList を突合させて処理するアイテムだけのリストを作る
  const removableDecomojiList = localDecomojiList.filter((local) => {
    return (
      remoteEmojiList.findIndex(
        (remote) => remote.name === local.name && remote.can_delete
      ) >= 0
    );
  });
  LOG &&
    console.log(
      `removableDecomojiList(${removableDecomojiList.length}): ${removableDecomojiList}`
    );
  return removableDecomojiList;
};

module.exports = getRemovableDecomojiList;
