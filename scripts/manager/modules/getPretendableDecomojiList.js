const fetchRemoteEmojiList = require("./fetchRemoteEmojiList");
const getLocalJson = require("./getLocalJson");

const getPretendableDecomojiList = async (page, inputs) => {
  // 登録済みのカスタム絵文字リストを取得する
  const remoteEmojiList = await fetchRemoteEmojiList(page, inputs);
  (inputs.debug || inputs.log) &&
    console.log("remoteEmojiList:", remoteEmojiList.length);
  (inputs.debug || inputs.log) && console.log(remoteEmojiList);

  // 対象デコモジリストを取得する
  const aliasList = getLocalJson(inputs.alias);
  (inputs.debug || inputs.log) && console.log("aliasList:", aliasList.length);
  (inputs.debug || inputs.log) && console.log(aliasList);

  // remoteEmojiList と aliasList を突合させて処理するアイテムだけのリストを作る
  const pretendableDecomojiList = aliasList.filter((alias) => {
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
  (inputs.debug || inputs.log) &&
    console.log("pretendableDecomojiList:", pretendableDecomojiList.length);
  (inputs.debug || inputs.log) && console.log(pretendableDecomojiList);

  return pretendableDecomojiList;
};

module.exports = getPretendableDecomojiList;
