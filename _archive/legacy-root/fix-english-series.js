const fs = require('fs');

const data = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const en = data['english'];

const nativeEnSeries = new Set([
  'Modern Family',
  'Carmen Sandiego',
  'Explained: Our Brain/Mind',
  'Jurassic World: New Adventures',
  'Ursos Sem Curso',
  'Disenchantment',
  'DC Titans',
  'Cobra Kai',
  'Warrior Nun',
  'The Queen\'s Gambit',
  'Umbrella Academy',
  'Atypical',
  'Star Trek Discovery',
  'Avatar: The Legend of Korra',
  'Community',
  'Avatar: The Legend of Aang',
  'The Good Place',
  'Lost in Space',
  'Spongebob Squarepants',
  'Star Trek: Deep Space Nine',
  'Rick and Morty',
  'Breaking Bad',
  'Stranger Things',
  'Trollhunters: Tales of Arcadia',
  'Wizards - Tales from Arcadia',
  '3 Below: Tales from Arcadia',
  'Brooklyn Nine-Nine',
  'The Crown',
  'Peaky Blinders',
  'Sherlock Holmes BBC'
]);

const cleanedSeries = [];
en.Séries.forEach(s => {
  let name = s.name.trim();
  if (name.includes('Trolljäger')) name = 'Trollhunters: Tales of Arcadia';
  if (name === 'Ursos Sem Curso') name = 'We Bare Bears';

  if (nativeEnSeries.has(name) || nativeEnSeries.has(s.name)) {
    s.name = name;
    s.tags = Array.from(new Set(['Áudio Original', ...(s.tags || []).filter(t => t !== 'Dublado')]));
    s.desc = `${name} é uma produção original em inglês (Netflix), com áudio autêntico e fala natural para imersão.`;
    cleanedSeries.push(s);
  }
});

en.Séries = cleanedSeries;
fs.writeFileSync('app/src/data/content.json', JSON.stringify(data, null, 2), 'utf8');

console.log('Total Séries nativas em inglês:', en.Séries.length);
en.Séries.forEach((s, idx) => console.log(`${idx + 1}. [${s.name}] | Tags: [${s.tags.join(', ')}]`));
