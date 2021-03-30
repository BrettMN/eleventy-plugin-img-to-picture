const fs = require('fs');
const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const logMessage = require('./logMessage');

const resizeImage = require('./resizeImage');

const logReplaceImgsWithPictures = false;

function log(...things) {
  logMessage(logReplaceImgsWithPictures, ...things);
}

module.exports = function (filePath, { sizes, output }) {
  logMessage(logReplaceImgsWithPictures);

  getImgsToReplaceWithPictures(
    sizes,
    output,
    filePath,
    getImgsToReplaceWithPicturesCallback
  );
};

function getImgsToReplaceWithPicturesCallback(
  imgsToReplaceWithPictures,
  fileContents,
  filePath
) {
  log({ imgsToReplaceWithPictures });

  let updatedContent = fileContents;
  imgsToReplaceWithPictures.forEach((imgToReplaceWithPicture) => {
    updatedContent = updatedContent.replace(
      imgToReplaceWithPicture.img,
      imgToReplaceWithPicture.picture
    );
  });

  fs.writeFileSync(filePath, updatedContent);

  log(`file ${filePath} changed? ${imgsToReplaceWithPictures.length > 0}`);
}

function getImgsToReplaceWithPictures(sizes, output, filePath, callback) {
  let imgsToReplaceWithPictures = [];
  let pictureElement = '';
  let processedImagesSrc = [];

  let fileContents = fs.readFileSync(filePath, 'utf8');

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

    log(`fileContents.length: ${fileContents.length}`);

    const rawSrcPath = cheerio.load(imgString)('img').attr('src');

    const srcPath = getAbsoluteImagePath(rawSrcPath, filePath);

    if (srcPath.split('.').pop().toLocaleLowerCase() !== 'gif') {
      if (processedImagesSrc.includes(srcPath) == false) {
        resizeImage(
          srcPath,
          { sizes, output },

          function (sources) {
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

            callback(imgsToReplaceWithPictures, fileContents, filePath);
          }
        );
      }
    }
  });
}

function getAbsoluteImagePath(srcPath, filePath) {
  let finalImagePath = srcPath;
  console.log(typeof srcPath);

  let firstCharacter = srcPath.charAt(0);

  console.log({ firstCharacter }, { srcPath });

  let imagePathIsRelative = true;
  if (firstCharacter === '/') {
    imagePathIsRelative = false;
  }

  console.log({ imagePathIsRelative });

  if (imagePathIsRelative) {
  }

  return finalImagePath;
}
