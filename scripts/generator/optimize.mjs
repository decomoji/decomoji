import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminOptipng from "imagemin-optipng";

const optimize = async (arg) => {
  const path = arg === "docs" ? "docs/images" : `decomoji/${arg}`;
  console.log(`./${path}_tmp/** is optimizing...`);
  await imagemin([`./${path}_tmp`], {
    destination: `./${path}/`,
    plugins: [imageminPngquant(), imageminOptipng()],
  });
  console.log(`./${path}/** has been optimized!`);
};

optimize(process.argv[2]);
