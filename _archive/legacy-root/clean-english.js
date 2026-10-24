const fs = require('fs');

const content = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const en = content['english'];

// 1. YouTube Clean up
const ytCleaned = [];
const seenNames = new Set();

en.YouTube.forEach(item => {
  let name = item.name.trim();
  name = name.replace(/\s*-\s*YouTube\s*-\s*.*/i, '');
  name = name.replace(/\s*-\s*YouTube\s*-$/i, '');
  name = name.replace(/\s*-\s*French History$/i, '');
  
  if (name.toLowerCase() === 'better ideas' && seenNames.has('better ideas')) return;
  seenNames.add(name.toLowerCase());

  item.name = name;

  // Specific tag improvements
  if (name === 'Ali Abdaal') {
    item.tags = ['Desenvolvimento Pessoal', 'Produtividade'];
  } else if (name === 'Adam Neely') {
    item.tags = ['Música', 'Educação'];
  } else if (name === 'Linguamarina') {
    item.tags = ['Aprendizado de Idiomas', 'Desenvolvimento Pessoal'];
  } else if (name === 'Effortless English') {
    item.tags = ['Professor de Idiomas', 'Aprendizado de Idiomas'];
  } else if (name === 'Thomas Frank') {
    item.tags = ['Desenvolvimento Pessoal', 'Produtividade'];
  } else if (name === 'Better ideas' || name === 'Better Ideas') {
    item.tags = ['Desenvolvimento Pessoal', 'Criatividade'];
  } else if (name === 'Marques Brownlee') {
    item.tags = ['Tecnologia', 'Reviews'];
    item.desc = 'Vídeos com análises detalhadas, tecnologia de ponta e novidades sobre os principais lançamentos de smartphones e gadgets.';
  } else if (name === 'Brandon Sanderson Full Writing Course') {
    item.name = 'Brandon Sanderson - Writing Course';
    item.tags = ['Literatura', 'Escrita Criativa'];
    item.desc = 'Aulas completas de escrita criativa e ficção ministradas pelo autor de fantasia best-seller Brandon Sanderson na BYU.';
  } else if (name === 'This is Barris!') {
    item.tags = ['História', 'Cultura'];
    item.desc = 'Vídeos fascinantes explorando a história, culinária e curiosidades culturais da França e da Europa.';
  } else if (name === 'Polyglossa') {
    item.tags = ['Aprendizado de Idiomas', 'Compreensão Oral'];
  } else if (name === 'R.C. Waldun') {
    item.tags = ['Literatura', 'Filosofia', 'Vlog'];
  }

  // Handle podcast-like resources
  if (name === 'Aussie English') item.tags = ['Aprendizado de Idiomas', 'Pronúncia'];
  if (name === 'Elllo - Conversations') item.tags = ['Aprendizado de Idiomas', 'Diálogos'];
  if (name === "Luke's English Podcast") item.tags = ['Aprendizado de Idiomas', 'Humor'];
  if (name === 'Better at English') item.tags = ['Aprendizado de Idiomas', 'Conversação'];
  if (name === 'English in 10 Minutes') item.tags = ['Aprendizado de Idiomas', 'Viagens'];
  if (name === 'Feel Good English') item.tags = ['Aprendizado de Idiomas', 'Desenvolvimento Pessoal'];

  ytCleaned.push(item);
});

// 2. Séries Clean up
const seriesCleaned = [];
const seenSeries = new Set();

en.Séries.forEach(item => {
  let name = item.name.trim();
  name = name.replace(/\s*–\s*Netflix$/i, '');
  name = name.replace(/\s*-\s*Netflix$/i, '');
  if (name === 'Criminal: Deutschland') name = 'Criminal Deutschland';

  const key = name.toLowerCase();
  if (seenSeries.has(key)) return;
  seenSeries.add(key);

  item.name = name;
  item.desc = `${name} disponível na Netflix com áudio e legendas em inglês.`;

  seriesCleaned.push(item);
});

// 3. Podcasts Clean up
en.Podcasts.forEach(p => {
  if (p.name === 'Freakonomics') p.tags = ['Economia', 'Curiosidades'];
  if (p.name === 'The Tim Ferris Show') p.tags = ['Desenvolvimento Pessoal', 'Entrevistas'];
  if (p.name === 'Stuff you missed in history class') p.tags = ['História', 'Curiosidades'];
  if (p.name === 'Planet Money') p.tags = ['Economia', 'Sociedade'];
});

content['english'].YouTube = ytCleaned;
content['english'].Séries = seriesCleaned;

fs.writeFileSync('app/src/data/content.json', JSON.stringify(content, null, 2), 'utf8');

console.log('--- RELATÓRIO PÓS-LIMPEZA INGLÊS ---');
console.log('YouTube count:', ytCleaned.length);
console.log('Séries count:', seriesCleaned.length);
console.log('Podcasts count:', content['english'].Podcasts.length);

const stillUntagged = ytCleaned.filter(i => !i.tags || i.tags.length === 0);
console.log('Itens de YouTube ainda sem tag:', stillUntagged.length);
