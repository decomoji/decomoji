import { curator, pretender, remover, uploader } from "./index.mjs";

export const assigner = async ({
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

  // 処理するデコモジリストを取得
  console.time("Curation time");
  const curatedDecomojis = curator();
  console.timeEnd("Curation time");

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
      console.error("[ERROR]Unknown launch mode. please confirm 'mode' value.");
      break;
  }
  console.timeEnd("[Total time]");
};
