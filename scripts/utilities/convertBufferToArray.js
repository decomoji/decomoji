// バッファを配列にする
export const convertBufferToArray = (buffer) => {
  return buffer
    .toString()
    .split("\n")
    .filter((v) => v !== "");
};
