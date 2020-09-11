// node scripts/generator/toDuplicateJson.js ~/Downloads/candidate.csv
const fs = require("fs");
const isStringOfNotEmpty = require("../utilities/isStringOfNotEmpty");

// v5_all のデータを準備しておく
const all_buffer = fs.readFileSync("./configs/v5_all.json");
const exists = JSON.parse(all_buffer);

// csv ファイルのパスは node コマンド引数から受け取る
const CSV_PATH = process.argv[2];

// 引数がなかったらエラーを投げる
if (!CSV_PATH) {
  throw new Error("CSV_PATH argument is undefined.");
}

// CSV をパースして行ごとの配列にする
const csv = fs.readFileSync(CSV_PATH).toString().split("\n");

// 行を配列にしてキーと値群に分ける
const [header, ...values] = csv.map((v) => v.replace("\r", "").split(","));

// header[i] をキーにしたオブジェクトに変形する
const labelled = values.map((row) => {
  return row.reduce((prev, value, i) => {
    // 値が空文字列ではない場合飲みメンバーに追加する
    if (isStringOfNotEmpty(value)) {
      prev[header[i]] = value;
    }
    return prev;
  }, {});
});

// `ignore: TRUE` を取り除く
const candidates = labelled.filter((v) => !v.ignore);
