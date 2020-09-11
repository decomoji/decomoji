// node scripts/generator/toDuplicateJson.js ~/Downloads/candidate.csv
const fs = require("fs");

// v5_all のデータを準備しておく
const all_buffer = fs.readFileSync("./configs/v5_all.json");
const exists = JSON.parse(all_buffer);
