const fs = require('fs');

const data = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const en = data.english;

console.log('--- ANTES ---');
console.log('YouTube count:', en.YouTube.length);
console.log('Educacional count:', en.Educacional.length);

const lucyAvatar = 'https://yt3.googleusercontent.com/ytc/AIdro_nZnUEKXrbewVcDQSSWIa1xPXjUZCwNF-b8Hz2CsybaZU4=s900-c-k-c0x00ffffff-no-rj';

const newEducacional = [];
const toMoveToYouTube = [];

for (const item of en.Educacional) {
  // Update Lucy icon
  if (item.id === 'english_with_lucy' || item.name.toLowerCase().includes('lucy')) {
    item.avatar = lucyAvatar;
  }

  const isBrandon = item.id.includes('brandon') || item.name.toLowerCase().includes('sanderson');
  const hasProf = item.tags && item.tags.includes('Professor de Idiomas');
  const hasAprendizado = item.tags && item.tags.includes('Aprendizado de Idiomas');

  // Rules:
  // - brandon sanderson -> volta pro main (YouTube)
  // - ingles: aprendizado de idiomas nao vai pro educacional, apenas "professor de idiomas"
  // - qualquer um d aprendizado de idiomas volta pro main (YouTube)
  if (isBrandon) {
    toMoveToYouTube.push(item);
  } else if (hasAprendizado) {
    // If it has "Aprendizado de Idiomas" (like polyglots, or Effortless English), moves to main YouTube
    toMoveToYouTube.push(item);
  } else if (hasProf) {
    // Only "Professor de Idiomas" stays in Educacional
    newEducacional.push(item);
  } else {
    // Anything else without Professor de Idiomas (e.g. English by The Nature Method) goes to main YouTube
    toMoveToYouTube.push(item);
  }
}

console.log('\n--- ITENS MANTIDOS NO EDUCACIONAL (' + newEducacional.length + ') ---');
newEducacional.forEach(i => console.log('  [Educacional]:', i.name, '| tags:', i.tags));

console.log('\n--- ITENS MOVIDOS PARA YOUTUBE (' + toMoveToYouTube.length + ') ---');
toMoveToYouTube.forEach(i => console.log('  [YouTube]:', i.name, '| tags:', i.tags));

// Append to YouTube
en.Educacional = newEducacional;
en.YouTube = en.YouTube.concat(toMoveToYouTube);

// Save updated data
fs.writeFileSync('app/src/data/content.json', JSON.stringify(data, null, 2), 'utf8');

console.log('\n--- DEPOIS ---');
console.log('YouTube count:', en.YouTube.length);
console.log('Educacional count:', en.Educacional.length);
