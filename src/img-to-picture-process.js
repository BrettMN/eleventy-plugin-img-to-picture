const sharp = require('sharp');

const fs = require('fs');
const path = require('path');

const cheerio = require('cheerio');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const logImageResize = false;
const logFormatName = false;
const logReplaceImgsWithPictures = false;

// const sizes = [
//   { screen: { max: 639 }, img: { width: 620 } },
//   { screen: { min: 640, max: 767 }, img: { width: 620 } },
//   { screen: { min: 768, max: 1023 }, img: { width: 750 } },
//   { screen: { min: 1024, max: 1279 }, img: { width: 1000 } },
//   { screen: { min: 1280 }, img: { width: 1260 } },
// ];

// const logMessage = function (shouldLog, ...messages) {
//   if (shouldLog) {
//     console.log(...messages);
//   }
// };

// const formatNewFileName = function (imagePath, size) {
//   logMessage(logFormatName, `Start formatNewFileName: ${imagePath}`);
//   imagePath = imagePath.replace(/"/g, '');

//   logMessage(logFormatName, { imagePath });

//   if (imagePath.length !== 0) {
//     let imagePathChunks = imagePath.split('.');

//     logMessage(logFormatName, { imagePathChunks });

//     let imagePathStart = imagePathChunks[0];

//     logMessage(logFormatName, { imagePathStart });

//     for (let i = 1; i < imagePathChunks.length - 1; i++) {
//       imagePathStart = `${imagePathStart}.${imagePathChunks[i]}`;
//     }

//     let sizesText = `-${size.img.height ? size.img.height + 'h' : ''}${
//       size.img.height && size.img.height ? 'x' : ''
//     }${size.img.width ? size.img.width + 'w' : ''}.`;

//     logMessage(logFormatName, { sizesText });

//     const finalImagePath = `${imagePathStart}-resized-${sizesText}${
//       imagePathChunks[imagePathChunks.length - 1].toLowerCase() === 'gif'
//         ? 'gif'
//         : 'webp'
//     }`;

//     logMessage(logFormatName, 'END formatNewFileName', { finalImagePath });

//     return finalImagePath;
//   } else {
//     logMessage(logFormatName, 'Original Image path empty');
//   }
// };

// const resizeImage = function (imagePath) {
//   return new Promise((resolve, reject) => {
//     sizes.forEach((size) => {
//       let newImagePath = formatNewFileName(imagePath, size);

//       let sharpOptions = {
//         withoutEnlargement: true,
//       };

//       if (size.img.width) {
//         sharpOptions.width = size.img.width;
//       }
//       if (size.img.height) {
//         sharpOptions.height = size.img.height;
//       }

//       try {
//         if (!fs.existsSync(newImagePath)) {
//           logMessage(logImageResize, { imagePath });
//           logMessage(logImageResize, { newImagePath });
//           sharp(imagePath)
//             .resize(sharpOptions)
//             .toFile(newImagePath)
//             .then((info) => {
//               logMessage(logImageResize, `image resized: ${newImagePath}`, {
//                 info,
//               });
//               resolve();
//             })
//             .catch((err) => {
//               console.error(`image resize failed: ${newImagePath}`);
//               console.error({ err });
//               reject(err);
//             });
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     });
//   });
// };

// const getAllFiles = function (dirPath, arrayOfFiles) {
//   // let dirName = __dirname.replace('/scripts', '');

//   let files = fs.readdirSync(dirPath);

//   arrayOfFiles = arrayOfFiles || [];

//   files.forEach(function (file) {
//     if (fs.statSync(dirPath + '/' + file).isDirectory()) {
//       arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
//     } else {
//       arrayOfFiles.push(path.join(dirPath, '/', file));
//     }
//   });

//   return arrayOfFiles;
// };

