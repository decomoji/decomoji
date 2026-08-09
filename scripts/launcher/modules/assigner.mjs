import { remover, uploader } from "./index.mjs";

/**
 * mode に合わせて uploader(), remover(), pretender() を呼び分ける
 * @param {{
 *   workspace: string;
 *   email: string;
 *   mode: "update" | "uninstall" | "migration";
 *   term: "all";
 *   debug: boolean;
 * }} inputs
 */
export const assigner = async (inputs) => {
  console.info(`
Connecting...
`);

  console.time("[Total time]");

  const result = {};

  switch (inputs.mode) {
    case "update": {
      // 差し替えられたデコモジは一旦アンインストールしてから入れ直す
      const removed = await remover({ ...inputs, operation: "remove" });
      result.remover = removed.result;
      // 入力し直したかもしれないので removed を引き継ぐ
      const added = await uploader({ ...removed, operation: "add" });
      result.uploader = added.result;
      break;
    }
    case "uninstall": {
      const removed = await remover({ ...inputs, operation: "remove" });
      result.remover = removed.result;
      break;
    }
    case "migration":
      // TODO: v4,v5をアンインストールして、v6をインストールし、v5_latest のエイリアスを v6 に貼る
      console.error("[ERROR]Migration mode is not implemented yet.");
      break;
    default:
      console.error("[ERROR]Unknown launch mode. please confirm 'mode' value.");
      break;
  }

  console.timeEnd("[Total time]");

  return result;
};
