const logMessage = require('./logMessage');

const logFormatName = false;

module.exports = function (imagePath, size) {
  logMessage(logFormatName, `Start formatNewFileName: ${imagePath}`);
  imagePath = imagePath.replace(/"/g, '');

  logMessage(logFormatName, { imagePath });

  if (imagePath.length !== 0) {
    let imagePathChunks = imagePath.split('.');

    logMessage(logFormatName, { imagePathChunks });

    let imagePathStart = imagePathChunks[0];

    logMessage(logFormatName, { imagePathStart });

    for (let i = 1; i < imagePathChunks.length - 1; i++) {
      imagePathStart = `${imagePathStart}.${imagePathChunks[i]}`;
    }

    let sizesText = `-${size.img.height ? size.img.height + 'h' : ''}${
      size.img.height && size.img.height ? 'x' : ''
    }${size.img.width ? size.img.width + 'w' : ''}.`;

    logMessage(logFormatName, { sizesText });

    const finalImagePath = `${imagePathStart}-resized-${sizesText}${
      imagePathChunks[imagePathChunks.length - 1].toLowerCase() === 'gif'
        ? 'gif'
        : 'webp'
    }`;

    logMessage(logFormatName, 'END formatNewFileName', { finalImagePath });

    return finalImagePath;
  } else {
    logMessage(logFormatName, 'Original Image path empty');
  }
};
