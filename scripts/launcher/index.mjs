import { Command } from "commander";
import fs from "fs/promises";
import { assigner, dialoger } from "./modules/index.mjs";
import { getParsedJson, isStringOfNotEmpty, outputHistoryJson } from "../utilities/index.mjs";

// 実行日時。history ファイルはこの index.mjs を呼び出した単位で残す
const timestamp = new Date().toISOString();

// logs ディレクトリを作成しておく
await fs.mkdir("logs", { recursive: true });

// コマンドライン引数を定義する
const command = new Command();
command
  .option(
    "-f, --file <filename>",
    "inputs.jsonなどのファイル名を指定します。jsonは `scripts/launcher/` 配下に置いてください。",
  )
  .option(
    "-d, --debug",
    "ブラウザを表示するデバッグモードで実行します。エラーが発生しても終了せず停止します。",
  )
  .option(
    "-p, --preflight <version>",
    "リリース前のプリフライト用。リリース予定のバージョンを指定します。",
  );

command.parse(process.argv);

const { preflight, debug, file } = command.opts();

const filename = file ? (isStringOfNotEmpty(file) ? file : "inputs.json") : null;

/**
 * 自動スクリプトのエントリーポイント
 * @param {{
 *   workspace: string;
 *   email: string;
 *   mode: string;
 *   term: string;
 *   configs: any[];
 *   includeExplicit: boolean;
 * }} inputs
 */
const launcher = async (inputs) => {
  console.info(`
workspace        : https://${inputs.workspace}.slack.com/
email            : ${inputs.email}
mode             : ${inputs.mode}
term             : ${inputs.term}
configs          : ${inputs.configs}
includeExplicit  : ${inputs.includeExplicit}
`);

  const result = await assigner(inputs);

  // 実行結果を logs/ に残す
  const { version } = await getParsedJson("../../database/v6.json");
  await outputHistoryJson({
    timestamp,
    version,
    ...inputs,
    result,
    // duration, TODO:
  });
};

if (filename) {
  await launcher(await getParsedJson(filename));
} else {
  await dialoger(
    async (inputs) => await launcher({ ...inputs, configs: inputs.configs.reverse() }),
    preflight,
  );
}
