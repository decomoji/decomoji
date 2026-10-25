import { getParsedJson } from "./getParsedJson.mjs";
import { isNewerThan } from "./isNewerThan.mjs";
import { isStringOfNotEmpty } from "./isStringOfNotEmpty.mjs";

const V6_DATABASE = "database/v6.json";

// 配布しているデコモジセットの現在のバージョンを database から取る
//
// history に残す「どこまで入れたか」の基準になるので、
// デコモジ1件ごとの created/updated/deleted と同じ系列でなければならない
// package.json の version は npm パッケージ側の都合で動くため基準にしない
export const getDatabaseVersion = async () => {
  const { version, decomojis } = await getParsedJson(V6_DATABASE);

  if (!isStringOfNotEmpty(version)) {
    throw new Error(`[ERROR]${V6_DATABASE} に version がありません。`);
  }

  // version より新しいデコモジが残っていると、そのぶんが毎回の更新で差分として出続ける
  // リリース時の version の上げ忘れに、ワークスペースを触る前に気づけるようにする
  const ahead = decomojis.flatMap(({ id, created, updated, deleted }) =>
    [created, updated, deleted]
      .filter((semver) => isNewerThan(semver, version))
      .map((semver) => `  ${id}: ${semver}`),
  );

  if (ahead.length > 0) {
    throw new Error(
      [
        `[ERROR]${V6_DATABASE} の version (${version}) より新しいデコモジがあります。`,
        `version を最新のリリースに揃えてください。`,
        ...ahead.slice(0, 5),
        ...(ahead.length > 5 ? [`  ...ほか ${ahead.length - 5} 件`] : []),
      ].join("\n"),
    );
  }

  return version;
};
