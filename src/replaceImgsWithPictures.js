const fs = require('fs');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const logMessage = require('./logMessage');

const formatNewFileName = require('./formatFileName');
const resizeImage = require('./resizeImage');

const logReplaceImgsWithPictures = false;

function log(...things) {
  logMessage(logReplaceImgsWithPictures, ...things);
}

module.exports = function (filePath, { sizes, output }) {
  return new Promise((resolve) => {
    console.info('Order: 2');

    logMessage(logReplaceImgsWithPictures);

    let fileContents = fs.readFileSync(filePath, 'utf8');

    let updatedContent = '';

    getImgsToReplaceWithPictures(
      fileContents,
      sizes,
      output,
      function (imgsToReplaceWithPictures) {
        log({ imgsToReplaceWithPictures });

        updatedContent = fileContents;

        console.info('Order: 10');
        imgsToReplaceWithPictures.forEach((imgToReplaceWithPicture) => {
          updatedContent = updatedContent.replace(
            imgToReplaceWithPicture.img,
            imgToReplaceWithPicture.picture
          );
        });

        console.info('Order: 11');
        fs.writeFileSync(filePath, updatedContent);

        log(`file ${filePath} changed? ${fileContents !== updatedContent}`);
        console.log(
          `file ${filePath} changed? ${fileContents !== updatedContent}`
        );
        resolve();
      }
    );

    // return fileContents;
  });
};

function getImgsToReplaceWithPictures(fileContents, sizes, output, callback) {
  console.info('Order: 3');
  let imgsToReplaceWithPictures = [];
  let pictureElement = '';
  let processedImagesSrc = [];

  let dom = new JSDOM(fileContents, { includeNodeLocations: true });

  const document = dom.window.document;
  const imgElements = document.querySelectorAll('img');

  log({ imgElements });

  log(imgElements.length);

  imgElements.forEach((img) => {
    let location = dom.nodeLocation(img);

    log({ location });

    let imgString = fileContents.slice(
      location.startOffset,
      location.endOffset
    );

    log({ imgString });

    let srcPathLocation = location.attrs.src;

    log({ srcPathLocation });

    log(`fileContents.length: ${fileContents.length}`);

    // let srcPath = fileContents
    //   .slice(srcPathLocation.startOffset, srcPathLocation.endOffset)
    //   .slice(4); //remove src=
    const srcPath = cheerio.load(imgString)('img').attr('src');

    if (processedImagesSrc.includes(srcPath) == false) {
      console.info('Order: 4');
      resizeImage(srcPath, { sizes, output }, function (sources) {
        log({ sources });

        console.info('Order: 8.9');

        pictureElement = `
          <picture>
            ${sources.join('')}
            ${imgString}
          </picture>
          `;
        log({ pictureElement });

        imgsToReplaceWithPictures.push({
          img: imgString,
          picture: pictureElement,
        });

        processedImagesSrc.push(srcPath);

        // if (imgElements.length === processedImagesSrc) {
        console.info('Order: 9');
        callback(imgsToReplaceWithPictures);
        // }
      });
    }
  });

  // callback(imgsToReplaceWithPictures);
}
