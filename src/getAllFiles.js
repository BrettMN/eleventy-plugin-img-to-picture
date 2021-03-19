const fs = require('fs');
const path = require('path');

module.exports = getAllFiles;

function getAllFiles(dirPath, arrayOfFiles, extensions = []) {
  // let dirName = __dirname.replace('/scripts', '');

  let files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + '/' + file).isDirectory()) {
      arrayOfFiles = getAllFiles(
        dirPath + '/' + file,
        arrayOfFiles,
        extensions
      );
    } else {
      console.log({ file });
      if (extensions.filter((f) => file.split('.').pop() === f).length > 0) {
        console.log('found one');
        arrayOfFiles.push(path.join(dirPath, '/', file));
      }
    }
  });

  return arrayOfFiles;
}
