const program = require("commander");

const isStringOfNotEmpty = require("../utilities/isStringOfNotEmpty");

const askInputs = require("./modules/askInputs");
const uploader = require("./modules/uploader");
const pretender = require("./modules/pretender");
const remover = require("./modules/remover");

const DEFAULT_INPUT_PATH = "./inputs.json";

// コマンドライン引数の定義
program
  .option("-i, --inputs [value]", "input setting json file")
  .option("-b, --browser", "open browser")
  .option("-l, --log", "output data log")
  .option("-t, --time", "output running time")
  .option(
    "-d, --debug",
    "full debugging mode (open browser, output data log, output running time)"
  )
  .parse(process.argv);

// 自動処理を実行する
const main = async (inputs) => {
  // コマンドオプションと inquirer から必要なものだけ取り出す
  const _inputs = {
    workspace: inputs.workspace,
    email: inputs.email,
    password: inputs.password,
    categories: inputs.categories,
    mode: inputs.mode,
    alias: inputs.alias,
    forceRemove: inputs.forceRemove,
    browser: program.browser,
    debug: program.debug,
    log: program.log,
    time: program.time,
  };

  const TIME = _inputs.debug || _inputs.time;

  console.info(`
workspace  : https://${_inputs.workspace}.slack.com/
email      : ${_inputs.email}
mode       : ${_inputs.mode}`);
  _inputs.mode === "alias" && console.info(`alias      : ${_inputs.alias}`);
  _inputs.mode !== "alias" &&
    _inputs.categories &&
    console.info(`categories : ${_inputs.categories}`);
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
    case "migration-v4-to-v5":
      console.log("Remove 'v4_all' starting...");
      await remover({
        ..._inputs,
        ...{ mode: "remove", categories: ["v4_all"], forceRemove: true },
      });
      console.log("Upload 'v5_basic, v5_extra' starting...");
      await uploader({
        ..._inputs,
        ...{ mode: "upload", categories: ["v5_basic", "v5_extra"] },
      });
      console.log("Register 'v4_fixed-to-v5' starting...");
      await pretender({
        ..._inputs,
        ...{ mode: "alias", alias: ["v4_fixed-to-v5"] },
      });
      console.log("All migration step has completed!");
      break;
    default:
      console.error(
        "[ERROR] Unknown script mode. please confirm 'mode' value."
      );
      break;
  }
  TIME && console.timeEnd("[Total time]");
};

if (program.inputs) {
  // --inputs ./inputs.hoge.json などのファイルパスが指定されていたらそれを require し、
  // --inputs オプションがキーのみの場合はデフォルトで `./inputs.json` を require する
  main(
    require(isStringOfNotEmpty(program.inputs)
      ? program.inputs
      : DEFAULT_INPUT_PATH)
  );
} else {
  // --inputs オプション がない場合は inquirer を起動して対話的にオプションを作る
  askInputs((inputs) => main(inputs));
}
