// バッファを配列にする
export const convertBufferToArray = (buffer) =>
  buffer
    .toString()
    .split("\n")
    .filter((v) => v !== "");
