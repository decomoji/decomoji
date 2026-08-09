import fs from "fs/promises";
import { assigner, dialoger } from "./modules/index.mjs";
import {
  getInputsFilePath,
  getParsedJson,
  getTargetCategories,
  outputHistoryJson,
} from "../utilities/index.mjs";

// 自動実行スクリプトのエントリーポイント
const launcher = async (inputs) => {
  console.time("[Total time]");
  console.info(`
workspace : https://${inputs.workspace}.slack.com/
email     : ${inputs.email}
mode      : ${inputs.mode}
term      : ${inputs.term}
debug     : ${inputs.debug}

Starting
`);

  // history 更新のためのタイムスタンプを保存する
  const timestamp = new Date().toISOString();

  // 既存の history を読み込む。なければ初期値を設定する
  const history = await getParsedJson("../../logs/history.json").catch(() => ({
    // logs/history.json がない場合、v6 の初回実行として扱う
    initial_run: true,
    timestamp: null,
    version: null,
    inputs: {
      workspace: null,
      email: null,
      mode: null,
      includeNsfw: null,
      debug: null
    },
    results: {
      pretender: {
        error: [],
        error_invalid_alias: [],
        error_name_taken: [],
        error_name_taken_i18n: [],
        ok: []
      },
      remover: {
        error: [],
        emoji_not_found: [],
        ok: []
      },
      uploader: {
        error: [],
        error_name_taken: [],
        error_name_taken_i18n: [],
        ok: []
      }
    }
  }));

  // assigner() で mode に応じたエージェントを実行し、結果を受け取る
  const { inputs: { workspace, email, mode, includeNsfw }, results } = await assigner({ inputs, history });

  // エラーなく最後まで各エージェントを実行できたら history.json を保存する
  await outputHistoryJson({
    timestamp,
    version: await getParsedJson("../../package.json").then(({ version }) => version),
    inputs: {
      // password を除外する
      workspace,
      email,
      mode,
      includeNsfw,
    },
    results,
  });

  console.timeEnd("[Total time]");
  console.info(`\nCompleted!`)
};

// logs ディレクトリを作成しておく
await fs.mkdir("logs", { recursive: true });
const inputsFilePath = await getInputsFilePath();

if (inputsFilePath) {
  await launcher(await getParsedJson(inputsFilePath));
} else {
  await dialoger(async (inputs) => await launcher(inputs));
}
