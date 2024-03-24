import { Command } from "commander";
import fs from "fs/promises";
import { isStringOfNotEmpty } from "../utilities/isStringOfNotEmpty.mjs";
import { askInputs } from "./modules/askInputs.mjs";
import { uploader } from "./modules/uploader.mjs";
import { pretender } from "./modules/pretender.mjs";
import { remover } from "./modules/remover.mjs";
import { getParsedJson } from "../utilities/getParsedJson.mjs";

const program = new Command();
const DEFAULT_INPUT_NAME = "inputs.json";

// コマンドライン引数の定義
program
  .option("-a, --additional [version]", "additional custom version name")
  .option("-b, --browser", "open browser")
  .option(
    "-d, --debug",
    "full debugging mode (open browser, output data log, output up time, If an error then stand by without exiting.)",
  )
  .option("-i, --inputs [type]", "input setting json file")
  .option("-l, --log", "output data log")
  .option("-t, --time", "output up time");

program.parse(process.argv);
const options = program.opts();

// 自動処理を実行する
const main = async (INPUTS) => {
  // コマンドオプションと inquirer から必要なものだけ取り出す
  const _inputs = {
    workspace: INPUTS.workspace,
    email: INPUTS.email,
    password: INPUTS.password,
    mode: INPUTS.mode,
    updateMode: INPUTS.mode === "update",
    term: INPUTS.term,
    configs: INPUTS.configs,
    first_letter_mode: INPUTS.first_letter_mode,
    selected_first_letters: INPUTS.selected_first_letters,
    forceRemove: INPUTS.forceRemove || false,
    excludeExplicit:
      typeof INPUTS.excludeExplicit === "undefined"
        ? true
        : INPUTS.excludeExplicit,
    browser: options.browser || options.debug,
    log: options.log || options.debug,
    time: options.time || options.debug,
    debug: options.debug,
  };

  const TIME = _inputs.time;

  // 頭文字ごとに登録する場合、 configs を上書きする
  if (
    _inputs.first_letter_mode &&
    !_inputs.selected_first_letters.includes("all")
  ) {
    _inputs.configs = _inputs.selected_first_letters.flatMap((cafl) =>
      _inputs.configs.map((config) => `${config}_${cafl}`),
    );
  }

  console.info(`
workspace        : https://${_inputs.workspace}.slack.com/
email            : ${_inputs.email}
mode             : ${_inputs.mode}
updateMode       : ${_inputs.updateMode}
term             : ${_inputs.term}
configs          : ${_inputs.configs}
excludeExplicit  : ${_inputs.excludeExplicit}

Connecting...
`);

  TIME && console.time("[Total time]");
  switch (_inputs.mode) {
    case "upload":
      await uploader(_inputs);
      break;
    case "alias":
      await pretender(_inputs);
      break;
    case "remove":
      await remover(_inputs);
      break;
    case "migration":
      console.log("Remove 'v4_all' starting...");
      await remover({
        ..._inputs,
        ...{ mode: "remove", configs: ["v4_all"] },
      });
      console.log("Upload 'v5_basic, v5_extra' starting...");
      await uploader({
        ..._inputs,
        ...{ mode: "upload", configs: ["v5_basic", "v5_extra"] },
      });
      console.log("Register 'v4_rename, v5_rename' starting...");
      await pretender({
        ..._inputs,
        ...{ mode: "alias", configs: ["v4_rename", "v5_rename"] },
      });
      console.log("All migration step has completed!");
      break;
    case "update":
      const removeConfigs =
        _inputs.term === "version" ? _inputs.configs : ["v5_fixed"];
      const aliasConfigs =
        _inputs.term === "version" ? _inputs.configs : ["v5_rename"];
      console.log(`Remove "${removeConfigs}" starting...`);
      const _inputs1 = await remover({
        ..._inputs,
        ...{
          mode: "remove",
          configs: removeConfigs,
        },
      });
      console.log(`Upload "${_inputs.configs}" starting...`);
      const _inputs2 = await uploader({
        ..._inputs1,
        ...{ mode: "upload" },
      });
      console.log(`Register "${aliasConfigs}" starting...`);
      await pretender({
        ..._inputs2,
        ...{
          mode: "alias",
          configs: aliasConfigs,
        },
      });
      console.log("All update step has completed!");
      break;
    default:
      console.error("[ERROR]Unknown script mode. please confirm 'mode' value.");
      break;
  }
  TIME && console.timeEnd("[Total time]");
};

if (options.log) {
  await fs.mkdir("logs", { recursive: true });
}

if (options.inputs) {
  // --inputs inputs.hoge.json などのファイルパスが指定されていたらそれを import し、
  // --inputs オプションがキーのみの場合はデフォルトで `./inputs.json` を import する
  const FILE = isStringOfNotEmpty(options.inputs)
    ? options.inputs
    : DEFAULT_INPUT_NAME;
  main(await getParsedJson(`../manager/${FILE}`));
} else {
  // --inputs オプション がない場合は inquirer を起動して対話的にオプションを作る
  askInputs(
    (inputs) => main({ ...inputs, configs: inputs.configs.reverse() }),
    options.additional,
  );
}
