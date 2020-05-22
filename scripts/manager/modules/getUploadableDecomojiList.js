const fetchRemoteEmojiList = require("./fetchRemoteEmojiList");
const getLocalDecomojiList = require("./getLocalDecomojiList");

const getUploadableDecomojiList = async (page, inputs) => {
  // 登録済みのカスタム絵文字リストを取得する
  const remoteEmojiList = await fetchRemoteEmojiList(page, inputs);
  (inputs.debug || inputs.log) &&
    console.log("remoteEmojiList:", remoteEmojiList.length);
  (inputs.debug || inputs.log) && console.log(remoteEmojiList);

  // 対象デコモジリストを取得する
  const localDecomojiList = getLocalDecomojiList(inputs.categories);
  (inputs.debug || inputs.log) &&
    console.log("localDecomojiList:", localDecomojiList.length);
  (inputs.debug || inputs.log) && console.log(localDecomojiList);

  // remoteEmojiList と localDecomojiList を突合させて処理するアイテムだけのリストを作る
  const uploadableDecomojiList = localDecomojiList.filter((local) => {
    return (
      remoteEmojiList.findIndex((remote) => remote.name === local.name) === -1
    );
  });
  (inputs.debug || inputs.log) &&
    console.log("uploadableDecomojiList:", uploadableDecomojiList.length);
  (inputs.debug || inputs.log) && console.log(uploadableDecomojiList);

  return uploadableDecomojiList;
};

module.exports = getUploadableDecomojiList;
