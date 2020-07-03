"use strict";

const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminOptipng = require("imagemin-optipng");

async function optimize_decomoji(type) {
  await imagemin([`./decomoji/${type}/`], {
    destination: `./decomoji/${type}/`,
    plugins: [imageminPngquant(), imageminOptipng()],
  });

  console.log(`decomoji in ${type} has been optimized!`);
}

optimize_decomoji("basic");
optimize_decomoji("extra");
