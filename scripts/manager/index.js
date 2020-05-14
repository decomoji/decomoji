const program = require("commander");

const isStringOfNotEmpty = require("./utilities/isStringOfNotEmpty");

const askInputs = require("./modules/askInputs");
const uploader = require("./modules/uploader");
const remover = require("./modules/remover");

// コマンドライン引数の定義
program
  .option("-d, --debug", "output extra debugging")
  .option("-f, --fatlog", "output more extra log")
  .option("-i, --inputs", "input setting json file")
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
    forceRemove: inputs.forceRemove,
    debug: program.debug,
    fatlog: program.fatlog,
  };

  console.log(`
workspace  : https://${_inputs.workspace}.slack.com/
email      : ${_inputs.email}
mode       : ${_inputs.mode}
categories : ${_inputs.categories}

Connecting...`);

  switch (_inputs.mode) {
    case "Upload":
      await uploader(_inputs);
      break;
    case "Remove":
      await remover(_inputs);
      break;
    default:
      console.log(
        "\n[ERROR] Undefined script mode. please confirm 'mode' value."
      );
  }
};

if (program.inputs) {
  // --inputs=./something.json などのファイルパスが指定されていたらそれを require し、
  // --inputs オプションがキーのみの場合はデフォルトで `src/scripts/manager/inputs.json` を require する
  main(
    require(isStringOfNotEmpty(program.inputs)
      ? program.inputs
      : "./inputs.json")
  );
} else {
  // --inputs オプション がない場合は inquirer を起動して対話的にオプションを作る
  askInputs((inputs) => main(inputs));
}
