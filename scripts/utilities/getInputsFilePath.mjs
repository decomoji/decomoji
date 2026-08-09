import fs from "fs/promises";
import { dirname, isAbsolute, resolve } from "path";
import { fileURLToPath } from "url";
import { isStringOfNotEmpty } from "./isStringOfNotEmpty.mjs";

// このファイルは scripts/utilities/ に置かれているので、2つ上がリポジトリのルート
// 実行時のカレントディレクトリに関係なく決まる
const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

// 読み込めるファイルが存在するか否か
const isReadableFile = async (filepath) =>
  await fs
    .stat(filepath)
    .then((stats) => stats.isFile())
    .catch(() => false);

/**
 * コマンドライン引数で渡された設定ファイルを絶対パスに解決する
 * inputs.json はリポジトリのルートに置く想定だが、
 * どこに置いてもいいように下記の順で探す
 *
 * 1. 絶対パス（`/Users/you/decomoji/inputs.json`）
 * 2. 実行時のカレントディレクトリから見た相対パス
 * 3. リポジトリのルートから見た相対パス（どのディレクトリで実行しても同じ場所を指す）
 *
 * 引数が無ければ null を返す（＝対話式に進む）
 * 渡されたのに見つからない時は、黙って対話式に落とさずエラーにする
 * @param {string}
 * @returns {Promise<string | null>}
 */
export const getInputsFilePath = async (filepath = process.argv[2]) => {
  if (!isStringOfNotEmpty(filepath)) {
    return null;
  }

  const candidates = isAbsolute(filepath)
    ? [filepath]
    : [resolve(process.cwd(), filepath), resolve(ROOT_DIR, filepath)];

  for (const candidate of candidates) {
    if (await isReadableFile(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    `設定ファイルが見つかりません: ${filepath}\ninputs.json のパスを指定してください。例: node scripts/launcher/index.mjs path/to/inputs.json`,
  );
};
