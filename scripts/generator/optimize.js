"use strict";

const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminOptipng = require("imagemin-optipng");

async function optimize(source, output) {
  console.log(`${source}**.png is optimizing...`);
  await imagemin([source], {
    destination: output || source,
    plugins: [imageminPngquant(), imageminOptipng()],
  });

  console.log(`${source}**.png has been optimized!`);
}

optimize(process.argv[2], process.argv[3]);
