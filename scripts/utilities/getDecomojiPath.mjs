// デコモジのデータから画像ファイルのパスを作る
// 画像ファイル名は v5 の頃から訓令式の文字列のままなので kunnrei を使う
// 例) { kunnrei: "annsinn", category: "basic" } -> "decomoji/basic/annsinn.png"
export const getDecomojiPath = ({ category, kunnrei }) => `decomoji/${category}/${kunnrei}.png`;
