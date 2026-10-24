const fs = require('fs');

const content = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const fr = content['french'];

// 1. YouTube Clean up
// Merge duplicates & fill tags
const ytCleaned = [];
const seenYt = new Map();

fr.YouTube.forEach(item => {
  let name = item.name.trim();
  const key = name.toLowerCase();

  // If already exists, merge tags and keep richest item
  if (seenYt.has(key)) {
    const existing = seenYt.get(key);
    const combinedTags = Array.from(new Set([...(existing.tags || []), ...(item.tags || [])]));
    existing.tags = combinedTags;
    return;
  }

  // Specific tag improvements for untagged / poorly tagged items
  if (name === 'The French R... or French Rs?') {
    item.name = 'The French R (Pronunciation Guide)';
    item.tags = ['Pronúncia', 'Linguística'];
  } else if (name === 'French Sounds') {
    item.tags = ['Pronúncia', 'Professor de Idiomas'];
  } else if (name === 'Français Authentique') {
    item.tags = ['Professor de Idiomas', 'Desenvolvimento Pessoal'];
  } else if (name === 'Home Language') {
    item.tags = ['Professor de Idiomas', 'Gramática'];
  } else if (name === 'La Français par la Methode Nature') {
    item.name = 'Le Français par la Méthode Nature';
    item.tags = ['Cursos de Idiomas', 'Compreensão Oral'];
  } else if (name === 'Wandering French') {
    item.tags = ['Francês Canadense', 'Pronúncia', 'Professor de Idiomas'];
  } else if (name === 'Innerfrench') {
    item.tags = ['Compreensão Oral', 'Cultura', 'Podcast'];
  }

  seenYt.set(key, item);
  ytCleaned.push(item);
});

// 2. Podcasts Clean up
fr.Podcasts.forEach(p => {
  if (p.name === 'One Thing in A French Day') {
    p.tags = ['Cultura', 'Cotidiano'];
  }
});

// 3. Sites Clean up
fr.Sites.forEach(s => {
  let name = s.name.trim();
  if (name === 'Apprendre Le Français TV5MONDE') {
    s.tags = ['Exercícios', 'Cursos de Idiomas', 'Notícias'];
  } else if (name === 'Duolingo Stories') {
    s.tags = ['Leitura Interativa', 'Iniciante'];
  } else if (name === 'Reddit /francais') {
    s.tags = ['Comunidade', 'Discussões'];
  } else if (name === 'Learn French') {
    s.name = 'Reddit /r/learnfrench';
    s.tags = ['Comunidade', 'Dúvidas & Dicas'];
  } else if (name === 'Daily Newsletter - News in French') {
    s.name = 'News in French (Newsletter)';
    s.tags = ['Newsletter', 'Notícias'];
  } else if (name === 'Français de nos regions') {
    s.name = 'Français de nos Régions';
    s.tags = ['Linguística', 'Dialetos & Sotaques'];
  }
});

// 4. Séries Clean up
const seriesCleaned = [];
const seenSeries = new Set();

fr.Séries.forEach(item => {
  let name = item.name.trim();
  name = name.replace(/\s*–\s*Netflix$/i, '');
  name = name.replace(/\s*-\s*Netflix$/i, '');
  if (name === 'Criminal: Deutschland') name = 'Criminal Deutschland';

  const key = name.toLowerCase();
  if (seenSeries.has(key)) return;
  seenSeries.add(key);

  item.name = name;
  item.desc = `${name} disponível na Netflix com áudio e legendas em francês.`;
  seriesCleaned.push(item);
});

content['french'].YouTube = ytCleaned;
content['french'].Séries = seriesCleaned;

fs.writeFileSync('app/src/data/content.json', JSON.stringify(content, null, 2), 'utf8');

console.log('--- RELATÓRIO PÓS-LIMPEZA FRANCÊS ---');
console.log('YouTube count:', ytCleaned.length);
console.log('Séries count:', seriesCleaned.length);
console.log('Podcasts count:', content['french'].Podcasts.length);
console.log('Sites count:', content['french'].Sites.length);

const stillUntaggedYt = ytCleaned.filter(i => !i.tags || i.tags.length === 0);
const stillUntaggedSites = content['french'].Sites.filter(i => !i.tags || i.tags.length === 0);
const stillUntaggedPodcasts = content['french'].Podcasts.filter(i => !i.tags || i.tags.length === 0);

console.log('Untagged YouTube:', stillUntaggedYt.length);
console.log('Untagged Podcasts:', stillUntaggedPodcasts.length);
console.log('Untagged Sites:', stillUntaggedSites.length);