function replaceImgsWithPictures(filePath) {
  logMessage(logReplaceImgsWithPictures, { filePath });

  let fileContents = fs.readFileSync(filePath, 'utf8');

  let pictureElement = '';

  let updatedContent = '';

  let dom = new JSDOM(fileContents, { includeNodeLocations: true });

  const document = dom.window.document;
  const imgElements = document.querySelectorAll('img');

  logMessage(logReplaceImgsWithPictures, { imgElements });

  logMessage(logReplaceImgsWithPictures, imgElements.length);
  let processedImagesSrc = [];

  imgElements.forEach((img) => {
    let location = dom.nodeLocation(img);

    logMessage(logReplaceImgsWithPictures, { location });

    let imgString = fileContents.slice(
      location.startOffset,
      location.endOffset
    );

    logMessage(logReplaceImgsWithPictures, { imgString });

    let srcPathLocation = location.attrs.src;

    logMessage(logReplaceImgsWithPictures, { srcPathLocation });

    let srcPath = fileContents
      .slice(srcPathLocation.startOffset, srcPathLocation.endOffset)
      .slice(4); //remove src=

    logMessage(logReplaceImgsWithPictures, { srcPath });

    if (processedImagesSrc.includes(srcPath) == false) {
      let newPaths = [];
      sizes.forEach((size) => {
        newPaths.push({
          path: formatNewFileName(srcPath, size),
          size: size,
        });
      });
      let sources = [];
      newPaths.forEach((path) => {
        sources.push(
          `<source srcset="${path.path}" media="(${
            path.size.max
              ? 'max-width: ' + path.size.max + 'px'
              : 'min-width: ' + path.size.min + 'px'
          })">`
        );
      });
      pictureElement = `
    <picture>
      ${sources.join('')}
      ${imgString}
    </picture>
    `;
      logMessage(logReplaceImgsWithPictures, { pictureElement });

      fileContents = fileContents.replace(imgString, pictureElement);

      processedImagesSrc.push(srcPath);
      fs.writeFileSync(filePath, fileContents);
    }
  });

  logMessage(
    logReplaceImgsWithPictures,
    `file ${filePath} changed? ${fileContents !== updatedContent}`
  );
}

let testPath = 'dist/logos/lunch-n-learn.png';

let pathToPost = 'dist/around-the-web-20200724/index.html';

// resizeImage(
//   '/Users/brett/workspace/wipdeveloper.com/dist/posts/2019/09/images/LWC-Render-List-of-Objects.png'
// );
// resizeImage(testPath);

// replaceImgsWithPictures(pathToPost);

// run();

function run() {
  let currentRunStats = { htmlFilesProcessed: 0, imagesProcessed: 0 };

  logMessage(true, 'starting image to pictures Run', { currentRunStats });
  let filesResults = getAllFiles('dist');

  filesResults.forEach((file) => {
    if (file.includes('.html')) {
      // replaceImgsWithPictures(file);
      // currentRunStats.htmlFilesProcessed++;
      // logMessage(true, { currentRunStats });
    } else if (
      file.includes('.png') ||
      file.includes('.gif') ||
      file.includes('.jpg') ||
      file.includes('.jpeg') ||
      file.includes('.bmp')
    ) {
      if (
        file.indexOf('dist/windows') === -1 &&
        file.indexOf('dist/ios') === -1 &&
        file.indexOf('dist/android') === -1 &&
        file.indexOf('dist/chrome') === -1 &&
        file.indexOf('dist/firefox') === -1 &&
        file.indexOf('mstile-') === -1 &&
        file.indexOf('favicon-') === -1 &&
        file.indexOf('apple-touch-icon-') === -1 &&
        file.indexOf('android-chrome-') === -1 &&
        file.indexOf('-resized-') === -1
      ) {
        resizeImage(file).then(() => {
          currentRunStats.imagesProcessed++;
          logMessage(true, { currentRunStats });
        });
      }
    }
  });

  logMessage(true, 'finishing image to pictures Run');
}

run();
