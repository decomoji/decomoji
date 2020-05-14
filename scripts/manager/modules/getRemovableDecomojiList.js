const fetchRemoteEmojiList = require("./fetchRemoteEmojiList");
const getLocalDecomojiList = require("./getLocalDecomojiList");

const getRemovableDecomojiList = async (page, inputs) => {
  // 登録済みのカスタム絵文字リストを取得する
  const remoteEmojiList = await fetchRemoteEmojiList(page, inputs);
  inputs.debug &&
    inputs.fatlog &&
    console.log("\nremoteEmojiList:", remoteEmojiList.length, remoteEmojiList);

  // 対象デコモジリストを取得する
  const localDecomojiList = getLocalDecomojiList(inputs.categories);
  inputs.debug &&
    inputs.fatlog &&
    console.log(
      "\nlocalDecomojiList:",
      localDecomojiList.length,
      localDecomojiList
    );

  // remoteEmojiList と localDecomojiList を突合させて処理するアイテムだけのリストを作る
  const removableDecomojiList = localDecomojiList.filter((local) => {
    return (
      remoteEmojiList.findIndex(
        (remote) => remote.name === local.name && remote.can_delete
      ) >= 0
    );
  });
  inputs.debug &&
    inputs.fatlog &&
    console.log(
      "\nremovableDecomojiList:",
      removableDecomojiList.length,
      removableDecomojiList
    );

  return removableDecomojiList;
};

module.exports = getRemovableDecomojiList;
