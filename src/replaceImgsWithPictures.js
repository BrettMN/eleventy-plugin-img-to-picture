const fs = require('fs');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const logMessage = require('./logMessage');

const formatNewFileName = require('./formatFileName');
const resizeImage = require('./resizeImage');

const logReplaceImgsWithPictures = true;

function log(...things) {
  logMessage(logReplaceImgsWithPictures, ...things);
}

module.exports = async function (filePath, { sizes, output }) {
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

      imgsToReplaceWithPictures.forEach((imgToReplaceWithPicture) => {
        updatedContent = updatedContent.replace(
          imgToReplaceWithPicture.img,
          imgToReplaceWithPicture.picture
        );
      });

      fs.writeFileSync(filePath, fileContents);

      log(`file ${filePath} changed? ${fileContents !== updatedContent}`);
    }
  );
  // return fileContents;
};

async function getImgsToReplaceWithPictures(
  fileContents,
  sizes,
  output,
  callback
) {
  let imgsToReplaceWithPictures = [];
  let pictureElement = '';
  let processedImagesSrc = [];

  let dom = new JSDOM(fileContents, { includeNodeLocations: true });

  const document = dom.window.document;
  const imgElements = document.querySelectorAll('img');

  log({ imgElements });

  log(imgElements.length);

  imgElements.forEach(async (img) => {
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
      resizeImage(srcPath, { sizes, output }).then((sources) => {
        log({ sources });

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

        if (imgElements.length === processedImagesSrc) {
          callback(imgsToReplaceWithPictures);
        }
      });
    }
  });
}
