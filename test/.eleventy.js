// Import plugin
const imgToPicture = require('../.eleventy.js');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('src/**/*.jpg');
  eleventyConfig.addPassthroughCopy('src/**/*.jpeg');
  eleventyConfig.addPassthroughCopy('src/**/*.png');
  eleventyConfig.addPassthroughCopy('src/**/*.mp4');
  eleventyConfig.addPassthroughCopy('src/**/*.gif');
  /*
    ## Set up example
    Copy bellow 
  */
  eleventyConfig.addPlugin(imgToPicture, {
    sizes: [
      { screen: { max: 639 }, img: { width: 620 } },
      { screen: { min: 640, max: 767 }, img: { width: 620 } },
      { screen: { min: 768, max: 1023 }, img: { width: 750 } },
      { screen: { min: 1024, max: 1279 }, img: { width: 1000 } },
      { screen: { min: 1280 }, img: { width: 1260 } },
    ],
    images: { types: ['png'], skip: [] },
    output: 'dist',
  });

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
