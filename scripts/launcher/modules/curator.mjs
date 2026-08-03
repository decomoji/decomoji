import {
  convertToUploadObject,
  getParsedJson,
  getParsedSemVerObject,
  isStringOfNotEmpty,
} from "../../utilities/index.mjs";

// configs の値からカテゴリー名を取り出す（basic も v5_basic も basic になる）
const getCategoryName = (config) => String(config).replace(/^v\d+_/, "");

// configs の値からバージョンを取り出す（6.0.0 も v6.0.0 も 6.0.0 になる）
const getVersionNumber = (config) => String(config).replace(/^v/, "");

// database/v6.json から処理すべきデコモジリストを返す
export const curator = async ({ configs, mode, term }) => {
  const database = await getParsedJson("../../database/v6.json");

  // カテゴリーが configs のどれかに当てはまるなら true
  const isMatchedCategory = (categories) => (decomoji) => categories.includes(decomoji.category);

  // 追加されたか更新されたバージョンが configs のどれかに当てはまるなら true
  const isMatchedVersion = (versions) => (decomoji) =>
    versions.includes(decomoji.created) || versions.includes(decomoji.updated);

  // history の version よりデコモジの created か updated が新しいなら true
  const isNewerThanHistory = (historyVersion) => (decomoji) => {
    const current = getParsedSemVerObject(
      isStringOfNotEmpty(decomoji.updated) ? decomoji.updated : decomoji.created,
    );
    const history = getParsedSemVerObject(historyVersion);
    return (
      // current.major が大きいなら true
      current.major > history.major ||
      // major が同じなら minor を見る
      (current.major === history.major && current.minor > history.minor) ||
      // major と minor が同じなら patch を見る
      (current.major === history.major &&
        current.minor === history.minor &&
        current.patch > history.patch)
    );
  };

  const getCuratedDecomojis = async () => {
    // 更新は、前回の実行時にローカルへ残した history.json との差分を対象にする
    if (mode === "update") {
      // history.json がなければ未インストールとみなして全部を対象にする
      const history = await getParsedJson("../../logs/history.json").catch(() => ({
        version: "0.0.0",
      }));
      return (
        database.decomojis
          // TODO: この map の処理はテスト用なので必要になったらコメントを外す
          // .map((item, i) =>
          //   i % 5 === 0
          //     ? { ...item, updated: "5.23.0" }
          //     : i % 7 === 0
          //       ? { ...item, updated: "6.0.0" }
          //       : i % 13 === 0
          //         ? { ...item, created: "6.0.0" }
          //         : item,
          // )
          .filter(isNewerThanHistory(history.version))
      );
    }

    switch (term) {
      case "category":
        return database.decomojis.filter(isMatchedCategory(configs.map(getCategoryName)));
      case "version":
        return database.decomojis.filter(isMatchedVersion(configs.map(getVersionNumber)));
      // 対象タイプを選ばないモード（migration など）では全部を対象にする
      default:
        return database.decomojis;
    }
  };

  // Slack に登録する絵文字名と画像パスを持つオブジェクトに変換して返す
  return (await getCuratedDecomojis()).map(convertToUploadObject);
};
