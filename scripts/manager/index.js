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
const main = async (_inputs) => {
  // コマンドオプションを inputs に混ぜる
  const inputs = {
    ..._inputs,
    ...program,
  };
  // ファイルをアップロードする
  await importer(inputs);
};

if (program.inputs) {
  // --inputs=./something.json などと値が指定されていたらそれを require し
  // --inputs キーのみの場合はデフォルトで `./inputs.json` を require する
  main(
    require(isStringOfNotEmpty(program.inputs)
      ? program.inputs
      : "./inputs.json")
  );
} else {
  // inputs がない場合は inquirer を起動して対話的にオプションを作る
  askInputs((inputs) => main(inputs));
}