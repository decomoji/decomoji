/**
 *　inquirer で実行に必要な設定ファイルを作る
 */
import inquirer from "inquirer";
import { format } from "date-fns";
import { getGitTagArray } from "../../utilities/getGitTagArray.mjs";
import { getGitTaggingDateArray } from "../../utilities/getGitTaggingDateArray.mjs";
import { isEmail } from "../../utilities/isEmail.mjs";
import { isInputs } from "../../utilities/isInputs.mjs";
import { isSelects } from "../../utilities/isSelects.mjs";
import { FIRST_LETTERS } from "../../models/constants.mjs";

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

// inquirer Setting
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
    message: "実行モードを選択してください:",
    choices: [
      {
        name: "v6間で差分更新",
        value: "update",
      },
      {
        name: "v6を追加",
        value: "upload",
      },
      {
        name: "v6を削除",
        value: "remove",
      },
      {
        name: "v6をエイリアス登録",
        value: "alias",
      },
      {
        name: "v5からv6へ移行",
        value: "migration",
      },
    ],
  },
  {
    when: ({ mode }) =>
      mode === "update" || mode === "upload" || mode === "remove",
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
      const items = [
        {
          name: "基本セット",
          value: "basic",
        },
        {
          name: "拡張セット",
          value: "extra",
        },
        {
          name: "露骨セット",
          value: "explicit",
        },
      ];
      return mode === "remove"
        ? // 削除モードの場合、ファイル名にミスがあったものも選択肢に追加する
          [
            ...items,
            {
              name: "ファイル名にミスがあったもの",
              value: "fixed",
            },
          ]
        : items;
    },
    validate: isSelects,
  },
  // {
  //   when: ({ term }) => term === "category",
  //   type: "list",
  //   message: "頭文字を選んで登録しますか？:",
  //   name: "first_letter_mode",
  //   choices: [
  //     {
  //       name: "選択しない",
  //       value: false,
  //     },
  //     {
  //       name: "選択する",
  //       value: true,
  //     },
  //   ],
  //   validate: isSelects,
  // },
  // {
  //   when: ({ first_letter_mode }) => first_letter_mode,
  //   type: "checkbox",
  //   message: "頭文字を選択してください:",
  //   name: "selected_first_letters",
  //   choices: () => {
  //     return [
  //       new inquirer.Separator(),
  //       {
  //         name: "全て",
  //         value: "all",
  //       },
  //       ...FIRST_LETTERS.map((v) => ({
  //         name: `${v}...`,
  //         value: v,
  //       })),
  //     ];
  //   },
  //   validate: isSelects,
  // },
  {
    when: ({ term }) => term === "version",
    type: "checkbox",
    message: "バージョンを選択してください:",
    name: "configs",
    choices: () => {
      // TODO: `additional` という変数名をやめる。toBeVer とか
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
  // {
  //   when: ({ mode, term }) => (mode === "update" || mode === "upload") && term === "version",
  //   type: "list",
  //   message: "選択したバージョンに含まれる「露骨」カテゴリーのデコモジを追加対象に含めますか？:",
  //   name: "excludeExplicit",
  //   choices: [
  //     {
  //       name: "含めない",
  //       value: false,
  //     },
  //     {
  //       name: "含める（「露骨」カテゴリの中身を理解していますか？　していない場合、含めない方が良いです）",
  //       value: true
  //     },
  //   ],
  //   validate: isSelects,
  // },
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
  {
    when: ({ mode }) =>
      mode === "update" || mode === "remove" || mode === "migration",
    type: "list",
    message: ({ mode }) => {
      const common = "削除の強さを選択してください:";
      const upgrade =
        "更新及び移行モードでは修正された古いデコモジを削除します。";
      return mode === "remove" ? `${common}` : `${upgrade}${common}`;
    },
    name: "forceRemove",
    choices: [
      {
        name: "強（権限があれば他メンバーが登録したデコモジも消す）",
        value: true,
      },
      {
        name: "弱（自分が登録したデコモジだけ消す）",
        value: false,
      },
    ],
    validate: isSelects,
  },
];

export const askInputs = (callback, additional) => {
  inquirer.prompt(questions(additional)).then(callback);
};
