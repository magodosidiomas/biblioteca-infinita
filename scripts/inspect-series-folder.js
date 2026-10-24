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

const seriesFiles = getAllFiles('Notion exports/extracted_new/Languageflix v 1 0 1/All the Series');
console.log('Series files/folders:');
seriesFiles.forEach(f => console.log(f));

// Read sample md
const mds = seriesFiles.filter(f => f.endsWith('.md'));
if (mds.length > 0) {
  console.log('\nSample md file:', mds[0]);
  console.log(fs.readFileSync(mds[0], 'utf8'));
}
