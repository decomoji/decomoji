// node scripts/generator/toDuplicateJson.js ~/Downloads/candidate.csv
const fs = require("fs");

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
