// バッファを配列にする
const convertBufferToArray = (buffer) => {
  return buffer
    .toString()
    .split("\n")
    .filter((v) => v !== "");
};

module.exports = convertBufferToArray;
