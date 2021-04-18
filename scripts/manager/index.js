const commander = require("commander");
const program = new commander.Command();

const isStringOfNotEmpty = require("../utilities/isStringOfNotEmpty");

const askInputs = require("./modules/askInputs");
const uploader = require("./modules/uploader");
const pretender = require("./modules/pretender");
const remover = require("./modules/remover");

const DEFAULT_INPUT_NAME = "inputs.json";

// コマンドライン引数の定義
program
  .option("-i, --inputs [type]", "input setting json file")
  .option("-b, --browser", "open browser")
  .option("-l, --log", "output data log")
  .option("-t, --time", "output running time")
  .option(
    "-d, --debug",
    "full debugging mode (open browser, output data log, output running time)"
  );

program.parse(process.argv);
const options = program.opts()

// 自動処理を実行する
const main = async (inputs) => {
  // コマンドオプションと inquirer から必要なものだけ取り出す
  const _inputs = {
    workspace: inputs.workspace,
    email: inputs.email,
    password: inputs.password,
    mode: inputs.mode,
    updateMode: inputs.mode === "update",
    term: inputs.term,
    configs: inputs.configs,
    forceRemove: inputs.forceRemove,
    browser: options.browser || options.debug,
    log: options.log || options.debug,
    time: options.time || options.debug,
    debug: options.debug,
  };

  const TIME = _inputs.time;

  console.info(`
workspace  : https://${_inputs.workspace}.slack.com/
email      : ${_inputs.email}
mode       : ${_inputs.mode}`);
  _inputs.updateMode && console.info(`updateMode : ${_inputs.updateMode}`);
  _inputs.term && console.info(`term       : ${_inputs.term}`);
  _inputs.configs && console.info(`configs    : ${_inputs.configs}`);
  _inputs.forceRemove && console.info(`forceRemove: ${_inputs.forceRemove}`);
  console.info("\nConnecting...");

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
      console.log(`Remove "${removeConfigs}" starting...`);
      await remover({
        ..._inputs,
        ...{
          mode: "remove",
          configs: removeConfigs,
        },
      });
      console.log(`Upload "${_inputs.configs}" starting...`);
      await uploader({
        ..._inputs,
        ...{ mode: "upload" },
      });
      console.log(`Register "${_inputs.configs}" starting...`);
      await pretender({
        ..._inputs,
        ...{ mode: "alias", configs: ["v5_rename"] },
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
  const INPUT = require(`./${FILE}`);
  main(INPUT);
} else {
  // --inputs オプション がない場合は inquirer を起動して対話的にオプションを作る
  askInputs((inputs) => main(inputs));
}
