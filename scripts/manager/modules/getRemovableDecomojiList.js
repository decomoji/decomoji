const fetchRemoteEmojiList = require("./fetchRemoteEmojiList");
const getLocalDecomojiList = require("./getLocalDecomojiList");

const getRemovableDecomojiList = async (page, inputs) => {
  // 登録済みのカスタム絵文字リストを取得する
  const remoteEmojiList = await fetchRemoteEmojiList(page, inputs);
  inputs.debug &&
    inputs.fatlog &&
    console.log("remoteEmojiList:", remoteEmojiList.length, remoteEmojiList);

  // 対象デコモジリストを取得する
  const localDecomojiList = getLocalDecomojiList(inputs.categories);
  inputs.debug &&
    inputs.fatlog &&
    console.log(
      "localDecomojiList:",
      localDecomojiList.length,
      localDecomojiList
    );

  // remoteEmojiList と localDecomojiList を突合させて処理するアイテムだけのリストを作る
  const removableDecomojiList = localDecomojiList.filter((item) => {
    return remoteEmojiList.findIndex((v) => v.name === item.name) >= 0;
  });
  inputs.debug &&
    inputs.fatlog &&
    console.log(
      "removableDecomojiList:",
      removableDecomojiList.length,
      removableDecomojiList
    );

  return removableDecomojiList;
};

module.exports = getRemovableDecomojiList;
