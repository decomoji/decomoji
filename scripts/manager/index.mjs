import { Command } from "commander";
import { isStringOfNotEmpty } from "../utilities/isStringOfNotEmpty.mjs";
import { askInputs } from "./modules/askInputs.mjs";
import { uploader } from "./modules/uploader.mjs";
import { pretender } from "./modules/pretender.mjs";
import { remover } from "./modules/remover.mjs";

const program = new Command();
const DEFAULT_INPUT_NAME = "inputs.json";

// コマンドライン引数の定義
program
  .option("-a, --additional [version]", "additional custom version name")
  .option("-b, --browser", "open browser")
  .option(
    "-d, --debug",
    "full debugging mode (open browser, output data log, output running time)"
  )
  .option("-i, --inputs [type]", "input setting json file")
  .option("-l, --log", "output data log")
  .option("-t, --time", "output running time");

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

  console.info(`
workspace      : https://${_inputs.workspace}.slack.com/
email          : ${_inputs.email}
mode           : ${_inputs.mode}
updateMode     : ${_inputs.updateMode}
term           : ${_inputs.term}
configs        : ${_inputs.configs}
forceRemove    : ${_inputs.forceRemove}`);
  (_inputs.mode === "update" || _inputs.mode === "upload") &&
    _inputs.term === "version" &&
    console.info(`excludeExplicit: ${_inputs.excludeExplicit}`);
  console.info(`\nConnecting...\n`);

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

if (options.inputs) {
  // --inputs inputs.hoge.json などのファイルパスが指定されていたらそれを require し、
  // --inputs オプションがキーのみの場合はデフォルトで `./inputs.json` を require する
  const FILE = isStringOfNotEmpty(options.inputs)
    ? options.inputs
    : DEFAULT_INPUT_NAME;
  const INPUTS = require(`./${FILE}`);
  main(INPUTS);
} else {
  // --inputs オプション がない場合は inquirer を起動して対話的にオプションを作る
  askInputs((inputs) => main(inputs), options.additional);
}
