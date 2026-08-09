import { Command } from "commander";
import fs from "fs/promises";
import { assigner, dialoger } from "./modules/index.mjs";
import {
  getParsedJson,
  getTargetCategories,
  isStringOfNotEmpty,
  outputHistoryJson,
} from "../utilities/index.mjs";

// logs ディレクトリを作成しておく
await fs.mkdir("logs", { recursive: true });

// コマンドライン引数を定義する
const command = new Command();
command
  .option(
    "-f, --file <filename>",
    "inputs.jsonなどのファイル名を指定します。jsonは `scripts/launcher/` 配下に置いてください。",
  );

command.parse(process.argv);

const { file } = command.opts();

const filename = file ? (isStringOfNotEmpty(file) ? file : "inputs.json") : null;

/**
 * 自動スクリプトのエントリーポイント
 * @param {{
 *   workspace: string;
 *   email: string;
 *   mode: "update" | "uninstall" | "migration";
 *   term: "all"; @TODO: categoryは廃止し、tagに移行する
 *   debug: boolean;
 * }} inputs
 */
const launcher = async (inputs) => {
  console.info(`
workspace  : https://${inputs.workspace}.slack.com/
email      : ${inputs.email}
mode       : ${inputs.mode}
term       : ${inputs.term}
debug      : ${inputs.debug}
`);

  // history ファイルのためのタイムスタンプを保存する
  const timestamp = new Date().toISOString();

  // assigner() から適宜 agents を呼び出し、実行結果を受け取る
  // TODO: result の形は要検討
  const result = await assigner(inputs);

  await outputHistoryJson({
    timestamp,
    version: await getParsedJson("../../package.json").then(({ version }) => version),
    mode: inputs.mode,
    term: inputs.term,
    installed,
    result,
    // duration, TODO:
  });
};

if (filename) {
  await launcher(await getParsedJson(`../launcher/${filename}`));
} else {
  await dialoger(async (inputs) => await launcher(inputs));
}
