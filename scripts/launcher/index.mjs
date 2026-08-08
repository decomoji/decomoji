import { Command } from "commander";
import fs from "fs/promises";
import { assigner, dialoger } from "./modules/index.mjs";
import {
  getParsedJson,
  getTargetCategories,
  isStringOfNotEmpty,
  outputHistoryJson,
} from "../utilities/index.mjs";

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
  );

command.parse(process.argv);

const { debug, file } = command.opts();

const filename = file ? (isStringOfNotEmpty(file) ? file : "inputs.json") : null;

/**
 * 自動スクリプトのエントリーポイント
 * @param {{
 *   workspace: string;
 *   email: string;
 *   mode: "install" | "uninstall" | "migration";
 *   term: "all" | "category";
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

  const result = await assigner(inputs);

  // 実行結果を logs/ に残す
  const database = await getParsedJson("../../database/v6.json");
  const { installed: previous = {} } = await getParsedJson("../../logs/history.json").catch(
    () => ({}),
  );
  const categories = getTargetCategories(inputs, database.decomojis);

  // 次回の差分計算に使うため、カテゴリーごとに「どのバージョンを入れたか」を残す
  // アンインストールしたカテゴリーは記録から外して未インストールに戻す
  const installed =
    inputs.mode === "uninstall"
      ? Object.fromEntries(
          Object.entries(previous).filter(([category]) => !categories.includes(category)),
        )
      : {
          ...previous,
          ...Object.fromEntries(categories.map((category) => [category, database.version])),
        };

  await outputHistoryJson({
    timestamp,
    version: database.version,
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
