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

const mdFiles = getAllFiles('Notion exports/extracted_new/Languageflix v 1 0 1/English/(EN) Conteúdo').filter(f => f.endsWith('.md'));
console.log('English content markdown count:', mdFiles.length);
if (mdFiles.length > 0) {
  console.log('Sample md file:', mdFiles[0]);
  console.log(fs.readFileSync(mdFiles[0], 'utf8'));
}
