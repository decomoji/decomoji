"use strict";

const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminOptipng = require("imagemin-optipng");

async function optimize(path) {
  console.log(`${path}**.png is optimizing...`);
  await imagemin([path], {
    destination: path,
    plugins: [imageminPngquant(), imageminOptipng()],
  });

  console.log(`${path}**.png has been optimized!`);
}

optimize("./docs/images/");
optimize("./decomoji/basic/");
optimize("./decomoji/extra/");
optimize("./decomoji/explicit/");
