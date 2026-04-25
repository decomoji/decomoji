import { Command } from "commander";
import fs from "fs/promises";
import { assigner, dialoger } from "./modules/index.mjs";
import { getParsedJson, isStringOfNotEmpty } from "../utilities/index.mjs";

const command = new Command();

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
excludeExplicit  : ${excludeExplicit}

Connecting...
`);

  console.time("[Total time]");
  switch (mode) {
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
      const _inputs1 = await remover({
        ..._inputs,
        ...{
          mode: "uninstall",
          configs: term === "version" ? configs : ["v5_fixed"],
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
          configs: term === "version" ? configs : ["v5_rename"],
        },
      });
      break;
    default:
      console.error("[ERROR]Unknown script mode. please confirm 'mode' value.");
      break;
  }
  console.timeEnd("[Total time]");
};

// コマンドライン引数の定義
command
  .option("-i, --inputs <filename>", "inputs.jsonなどのファイル名を指定します")
  .option(
    "-d, --debug",
    "ブラウザを表示するデバッグモードで実行します。エラーが発生しても終了せず停止します。",
  )
  // TODO: 最新バージョンが何か、次のバージョンとそのデコモジは何かは自動判定できるようになるため、このオプションは廃止される見込み
  .option("-a, --adhoc <version>", "ad hocに選択可能にしたいバージョンを指定します。");

command.parse(process.argv);
const { adhoc, inputs } = command.opts();

// logs ディレクトリを作成しておく
await fs.mkdir("logs", { recursive: true });

if (inputs) {
  // --inputs inputs.hoge.json などのファイルパスが指定されていたらそれを import し、
  // --inputs オプションがキーのみの場合はデフォルトで `./inputs.json` を import する
  const INPUTS_FILE_NAME = await getParsedJson(
    `../launcher/${isStringOfNotEmpty(inputs) ? inputs : "inputs.json"}`,
  );
  assigner(INPUTS_FILE_NAME);
} else {
  // --inputs オプション がない場合は inquirer を起動して対話的にオプションを作る
  dialoger((inputs) => assigner({ ...inputs, configs: inputs.configs.reverse() }), adhoc);
}
