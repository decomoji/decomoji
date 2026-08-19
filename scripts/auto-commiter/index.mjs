import { execSync } from "child_process";

const { default: list } = await import(process.argv[2], { with: { type: "json" } }).catch((err) => {
  console.error(err);
  process.exit(1);
});
const mode = process.argv[3] ?? process.exit(1);

Array.from(list).forEach((item, i) => {
  /**
   * [
   *  {
   *    "category": "basic" | "extra" | "explicit",
   *    "old_": "hai-",
   *    "new_": "hai_"
   *  }
   * ]
   */
  if (mode === "rename") {
    const { category, old_, new_ } = item;
    const resultBuffer = execSync(
      `git mv decomoji/${category}/${old_}.png decomoji/${category}/${new_}.png`,
    );
    if (!resultBuffer) return process.exit(1);
    execSync(`git add decomoji/.`);
    execSync(`git commit -m "fix: ${old_}.png -> ${new_}.png (${category})"`);
    console.log(i, `commited fix: ${old_} -> ${new_} (${category})`);
  }

  /**
   * [
   *  {
   *    "category": "extra" | "extra" | "explicit",
   *    "name": "konosutei"
   *  }
   * ]
   */
  if (mode === "modify") {
    const { category, name } = item;
    const resultBuffer = execSync(`git add decomoji/${category}/${name}.png`);
    if (!resultBuffer) return process.exit(1);
    execSync(`git commit -m "fix: ${name} の画像を修正した"`);
    console.log(i, `commited fix: ${name} (${category})`);
  }
});
