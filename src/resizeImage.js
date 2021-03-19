const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const formatNewFileName = require('./formatFileName');

const logMessage = require('./logMessage');
const logImageResize = false;

module.exports = function (imagePath) {
  return new Promise((resolve, reject) => {
    sizes.forEach((size) => {
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
        if (!fs.existsSync(newImagePath)) {
          logMessage(logImageResize, { imagePath });
          logMessage(logImageResize, { newImagePath });
          sharp(imagePath)
            .resize(sharpOptions)
            .toFile(newImagePath)
            .then((info) => {
              logMessage(logImageResize, `image resized: ${newImagePath}`, {
                info,
              });
              resolve();
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
  });
};
