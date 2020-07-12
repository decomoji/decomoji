"use strict";

const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminOptipng = require("imagemin-optipng");

async function optimize_decomoji(category) {
  await imagemin([`./decomoji/${category}/`], {
    destination: `./decomoji/${category}/`,
    plugins: [imageminPngquant(), imageminOptipng()],
  });

  console.log(`decomoji in ${category} has been optimized!`);
}

optimize_decomoji("basic");
optimize_decomoji("extra");
optimize_decomoji("explicit");
