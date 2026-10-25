import { execFileSync } from "child_process";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// このスクリプトが置かれているディレクトリ（= optimizer パッケージのルート）
const cwd = fileURLToPath(new URL(".", import.meta.url));

// 並行処理数。これより増やしても効果がない。
const CONCURRENCY = 32;

// @napi-rs/image はリポジトリ全体の依存にせずここだけに置いているので、無ければ入れてから読み込む
const getCompressor = async () => {
  try {
    return (await import("@napi-rs/image")).losslessCompressPng;
  } catch (err) {
    if (err.code !== "ERR_MODULE_NOT_FOUND") {
      throw err;
    }
    console.log("@napi-rs/image is not installed, installing...");
    // npm run 経由で呼ばれると npm_config_prefix が効いてインストール先がずれるので落とす
    const env = { ...process.env };
    delete env.npm_config_prefix;
    delete env.npm_config_local_prefix;
    execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["install"], {
      cwd,
      env,
      stdio: "inherit",
    });
    return (await import("@napi-rs/image")).losslessCompressPng;
  }
};

const optimizer = async (category, dest) => {
  const path = category === "docs" ? "docs/images" : `decomoji/${category}`;
  const source = `./${path}_tmp`;
  const destination = dest ? `./${dest}/` : `./${path}/`;

  console.log(`${source}/** is optimizing...`);

  const files = await fs
    .readdir(source)
    // .DS_Store や AppleDouble (._hoge.png) を拾わないようにドットファイルは除く
    .then((files) => files.filter((file) => !file.startsWith(".") && file.endsWith(".png")))
    .catch((err) => {
      // 一次フォルダがないカテゴリーは何もしない（ENOENT エラーを catch した場合は throw しない）
      if (err.code !== "ENOENT") {
        throw err;
      }
      return [];
    });

  if (files.length === 0) {
    console.log(`${source}/** has no decomoji, skipped.`);
    return;
  }

  const compressor = await getCompressor();

  await fs.mkdir(destination, { recursive: true });

  for (let i = 0; i < files.length; i += CONCURRENCY) {
    await Promise.all(
      files.slice(i, i + CONCURRENCY).map(async (file) => {
        const input = await fs.readFile(`${source}/${file}`);
        // strip: true で pHYs などの非必須チャンクを落とし、IHDR,PLTE,tRNS だけにする
        const output = await compressor(input, { strip: true }).catch((err) => {
          // どのファイルで落ちたのか分からないと直しようがないのでファイル名を添える
          throw new Error(`${source}/${file} の最適化に失敗した`, { cause: err });
        });
        await fs.writeFile(`${destination}${file}`, output);
      }),
    );
  }

  console.log(`${destination}** has been optimized!`);
};

// npm run optimize -- basic
// node scripts/generator/optimizer/index.mjs docs
optimizer(process.argv[2], process.argv[3]);
