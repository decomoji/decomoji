import {
  convertToUploadObject,
  getParsedJson,
  getParsedSemVerObject,
  getTargetCategories,
  isStringOfNotEmpty,
} from "../../utilities/index.mjs";

// semver 同士を比較して、semver が base より新しいなら true
// どちらかが空文字（updated が無いなど）の時は比較できないので false
const isNewerThan = (semver, base) => {
  if (!isStringOfNotEmpty(semver) || !isStringOfNotEmpty(base)) {
    return false;
  }
  const target = getParsedSemVerObject(String(semver).replace(/^v/, ""));
  const criterion = getParsedSemVerObject(String(base).replace(/^v/, ""));
  return target.major !== criterion.major
    ? target.major > criterion.major
    : target.minor !== criterion.minor
      ? target.minor > criterion.minor
      : target.patch > criterion.patch;
};

// database/v6.json から処理すべきデコモジリストを返す
// operation は呼び出し元が何をするかで、追加なら "add"、削除なら "remove" が渡ってくる
export const curator = async (inputs) => {
  const { mode, operation } = inputs;
  const database = await getParsedJson("../../database/v6.json");

  // 対象のカテゴリーに属するデコモジ
  const targetCategories = getTargetCategories(inputs, database.decomojis);
  const targets = database.decomojis.filter(({ category }) => targetCategories.includes(category));

  // 前回の実行結果。無ければどのカテゴリーも未インストールとみなす
  const { installed = {} } = await getParsedJson("../../logs/history.json").catch(() => ({}));

  const getCuratedDecomojis = () => {
    // アンインストールと移行は対象を絞らず、カテゴリーに属するものを全部処理する
    if (mode !== "update") {
      return targets;
    }

    // 追加（更新）は、前回インストールしたバージョンとの差分だけを処理する
    return targets.filter((decomoji) => {
      const installedVersion = installed[decomoji.category];

      // 未インストールのカテゴリーは、追加するだけでよく、消すものは無い
      if (!isStringOfNotEmpty(installedVersion)) {
        return operation === "add";
      }

      // インストール済みのカテゴリーは、前回より後に追加（created）されたか
      // 差し替え（updated）されたものだけを追加する
      // 消す対象は、既にワークスペースにある = 差し替えられたものだけでよい
      return operation === "add"
        ? isNewerThan(decomoji.created, installedVersion) ||
            isNewerThan(decomoji.updated, installedVersion)
        : isNewerThan(decomoji.updated, installedVersion);
    });
  };

  // Slack に登録する絵文字名と画像パスを持つオブジェクトに変換して返す
  return getCuratedDecomojis().map(convertToUploadObject);
};
