const fs = require('fs');
const path = require('path');

const dir = path.join('Notion exports', '8359241f-1ec6-45cc-993d-d568d3f729a6_ExportBlock-3a087e5c-b298-49b8-afca-ef136db63605');
const files = fs.readdirSync(dir);
const csvFile = files.find(f => f.includes('Banco de dados') && f.endsWith('.csv'));
const content = fs.readFileSync(path.join(dir, csvFile), 'utf-8');

const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
const ruChannels = [];
const frChannels = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.includes('youtube.com')) continue;
  
  const match = line.match(/(https?:\/\/[^\s,"]+)/);
  const url = match ? match[1].trim() : '';
  
  let name = '';
  if (line.startsWith('"')) {
    const end = line.indexOf('"', 1);
    name = line.substring(1, end);
  } else {
    name = line.split(',')[0];
  }

  if (line.includes('Russo')) {
    ruChannels.push({ name: name.trim(), url, lang: 'Russo' });
  } else if (line.includes('Francês')) {
    frChannels.push({ name: name.trim(), url, lang: 'Francês' });
  }
}

console.log(`Canais Russos no Notion: ${ruChannels.length}`);
ruChannels.forEach(c => console.log('RU:', c.name, '->', c.url));

console.log(`\nCanais Franceses no Notion: ${frChannels.length}`);
frChannels.forEach(c => console.log('FR:', c.name, '->', c.url));
