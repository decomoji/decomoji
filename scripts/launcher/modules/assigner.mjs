import { pretender, remover, uploader } from "./index.mjs";

// 追加・削除・エイリアス登録をするエージェント
const agents = { pretender, remover, uploader };

// modeごとに実行するエージェントと順番
const serials = {
  uninstall: ["remover"],
  update: ["remover", "uploader"],
  migration: ["remover", "uploader"],
  compatible_migration: ["remover", "uploader", "pretender"],
};

export const assigner = async ({ inputs: initialInputs, history }) => {
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
  }

  // ログイン情報を入力し直しているかもしれないので inputs を引き回す
  let inputs = initialInputs;

  // mode ごとにエージェントを実行して input を取り直しつつ結果を格納する
  for (const name of serial) {
    const { inputs: newInputs, result } = await agents[name]({ inputs, history });
    inputs = newInputs;
    results[name] = result;
  }

  return { inputs, results };
};
