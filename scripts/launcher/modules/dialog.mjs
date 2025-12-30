import inquirer from "inquirer";
import { format } from "date-fns";
import { getGitTagArray } from "../../utilities/getGitTagArray.mjs";
import { getGitTaggingDateArray } from "../../utilities/getGitTaggingDateArray.mjs";
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

const V5_TAGGING_DATES = getGitTaggingDateArray()
  .filter((v) => /^v5/.test(v))
  .map((v) => {
    const [tag, ...dates] = v.split(" ");
    const [week, month, day, time, year, diff] = dates.filter((v) => v !== "");
    const mn = MONTH_LIST.indexOf(month);
    return [tag, format(new Date(year, mn, day), "yyyy年M月d日公開")];
  })
  .reduce(
    (acc, value) => ({
      ...acc,
      ...{ [value[0]]: value[1] },
    }),
    {},
  );

const FULL_VERSIONS_ITEMS = getGitTagArray("v5")
  .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
  .map((tag) => ({
    name: `${tag}（${V5_TAGGING_DATES[tag]}）`,
    value: tag,
  }));

// inquirer 用の質問群を返す関数
const questions = (additional) => [
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
    type: "list",
    name: "mode",
    message: "モードを選択してください:",
    choices: MODE_ITEMS,
  },
  {
    when: ({ mode }) =>
      mode === "update" || mode === "install" || mode === "uninstall",
    type: "list",
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
      if (additional) {
        FULL_VERSIONS_ITEMS.unshift({
          name: `${additional}（ユーザーが追加したバージョン）`,
          value: additional,
        });
      }
      return [new inquirer.Separator(), ...FULL_VERSIONS_ITEMS];
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

export const dialog = (callback, additional) => {
  inquirer.prompt(questions(additional)).then(callback);
};
