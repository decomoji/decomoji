import { pretender, remover, uploader } from "./index.mjs";

/**
 * mode に合わせて uploader(), remover(), pretender() を呼び分ける
 * @param {{
 *   workspace: string;
 *   email: string;
 *   mode: "update" | "uninstall" | "migration" | "compatible_migration";
 *   term: "all";
 *   debug: boolean;
 * }} inputs
 */
export const assigner = async (inputs) => {
  console.info(`
Connecting...
`);

  console.time("[Total time]");
  switch (inputs.mode) {
    /**
     * デコモジを全て削除
     */
    case "uninstall":
      const { input, results } = await remover(inputs);
      break;
    /**
     * 初回インストールと通常更新
     * 修正・変更のあったデコモジを消して、新しいデコモジを追加する
     */
    case "update":
      const { input, results } = await remover(inputs);
      const { input, results } = await uploader(inputs);
      break;
    /**
     * v6 への移行
     * v4/v5 のデコモジを削除して、v6 のデコモジを追加する
     */
    case "migration":
      const { input, results } = await remover(inputs);
      const { input, results } = await uploader(inputs);
      break;
    /**
     * v6 への移行
     * v4/v5 のデコモジを削除して、v6 のデコモジを追加し、v5 -> v6 のエイリアスを登録する
     */
    case "compatible_migration":
      const { input, results } = await remover(inputs);
      const { input, results } = await uploader(inputs);
      const { input, results } = await pretender(inputs);
      break;
  }

  console.timeEnd("[Total time]");

  return result;
};
