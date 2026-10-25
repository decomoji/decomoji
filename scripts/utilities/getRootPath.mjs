import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

// このファイルは scripts/utilities/ に置かれているので、2つ上がリポジトリのルート
// 実行時のカレントディレクトリに関係なく決まる
const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// リポジトリのルートを起点にした絶対パスを返す
// JSON の読み書きはこれを通すので、どのディレクトリから実行しても同じ場所を指す
// 絶対パスを渡した時はそのまま返る
export const getRootPath = (...segments) => resolve(ROOT_DIR, ...segments);
