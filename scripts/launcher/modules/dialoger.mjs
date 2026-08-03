import inquirer from "inquirer";
import { getGitTagArray } from "../../utilities/getGitTagArray.mjs";
import { getGitTaggingDateArray } from "../../utilities/getGitTaggingDateArray.mjs";
import { getParsedJson } from "../../utilities/getParsedJson.mjs";
import { isEmail } from "../../utilities/isEmail.mjs";
import { isInputs } from "../../utilities/isInputs.mjs";
import { isSelects } from "../../utilities/isSelects.mjs";

const MODE_ITEMS = [
  {
    name: "インストール",
    value: "install",
  },
  {
    name: "更新",
    value: "update",
  },
  {
    name: "移行（v5 から v6 へ）",
    value: "migration",
  },
  {
    name: "アンインストール",
    value: "uninstall",
  },
];

const CATEGORY_ITEMS = [
  {
    name: "基本セット",
    value: "v5_basic",
  },
  {
    name: "拡張セット",
    value: "v5_extra",
  },
  {
    name: "露骨セット",
    value: "v5_explicit",
  },
];

const MONTH_LIST = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// TODO: バージョンを選択する機能は廃止する
const V5_TAGGING_DATES = getGitTaggingDateArray()
  .filter((v) => /^v5/.test(v))
  .map((v) => {
    const [tag, ...dates] = v.split(" ");
    const [week, month, day, time, year, diff] = dates.filter((v) => v !== "");
    const mn = MONTH_LIST.indexOf(month);
    return [tag, `${year}年${mn + 1}月${Number(day)}日公開`];
  })
  .reduce(
    (acc, value) => ({
      ...acc,
      ...{ [value[0]]: value[1] },
    }),
    {},
  );

const AVAILABLE_VERSION_ITEMS = (await getParsedJson("../../configs/v5_versions.json"))
  .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
  .map((tag) => ({
    name: `${tag}（${V5_TAGGING_DATES[tag]}）`,
    value: tag,
  }));

// inquirer 用の質問群を返す関数
const questions = (preflight) => [
  {
    type: "input",
    name: "workspace",
    message: "ワークスペースのサブドメインを入力してください:",
    validate: isInputs,
  },
  {
    type: "input",
    name: "email",
    message: "メールアドレスを入力してください:",
    validate: isEmail,
  },
  {
    type: "password",
    name: "password",
    mask: "*",
    message: "パスワードを入力してください:",
    validate: isInputs,
  },
  {
    type: "rawlist",
    name: "mode",
    message: "モードを選択してください:",
    choices: MODE_ITEMS,
  },
  {
    when: ({ mode }) => mode === "update" || mode === "install" || mode === "uninstall",
    type: "rawlist",
    message: "対象タイプを選択してください:",
    name: "term",
    choices: [
      {
        name: "バージョンごと",
        value: "version",
      },
      {
        name: "カテゴリーごと",
        value: "category",
      },
    ],
    validate: isSelects,
  },
  {
    when: ({ term }) => term === "category",
    type: "checkbox",
    message: "カテゴリーを選択してください:",
    name: "configs",
    choices: ({ mode }) => {
      return mode === "uninstall"
        ? [
            ...CATEGORY_ITEMS,
            {
              name: "v5 以降でファイル名にミスがあったもの",
              value: "v5_fixed",
            },
          ]
        : CATEGORY_ITEMS;
    },
    validate: isSelects,
  },
  {
    when: ({ term }) => term === "version",
    type: "checkbox",
    message: "バージョンを選択してください:",
    name: "configs",
    choices: () => {
      if (preflight) {
        AVAILABLE_VERSION_ITEMS.unshift({
          name: `${preflight}（リリース予定のバージョン）`,
          value: preflight,
        });
      }
      return [new inquirer.Separator(), ...AVAILABLE_VERSION_ITEMS];
    },
    validate: isSelects,
  },
  {
    when: ({ mode }) => mode === "alias",
    type: "checkbox",
    name: "configs",
    message: "エイリアスを選択してください:",
    choices: [
      {
        name: "v5 以降でファイル名を修正したもの",
        value: "v5_rename",
      },
    ],
    validate: isSelects,
  },
];

export const dialoger = async (callback, preflight) =>
  await inquirer.prompt(questions(preflight)).then(callback);
