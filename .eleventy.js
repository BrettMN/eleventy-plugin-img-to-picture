const replaceImgsWithPictures = require('./src/replaceImgsWithPictures');

const getAllFiles = require('./src/getAllFiles');
const resizeImage = require('./src/resizeImage');

const defaultOptions = {
  sizes: [
    { screen: { max: 639 }, img: { width: 620 } },
    { screen: { min: 640, max: 767 }, img: { width: 620 } },
    { screen: { min: 768, max: 1023 }, img: { width: 750 } },
    { screen: { min: 1024, max: 1279 }, img: { width: 1000 } },
    { screen: { min: 1280 }, img: { width: 1260 } },
  ],
};

module.exports = function (eleventyConfig, options) {
  eleventyConfig.on('afterBuild', () => {
    let sizes = options.sizes || defaultSizes;

    let output = options.output || '_site';

    let filesResults = getAllFiles('dist', [], ['html']);

    filesResults.forEach((filePath) => {
      replaceImgsWithPictures(filePath, {
        sizes,
        output,
      });
    });
  });

  // eleventyConfig.addTransform(
  //   'imgToPicture',
  //   async function (content, outputPath) {
  //     sizes = options.sizes || defaultSizes;

  //     if (outputPath.includes('.html')) {
  //       content = replaceImgsWithPictures(content, { sizes });
  //     }
  //     return content;
  //   }
  // );
};
