const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const logMessage = require('./logMessage');

const formatNewFileName = require('./formatFileName');

const logReplaceImgsWithPictures = false;

module.exports = function (fileContents, { sizes }) {
  logMessage(logReplaceImgsWithPictures);

  // let fileContents = fs.readFileSync(filePath, 'utf8');

  let pictureElement = '';

  let updatedContent = '';

  let dom = new JSDOM(fileContents, { includeNodeLocations: true });

  const document = dom.window.document;
  const imgElements = document.querySelectorAll('img');

  logMessage(logReplaceImgsWithPictures, { imgElements });

  logMessage(logReplaceImgsWithPictures, imgElements.length);
  let processedImagesSrc = [];

  let imgsToReplaceWithPictures = [];

  imgElements.forEach((img) => {
    let location = dom.nodeLocation(img);

    logMessage(logReplaceImgsWithPictures, { location });

    let imgString = fileContents.slice(
      location.startOffset,
      location.endOffset
    );

    logMessage(logReplaceImgsWithPictures, { imgString });

    let srcPathLocation = location.attrs.src;

    // logMessage(logReplaceImgsWithPictures, { srcPathLocation });

    // console.log(`fileContents.length: ${fileContents.length}`);

    // let srcPath = fileContents
    //   .slice(srcPathLocation.startOffset, srcPathLocation.endOffset)
    //   .slice(4); //remove src=

    const srcPath = cheerio.load(imgString)('img').attr('src');

    if (processedImagesSrc.includes(srcPath) == false) {
      let newPaths = [];
      sizes.forEach((size) => {
        let newFileName = formatNewFileName(srcPath, size);
        if (newFileName) {
          newPaths.push({
            path: newFileName,
            size: size,
          });
        }
      });
      let sources = [];
      newPaths.forEach((path) => {
        logMessage(logReplaceImgsWithPictures, { path });
        sources.push(
          `<source srcset="${path.path}" width="${
            path.size.img.width
          }" media="(${
            path.size.screen.min
              ? 'min-width: ' + path.size.screen.min + 'px'
              : ''
          }${path.size.screen.max && path.size.screen.min ? ') and (' : ''}${
            path.size.screen.max
              ? 'max-width: ' + path.size.screen.max + 'px'
              : ''
          })" type="image/webp">`
        );
      });
      pictureElement = `
      <picture>
        ${sources.join('')}
        ${imgString}
      </picture>
      `;
      logMessage(logReplaceImgsWithPictures, { pictureElement });

      imgsToReplaceWithPictures.push({
        img: imgString,
        picture: pictureElement,
      });

      processedImagesSrc.push(srcPath);
    }
  });

  imgsToReplaceWithPictures.forEach((imgToReplaceWithPicture) => {
    fileContents = fileContents.replace(
      imgToReplaceWithPicture.img,
      imgToReplaceWithPicture.picture
    );
  });

  // fs.writeFileSync(filePath, fileContents);

  // logMessage(
  //   logReplaceImgsWithPictures,
  //   `file ${filePath} changed? ${fileContents !== updatedContent}`
  // );

  return fileContents;
};
