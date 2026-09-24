import { pretender, remover, uploader } from "../agents/index.mjs";

// 追加・削除・エイリアス登録をするエージェント
const agents = { uploader, remover, pretender };

// modeごとに実行するエージェントと順番
const serials = {
  uninstall: ["remover"],
  // 更新でも pretender を回す
  // 互換のある移行をしたワークスペースでは、差し替えで道連れに消えたエイリアスの貼り直しが要る
  update: ["remover", "uploader", "pretender"],
  migration: ["remover", "uploader"],
  compatible_migration: ["remover", "uploader", "pretender"],
};

export const assigner = async ({ inputs: initialInputs, history, compatible, nsfwAdded }) => {
  const serial = serials[initialInputs.mode];

  // 存在しない mode の場合はエラーを返して終了する
  if (!serial) {
    throw new Error(
      `[ERROR]Unknown mode: ${initialInputs.mode}. Expected one of ${Object.keys(serials).join(" | ")}.`,
    );
  }

  // 最後に launcher() に返す結果の箱
  const results = {
    pretender: {},
    remover: {},
    uploader: {},
  };

  // ログイン情報を入力し直しているかもしれないので inputs を引き回す
  let inputs = initialInputs;
  let failed = false;

  // mode ごとにエージェントを実行して input を取り直しつつ結果を格納する
  for (const name of serial) {
    const {
      inputs: newInputs,
      result,
      failed: agentFailed,
    } = await agents[name]({ inputs, history, compatible, nsfwAdded });
    inputs = newInputs;
    results[name] = result;

    // 途中で失敗したら後続のエージェントは回さない
    // 消し終えていないまま追加すると名前が衝突するなど、ワークスペースの状態が読めなくなるため
    if (agentFailed) {
      failed = true;
      break;
    }
  }

  return { inputs, results, failed };
};
