const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const formatNewFileName = require('./formatFileName');

const logMessage = require('./logMessage');
const logImageResize = false;

function log(...things) {
  logMessage(logImageResize, ...things);
}

module.exports = function (imagePath, { sizes, output }, callback) {
  console.info('Order: 5');

  let sources = [];

  log({ sizes });
  sizes.forEach((size) => {
    console.info('Order: 6');
    let newImagePath = formatNewFileName(imagePath, size);

    let sharpOptions = {
      withoutEnlargement: true,
    };

    if (size.img.width) {
      sharpOptions.width = size.img.width;
    }
    if (size.img.height) {
      sharpOptions.height = size.img.height;
    }

    try {
      if (!fs.existsSync(`${output}/${newImagePath}`)) {
        log({ imagePath });
        log({ newImagePath });
        console.info('Order: 6.1');

        sharp(`${output}/${imagePath}`)
          .resize(sharpOptions)
          .toFile(`${output}/${newImagePath}`)
          .then(function (info) {
            console.info('Order: 6.2');

            log(`image resized: ${newImagePath}`, {
              info,
            });

            console.info('Order: 7');
            sources.push(
              `<source srcset="${newImagePath}" width="${info.width}" height="${
                info.height
              }" media="(${
                size.screen.min ? 'min-width: ' + size.screen.min + 'px' : ''
              }${size.screen.max && size.screen.min ? ') and (' : ''}${
                size.screen.max ? 'max-width: ' + size.screen.max + 'px' : ''
              })" type="image/${info.format}">`
            );

            if (sources.length === sizes.length) {
              console.info('Order: 8');
              log('before resolve');
              callback(sources);
            }
          })
          .catch((err) => {
            console.error(`image resize failed: ${newImagePath}`);
            console.error({ err });
            reject(err);
          });
      }
    } catch (err) {
      console.error(err);
    }
  });

  // console.info('Order: 8');
  // log('before resolve', { sources });
  // callback(sources);
};
