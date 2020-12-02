"use strict";

const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const imageminOptipng = require("imagemin-optipng");

async function optimize(category) {
  console.log(`./decomoji/${category}_tmp/**.png is optimizing...`);
  await imagemin([`./decomoji/${category}_tmp`], {
    destination: `./decomoji/${category}/`,
    plugins: [imageminPngquant(), imageminOptipng()],
  });

  console.log(`./decomoji/${category}/**.png has been optimized!`);
}

optimize(process.argv[2]);
