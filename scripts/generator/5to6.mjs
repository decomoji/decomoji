/**
 * <root>/database.json を元に ${kunnrei}.png を ${id}.png にリネームして別フォルダにコピーする
 * e.g. $ node scripts/generator/5to6.mjs
 */
import { copyFileSync, mkdirSync, readFileSync, readdirSync } from "fs";

const databasePath = process.argv[2] || "database.json";

const isPng = (filename) => /.+\.png$/.test(filename);
const database = readFileSync(databasePath, "utf-8");
let db;
try {
  db = JSON.parse(database);
} catch (error) {
  console.error(error);
  throw error;
}

[
  ...readdirSync("decomoji/basic/").filter(isPng),
  ...readdirSync("decomoji/extra/").filter(isPng),
  ...readdirSync("decomoji/explicit/").filter(isPng),
].forEach((image) => {
  const imagename = image.replace(/\.png$/, "");
  const matched = db.find(({ kunnrei }) => kunnrei === imagename);
  if (matched) {
    const { category, id } = matched;
    const oldDir = `decomoji/${category}`;
    const newDir = `reacji/${category}`;
    mkdirSync(oldDir, { recursive: true });
    mkdirSync(newDir, { recursive: true });
    copyFileSync(`${oldDir}/${image}`, `${newDir}/${id}.png`);
    console.log(`Copied: ${oldDir}/${image} -> ${newDir}/${id}.png`);
  }
});
