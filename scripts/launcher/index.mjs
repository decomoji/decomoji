import { Command } from "commander";
import fs from "fs/promises";
import { isStringOfNotEmpty } from "../utilities/isStringOfNotEmpty.mjs";
import { dialog } from "./modules/dialog.mjs";
import { uploader } from "./modules/uploader.mjs";
import { pretender } from "./modules/pretender.mjs";
import { remover } from "./modules/remover.mjs";
import { getParsedJson } from "../utilities/getParsedJson.mjs";

const command = new Command();
const DEFAULT_INPUT_NAME = "inputs.json";

// コマンドライン引数の定義
command
  .option("-a, --additional [version]", "additional custom version name")
  .option("-d, --debug", "show browser mode")
  .option("-i, --inputs [type]", "input setting json file");

command.parse(process.argv);
const opts = command.opts();

// 自動実行の本体
const launcher = async ({
  workspace,
  email,
  password,
  mode,
  term,
  configs,
  includeExplicit,
  debug,
}) => {
  // 自動実行に必要な設定ファイルを作る
  const _inputs = {
    workspace,
    email,
    password,
    mode,
    term,
    configs,
    includeExplicit,
    debug,
  };

  console.info(`
workspace        : https://${workspace}.slack.com/
email            : ${email}
mode             : ${mode}
term             : ${term}
configs          : ${configs}
includeExplicit  : ${includeExplicit}

Connecting...
`);

  console.time("[Total time]");
  switch (_inputs.mode) {
    case "install":
      await uploader(_inputs);
      break;
    case "alias":
      await pretender(_inputs);
      break;
    case "uninstall":
      await remover(_inputs);
      break;
    case "migration":
      await remover({
        ..._inputs,
        ...{ mode: "uninstall", configs: ["v4_all"] },
      });
      await uploader({
        ..._inputs,
        ...{ mode: "install", configs: ["v5_basic", "v5_extra"] },
      });
      await pretender({
        ..._inputs,
        ...{ mode: "alias", configs: ["v4_rename", "v5_rename"] },
      });
      break;
    case "update":
      const uninstallConfigs =
        _inputs.term === "version" ? _inputs.configs : ["v5_fixed"];
      const aliasConfigs =
        _inputs.term === "version" ? _inputs.configs : ["v5_rename"];
      const _inputs1 = await remover({
        ..._inputs,
        ...{
          mode: "uninstall",
          configs: uninstallConfigs,
        },
      });
      const _inputs2 = await uploader({
        ..._inputs1,
        ...{ mode: "install" },
      });
      await pretender({
        ..._inputs2,
        ...{
          mode: "alias",
          configs: aliasConfigs,
        },
      });
      break;
    default:
      console.error("[ERROR]Unknown script mode. please confirm 'mode' value.");
      break;
  }
  console.timeEnd("[Total time]");
};

await fs.mkdir("logs", { recursive: true });

if (opts.inputs) {
  // --inputs inputs.hoge.json などのファイルパスが指定されていたらそれを import し、
  // --inputs オプションがキーのみの場合はデフォルトで `./inputs.json` を import する
  const FILE = isStringOfNotEmpty(opts.inputs)
    ? opts.inputs
    : DEFAULT_INPUT_NAME;
  launcher(await getParsedJson(`../launcher/${FILE}`));
} else {
  // --inputs オプション がない場合は inquirer を起動して対話的にオプションを作る
  dialog(
    (inputs) => launcher({ ...inputs, configs: inputs.configs.reverse() }),
    opts.additional,
  );
}
