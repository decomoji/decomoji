const fs = require("fs");

const writeJsonFileSync = require("../../utilities/writeJsonFileSync");

const outputLogs = (data, name, INVOKER) => {
  writeJsonFileSync(data, `./configs/_${INVOKER}_tmp_${name}.json`);
  console.log(`_${INVOKER}_tmp_${name}.json length:`, data.length);
};

const getLocalJson = (CONFIGS, TERM, KEYS, INVOKER, LOG) => {
  LOG && console.log("getLocalJson(", { CONFIGS, TERM, INVOKER, KEYS }, ")");
  // term=category では [tag1, tag2]、term=version では [[tag1, tag2], [tag3, tag4]] で渡ってくるのでどちらとも構わず平たくする
  const combined = CONFIGS.flat().flatMap((target) =>
    JSON.parse(fs.readFileSync(`./configs/${target}.json`, "utf8"))
  );
  LOG && outputLogs(combined, "combined", INVOKER);
  // term-version の時、[{ "fixed": [...], "upload": [...], "rename": [...] }, { "fixed": [...], "upload": [...], "rename": [...] }, ...] という、
  // filterMode 別のオブジェクトが v5.x.y ごとに配列になっているので、これから KEYS のプロパティだけ抽出して平たくする
  const filtered =
    TERM === "version"
      ? KEYS.flatMap((key) => combined.flatMap((item) => item[key]))
      : combined;
  LOG && outputLogs(filtered, "filtered", INVOKER);
  return filtered;
};
module.exports = getLocalJson;
