import { curator, pretender, remover, uploader } from "./index.mjs";

/**
 * inputs = {
 *   workspace,
 *   email,
 *   password,
 *   mode,
 *   term,
 *   configs,
 *   includeExplicit,
 *   debug,
 * }
 */
// mode に合わせて uploader(), remover(), pretender() を呼び分ける
export const assigner = async (inputs) => {
  console.info(`
Connecting...
`);

  console.time("[Total time]");
  switch (mode) {
    case "install":
      await uploader({ ...inputs, decomojis });
      break;
    case "alias":
      await pretender({ ...inputs, decomojis });
      break;
    case "uninstall":
      await remover({ ...inputs, decomojis });
      break;
    case "migration":
      // TODO: v4,v5をアンインストールして、v6をインストールし、v5_latest のエイリアスを v6 に貼る
      break;
    case "update":
      // 対象のデコモジを一旦アンインストールしてから入れ直す
      const inputs1 = await remover({
        ...inputs,
        ...{ mode: "uninstall" },
      });
      const inputs2 = await uploader({
        ...inputs1,
        ...{ mode: "install" },
      });
      await pretender({
        ...inputs2,
        ...{ mode: "alias" },
      });
      break;
    default:
      console.error("[ERROR]Unknown launch mode. please confirm 'mode' value.");
      break;
  }
  console.timeEnd("[Total time]");
};
