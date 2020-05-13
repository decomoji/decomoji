const program = require("commander");

const isStringOfNotEmpty = require("./utilities/isStringOfNotEmpty");

const askInputs = require("./modules/askInputs");
const importer = require("./modules/importer");

// コマンドライン引数の定義
program
  .option("-d, --debug", "output extra debugging")
  .option("-f, --fatlog", "output more extra log")
  .option("-i, --inputs", "input setting json file")
  .parse(process.argv);

// 自動処理を実行する
const main = async (inputs) => {
  // コマンドオプションを inputs に混ぜる
  const _inputs = {
    ...inputs,
    ...program,
  };
  // ファイルをアップロードする
  await importer(_inputs);
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
