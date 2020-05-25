const fetchRemoteEmojiList = require("./fetchRemoteEmojiList");
const getLocalJson = require("./getLocalJson");

const getPretendableDecomojiList = async (page, inputs) => {
  const LOG = inputs.debug || inputs.log;
  // 登録済みのカスタム絵文字リストを取得する
  const remoteEmojiList = await fetchRemoteEmojiList(page, inputs);

  // 対象デコモジリストを取得する
  const aliasDecomojiList = getLocalJson(inputs.alias, inputs.mode, LOG);

  // remoteEmojiList と aliasDecomojiList を突合させて処理するアイテムだけのリストを作る
  const pretendableDecomojiList = aliasDecomojiList.filter((alias) => {
    return (
      remoteEmojiList.findIndex((remote) => {
        // エイリアスを貼ろうとしている絵文字がリモートに存在するリスト
        return remote.name === alias.alias_for;
      }) >= 0 &&
      remoteEmojiList.findIndex((remote) => {
        // エイリアスとなるファイル名がリモートに存在しないリスト
        return remote.name === alias.name;
      }) === -1
    );
  });
  LOG &&
    console.log(
      `pretendableDecomojiList(${pretendableDecomojiList.length}): ${pretendableDecomojiList}`
    );
  return pretendableDecomojiList;
};

module.exports = getPretendableDecomojiList;
