import { Command } from "commander";
import fs from "fs/promises";
import { assigner, dialoger } from "./modules/index.mjs";
import { getParsedJson, isStringOfNotEmpty } from "../utilities/index.mjs";

const command = new Command();
const DEFAULT_INPUTS = "inputs.json";

// コマンドライン引数の定義
command
  // TODO: 最新バージョンが何か、次のバージョンとそのデコモジは何かは自動判定できるようになるため、このオプションは廃止される見込み
  .option("-a, --additional [version]", "additional custom version name")
  .option("-d, --debug", "デバックモードで実行する")
  .option("-i, --inputs [<filename>]", "inputs.jsonを使って実行する");

command.parse(process.argv);
const { additional, inputs } = command.opts();

// logs ディレクトリを作成しておく
await fs.mkdir("logs", { recursive: true });

if (inputs) {
  // --inputs inputs.hoge.json などのファイルパスが指定されていたらそれを import し、
  // --inputs オプションがキーのみの場合はデフォルトで `./inputs.json` を import する
  const INPUTS = await getParsedJson(
    `../launcher/${isStringOfNotEmpty(inputs) ? inputs : DEFAULT_INPUTS}`,
  );
  assigner(INPUTS);
} else {
  // --inputs オプション がない場合は inquirer を起動して対話的にオプションを作る
  dialoger(
    (inputs) => assigner({ ...inputs, configs: inputs.configs.reverse() }),
    additional,
  );
}
