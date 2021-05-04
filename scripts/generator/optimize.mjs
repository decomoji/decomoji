"use strict";

import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminOptipng from "imagemin-optipng";

async function optimize(category) {
  console.log(`./decomoji/${category}_tmp/**.png is optimizing...`);
  await imagemin([`./decomoji/${category}_tmp`], {
    destination: `./decomoji/${category}/`,
    plugins: [imageminPngquant(), imageminOptipng()],
  });

  console.log(`./decomoji/${category}/**.png has been optimized!`);
}

optimize(process.argv[2]);
