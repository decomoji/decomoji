import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminOptipng from "imagemin-optipng";

const plugins = [imageminPngquant(), imageminOptipng()];

const optimize = async (category, dest) => {
  const path = category === "docs" ? "docs/images" : `decomoji/${category}`;
  const destination = dest ? `./${dest}/` : `./${path}/`;
  console.log(`./${path}_tmp/** is optimizing...`);
  await imagemin([`./${path}_tmp`], {
    destination,
    plugins,
  });
  console.log(`./${path}/** has been optimized!`);
};

optimize(process.argv[2], process.argv[3]);
