// uploader/remover/pretender が処理すべきデコモジのリストを返す
//
// 引数はそれぞれ役割が違うので、下記の順に絞り込んでいく
//
// 1. mode + invoker  どの母集団を見るか      -> SOURCES
// 2. includeNsfw     どのカテゴリーを扱うか  -> isTarget()
// 3. version         前回からの差分に絞るか  -> isTarget()（mode=update の時だけ）
// 4. invoker         どんな形で返すか        -> FORMATTERS

import {
  convertToUploadObject,
  getDecomojiCategory,
  getDecomojiName,
  getParsedJson,
  getParsedSemVerObject,
  isStringOfNotEmpty,
} from "../../utilities/index.mjs";

const V6_DATABASE = "../../database/v6.json";
const V5_HISTORY = "../../database/v5.json";
const V4_ALL = "../../configs/v4_all.json";

// NSFW なカテゴリー。includeNsfw が false の時は追加も削除もしない
const NSFW_CATEGORIES = ["explicit"];

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

// 名前が重複するデコモジを間引く
// v6 の名前がラテン文字だけになる時、v4/v5 の名前と衝突することがある
const uniqueByName = (decomojis) => [
  ...new Map(decomojis.map((decomoji) => [decomoji.name, decomoji])).values(),
];

// 絞り込みに使うバージョンのプロパティだけを取り出す
const pickVersions = ({ created, updated, deleted }) => ({ created, updated, deleted });

// 母集団1: v6 のデコモジ。追加・更新・全削除の対象になる
const getV6Decomojis = async () => {
  const { decomojis } = await getParsedJson(V6_DATABASE);

  return decomojis.map((decomoji) => ({
    // { name, category, path } になる
    ...convertToUploadObject(decomoji),
    ...pickVersions(decomoji),
  }));
};

// 母集団2: v4/v5 で一度でも存在した名前。移行・全削除で消す対象になる
// v5 は現存するデコモジ（decomojis）ではなく履歴の全件（decomojis_full）を見るので、
// v5 の途中で消えたデコモジやエイリアスも取りこぼさない
const getLegacyDecomojis = async () => {
  const [{ decomojis_full }, v4All] = await Promise.all([
    getParsedJson(V5_HISTORY),
    getParsedJson(V4_ALL),
  ]);

  // v5 の履歴が持つ deleted は引き継がない
  // v5 の途中で消えていても、ワークスペースには残っているかもしれないので消しにいく
  const v5Decomojis = decomojis_full.map(({ name, category }) => ({ name, category }));

  // v4 の config はカテゴリーを持たないのでパスから引く
  // 先頭の "./" が付いたままだと引けないので落としておく
  const v4Decomojis = v4All.map(({ name, path }) => ({
    name,
    category: getDecomojiCategory(String(path).replace(/^\.\//, "")),
  }));

  return uniqueByName([...v5Decomojis, ...v4Decomojis]);
};

// 母集団3: v5 の名前 -> v6 の名前 のエイリアス。互換のある移行で貼る対象になる
const getAliasDecomojis = async () => {
  const [{ decomojis }, { decomojis_full }] = await Promise.all([
    getParsedJson(V6_DATABASE),
    getParsedJson(V5_HISTORY),
  ]);

  // 途中で消えたものも含めて、v5 で一度でも使われた名前を引けるようにする
  // 古いメッセージに残っている :namae: にも v6 のデコモジが表示されるようになる
  const v5Names = new Set(decomojis_full.map(({ name }) => name));

  return decomojis.flatMap((decomoji) => {
    const name = getDecomojiName(decomoji);

    // v5 に実在した名前だけがエイリアスになれる。v6 で新規追加したものには貼る先がない
    // また、表記がラテン文字の場合など v6 の名前と同じになるものは自分自身を指してしまうので除く
    const oldNames = [decomoji.kunnrei, decomoji.hepburn]
      .filter(isStringOfNotEmpty)
      .filter((oldName) => v5Names.has(oldName) && oldName !== name);

    return oldNames.map((oldName) => ({
      name: oldName,
      alias_for: name,
      category: decomoji.category,
      ...pickVersions(decomoji),
    }));
  });
};

// mode と invoker の掛け合わせで、どの母集団を見るかを決める
// 組み合わせが無いもの（uninstall の uploader など）は assigner が呼ばないので空にしてある
const SOURCES = {
  update: {
    remover: [getV6Decomojis],
    uploader: [getV6Decomojis],
    // TODO: 互換のある移行をした後の更新では、差し替えたデコモジを消した時に
    // エイリアスも道連れで消えるので貼り直しが要る。
    // それには前回の実行モード（history.inputs.mode）を curator() に渡す必要があるため、
    // assigner() が update でも pretender を回すようになってから対応する
    pretender: [],
  },
  uninstall: {
    // 全削除なので v6 だけでなく v4/v5 で配ったものも消す
    remover: [getV6Decomojis, getLegacyDecomojis],
  },
  migration: {
    remover: [getLegacyDecomojis],
    uploader: [getV6Decomojis],
  },
  compatible_migration: {
    remover: [getLegacyDecomojis],
    uploader: [getV6Decomojis],
    pretender: [getAliasDecomojis],
  },
};

// デコモジ1件が処理の対象になるか否かを判定する
const isTarget = (decomoji, { initial_run, version, mode, includeNsfw, invoker }) => {
  const { category, created, updated, deleted } = decomoji;
  const isRemoving = invoker === "remover";

  // includeNsfw が false の時は NSFW なカテゴリーを扱わない。追加も削除もしない
  if (!includeNsfw && NSFW_CATEGORIES.includes(category)) {
    return false;
  }

  // 配布をやめたデコモジは追加しない
  // 削除側はワークスペースに残っているかもしれないので対象にする
  if (!isRemoving && isStringOfNotEmpty(deleted)) {
    return false;
  }

  // 全削除と移行はバージョンを問わず、カテゴリーに属するものを全部処理する
  if (mode !== "update") {
    return true;
  }

  // 初回実行やバージョンが不明な時は、すべてが新規追加とみなせる（消すものは無い）
  if (initial_run || !isStringOfNotEmpty(version)) {
    return !isRemoving;
  }

  // 前回より後に追加（created）されたか、差し替え（updated）されたものを追加する
  if (!isRemoving) {
    return isNewerThan(created, version) || isNewerThan(updated, version);
  }

  // 差し替えは上書きできないので、一度消してから入れ直す
  if (isNewerThan(updated, version)) {
    return true;
  }

  // 前回より後に配布をやめたものも消す
  // 前回より前からある = ワークスペースに入っているものだけでよい
  return isNewerThan(deleted, version) && !isNewerThan(created, version);
};

// invoker が必要とするプロパティだけに整える
const FORMATTERS = {
  remover: ({ name }) => ({ name }),
  uploader: ({ name, category, path }) => ({ name, category, path }),
  pretender: ({ name, alias_for }) => ({ name, alias_for }),
};

export const curator = async ({ initial_run, version, mode, includeNsfw, invoker }) => {
  const getSources = SOURCES[mode]?.[invoker] ?? [];

  // 処理する母集団が無い組み合わせは、何もしないで返す
  if (getSources.length === 0) {
    return [];
  }

  const decomojis = (await Promise.all(getSources.map((getSource) => getSource()))).flat();
  const curated = decomojis.filter((decomoji) =>
    isTarget(decomoji, { initial_run, version, mode, includeNsfw, invoker }),
  );

  return uniqueByName(curated).map(FORMATTERS[invoker]);
};
