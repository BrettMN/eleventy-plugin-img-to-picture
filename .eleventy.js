module.exports = function (eleventyConfig, options) {
  eleventyConfig.on('beforeBuild', (...changedFiles) => {
    // Run me before the build starts
    console.log('beforeBuild', { changedFiles });
  });

  eleventyConfig.on('afterBuild', async () => {
    // Run me after the build ends

    console.log('afterBuild');

    let results = await Promise.all([]);

    console.log('done processing', { results });
  });
};
