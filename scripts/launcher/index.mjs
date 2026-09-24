import fs from "fs/promises";
import { assigner, dialoger } from "./handlers/index.mjs";
import {
  getDatabaseVersion,
  getInputsFilePath,
  getParsedJson,
  getRootPath,
  getValidatedInputs,
  isCompatibleWorkspace,
  outputHistoryJson,
} from "../utilities/index.mjs";

// 自動実行スクリプトのエントリーポイント
const launcher = async (inputs) => {
  console.time("[Total time]");
  console.info(`
workspace : https://${inputs.workspace}.slack.com/
email     : ${inputs.email}
mode      : ${inputs.mode}
nsfw      : ${inputs.includeNsfw}
debug     : ${inputs.debug}

Starting
`);

  // history 更新のためのタイムスタンプを保存する
  const timestamp = new Date().toISOString();

  // 既存の history を読み込む。なければ初期値を設定する
  const history = await getParsedJson("logs/history.json").catch(() => ({
    // logs/history.json がない場合、v6 の初回実行として扱う
    initial_run: true,
    timestamp: null,
    version: null,
    compatible: false,
    inputs: {
      workspace: null,
      email: null,
      mode: null,
      includeNsfw: null,
      debug: null,
    },
    results: {
      pretender: {
        error: [],
        error_invalid_alias: [],
        error_name_taken: [],
        error_name_taken_i18n: [],
        ok: [],
      },
      remover: {
        error: [],
        emoji_not_found: [],
        ok: [],
      },
      uploader: {
        error: [],
        error_name_taken: [],
        error_name_taken_i18n: [],
        ok: [],
      },
    },
  }));

  // 配布しているデコモジセットのバージョン
  // database の整合が崩れていたらここで落ちるので、ワークスペースを触る前に気づける
  const databaseVersion = await getDatabaseVersion();

  // v5 -> v6 のエイリアスを貼って運用するワークスペースか否かを決める
  // 更新で貼り直すために、今回の実行に適用しつつ history にも残す
  const compatible = isCompatibleWorkspace({
    mode: inputs.mode,
    compatible: history.compatible,
  });

  // NSFW を扱っていなかったワークスペースが、今回から扱うようになったか
  // 除いている間も version だけは進んでいるので、あとから有効にしても差分では拾えない
  // その時だけ NSFW なカテゴリーを差分の絞り込みから外して、まるごと入れ直す
  const nsfwAdded = inputs.includeNsfw === true && history.inputs?.includeNsfw !== true;

  // assigner() で mode に応じたエージェントを実行し、結果を受け取る
  const {
    inputs: { workspace, email, mode, includeNsfw },
    results,
    failed,
  } = await assigner({ inputs, history, compatible, nsfwAdded });

  // 失敗しても history.json は保存する
  // どこまで処理できたかを残しておかないと、次に何をすればいいか分からなくなるため
  await outputHistoryJson({
    timestamp,
    // 最後まで通らなかった時は version を進めない
    // 進めてしまうと入れ損ねたぶんが差分から漏れて、次の更新で拾えなくなる
    // 全削除しきった時は null に戻り、次の更新で全件が入り直す
    version: failed ? history.version : mode === "uninstall" ? null : databaseVersion,
    compatible,
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

  // 失敗を呼び出し元のシェルに伝える
  // process.exit() だと出力を流しきる前に落ちるので exitCode だけ立てる
  if (failed) {
    process.exitCode = 1;
    console.error(`\nFailed. logs/history.json に途中までの結果を残しました。`);
    return;
  }

  console.info(`\nCompleted!`);
};

// ここで受けるのは、エージェントを回す前に分かる類のエラー
// オプションの間違い、設定ファイルの不備、database の不整合など
// 実行中の失敗は assigner() が受け止めて history に残すので、ここには来ない
try {
  // logs ディレクトリを作成しておく
  await fs.mkdir(getRootPath("logs"), { recursive: true });

  // NSFW なカテゴリーを含めて実行するオプション
  const NSFW_OPTION = "--include-nsfw";

  // Commander を剥がしているのでコマンドライン引数は自前で見る
  // オプションと設定ファイルのパスが混ざって渡ってくるので分ける
  const args = process.argv.slice(2);
  const options = args.filter((arg) => arg.startsWith("-"));

  // 打ち間違いを黙って無視すると NSFW が入らない理由に気づけないので、不明なオプションは弾く
  const unknownOptions = options.filter((option) => option !== NSFW_OPTION);
  if (unknownOptions.length > 0) {
    throw new Error(
      `[ERROR]不明なオプションです: ${unknownOptions.join(" ")}\n使えるのは ${NSFW_OPTION} だけです。`,
    );
  }

  // オプションを付けた時だけ true にする
  // 付けなければ inputs.json の includeNsfw をそのまま使うので、無効化の手段にはならない
  const includeNsfw = options.includes(NSFW_OPTION);

  // 真偽値で扱う値は、省略されていても undefined のままにしない
  // 起動時の表示が undefined になるうえ、puppeteer や history にもそのまま届いてしまう
  const withOptions = (inputs) => ({
    ...inputs,
    includeNsfw: includeNsfw || inputs.includeNsfw === true,
    debug: inputs.debug === true,
  });

  // オプションを除いた最初の引数を設定ファイルのパスとして扱う
  const inputsFilePath = await getInputsFilePath(args.find((arg) => !arg.startsWith("-")) ?? null);

  if (inputsFilePath) {
    // 対話式は inquirer が入力を弾いてくれるが、設定ファイルは素通しなので確かめてから渡す
    const inputs = getValidatedInputs(await getParsedJson(inputsFilePath), inputsFilePath);
    await launcher(withOptions(inputs));
  } else {
    await dialoger(async (inputs) => await launcher(withOptions(inputs)));
  }
} catch (error) {
  // Ctrl+C でプロンプトを閉じたのは異常ではないので、静かに終わる
  if (error?.name !== "ExitPromptError") {
    // [ERROR] で始まるものは利用者に向けて書いた文言なので、それだけを見せる
    // それ以外は想定外なので、追えるようにそのまま出す
    console.error(String(error?.message).startsWith("[ERROR]") ? error.message : error);
    process.exitCode = 1;
  }
}
