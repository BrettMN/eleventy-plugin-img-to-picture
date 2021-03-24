const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const formatNewFileName = require('./formatFileName');

const logMessage = require('./logMessage');
const logImageResize = false;

function log(...things) {
  logMessage(logImageResize, ...things);
}

module.exports = function (imagePath, { sizes, output }) {
  return new Promise(async (resolve, reject) => {
    let sources = [];

    log({ sizes });
    sizes.forEach(async (size) => {
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
          let info = await sharp(`${output}/${imagePath}`)
            .resize(sharpOptions)
            .toFile(`${output}/${newImagePath}`)
            .catch((err) => {
              console.error(`image resize failed: ${newImagePath}`);
              console.error({ err });
              reject(err);
            });

          log(`image resized: ${newImagePath}`, {
            info,
          });

          sources.push(
            `<source srcset="${newImagePath}" width="${info.width}" height="${
              info.height
            }" media="(${
              size.screen.min ? 'min-width: ' + size.screen.min + 'px' : ''
            }${size.screen.max && size.screen.min ? ') and (' : ''}${
              size.screen.max ? 'max-width: ' + size.screen.max + 'px' : ''
            })" type="image/${info.format}">`
          );

          if (sources.length == sizes.length) {
            log('before resolve', { sources });
            resolve(sources);
          }
        }
      } catch (err) {
        console.error(err);
      }
    });
    log('before resolve', { sources });
    // return sources;
  });
};
