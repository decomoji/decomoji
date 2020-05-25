const fetchRemoteEmojiList = require("./fetchRemoteEmojiList");
const getLocalJson = require("./getLocalJson");

const getUploadableDecomojiList = async (page, inputs) => {
  const LOG = inputs.debug || inputs.log;
  // 登録済みのカスタム絵文字リストを取得する
  const remoteEmojiList = await fetchRemoteEmojiList(page, inputs);

  // 対象デコモジリストを取得する
  const localDecomojiList = getLocalJson(inputs.categories, inputs.mode, LOG);

  // remoteEmojiList と localDecomojiList を突合させて処理するアイテムだけのリストを作る
  const uploadableDecomojiList = localDecomojiList.filter((local) => {
    return (
      remoteEmojiList.findIndex((remote) => remote.name === local.name) === -1
    );
  });
  LOG &&
    console.log(
      "uploadableDecomojiList:",
      uploadableDecomojiList,
      uploadableDecomojiList.length
    );
  return uploadableDecomojiList;
};

module.exports = getUploadableDecomojiList;
