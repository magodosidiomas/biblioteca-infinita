const fs = require('fs');
const path = require('path');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const images = getAllFiles('Notion exports/extracted_new').filter(f => /\.(png|jpe?g|webp)$/i.test(f));
console.log('Total images in new export:', images.length);
images.slice(0, 10).forEach(img => console.log(img));
