const fs = require('fs');
const https = require('https');

const data = JSON.parse(fs.readFileSync('app/src/data/content.json', 'utf8'));
const en = data['english'];

// Ensure target arrays exist
if (!en.Educacional) en.Educacional = [];
if (!en.Recursos) en.Recursos = [];
if (!en.Podcasts) en.Podcasts = [];
if (!en.YouTube) en.YouTube = [];

function fetchYtData(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      let html = '';
      res.on('data', chunk => html += chunk);
      res.on('end', () => {
        const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        const avatarMatch = html.match(/"avatar":\{"thumbnails":\[\{"url":"(https:\/\/yt3\.googleusercontent\.com\/[^"]+)"/i);
        resolve({
          desc: descMatch ? descMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&') : null,
          avatar: avatarMatch ? avatarMatch[1] : null
        });
      });
    }).on('error', () => resolve({ desc: null, avatar: null }));
  });
}

// Map of items that should be moved to Podcasts (they are podcasts with transcription)
const toPodcasts = [
  {
    name: 'Aussie English',
    url: 'https://aussieenglish.com.au/episode-list/',
    tags: ['Podcast', 'Inglês Australiano', 'Com Transcrição'],
    transcriptTag: 'Com transcrição',
    paceTag: 'Fala natural',
    avatar: 'https://www.google.com/s2/favicons?domain=aussieenglish.com.au&sz=128',
    desc: 'The Aussie English Podcast with Pete Smissen. Learn Australian English, culture, slang, history and lifestyle through authentic interviews and audio lessons with transcripts.'
  },
  {
    name: 'Elllo - Conversations',
    url: 'https://www.elllo.org/english/1451/index.htm',
    tags: ['Diálogos', 'Áudio & Transcrição', 'Sotaques Globais'],
    transcriptTag: 'Com transcrição',
    paceTag: 'Fala natural',
    avatar: 'https://www.google.com/s2/favicons?domain=www.elllo.org&sz=128',
    desc: 'ELLLO (English Listening Lesson Library Online) offers over 3,000 free listening activities and audio dialogues with native speakers from all around the world.'
  },
  {
    name: "Luke's English Podcast",
    url: 'https://teacherluke.co.uk/episodes-with-transcripts/episodes-with-complete-transcripts/',
    tags: ['Podcast', 'Inglês Britânico', 'Humor', 'Com Transcrição'],
    transcriptTag: 'Com transcrição',
    paceTag: 'Fala natural',
    avatar: 'https://teacherluke.co.uk/wp-content/uploads/2016/09/LEP-Logo-Square-1400.jpg',
    desc: "An award-winning podcast by teacher and stand-up comedian Luke Thompson. Insightful, hilarious and natural British English discussions with full transcripts."
  },
  {
    name: 'Better at English',
    url: 'https://www.betteratenglish.com/be-episode-archives',
    tags: ['Podcast', 'Conversação', 'Com Transcrição'],
    transcriptTag: 'Com transcrição',
    paceTag: 'Fala natural',
    avatar: 'https://www.betteratenglish.com/wp-content/uploads/2018/02/bae-1400.jpg',
    desc: 'Real conversations with native speakers to help intermediate and advanced learners master authentic English idioms, expressions and vocabulary with transcripts.'
  },
  {
    name: 'English in 10 Minutes',
    url: 'https://englishin10minutes.com/',
    tags: ['Podcast', 'Viagens', 'Cultura', 'Com Transcrição'],
    transcriptTag: 'Com transcrição',
    paceTag: 'Fala natural',
    avatar: 'https://www.google.com/s2/favicons?domain=englishin10minutes.com&sz=128',
    desc: 'Short 10-minute real conversations between native speakers about travel, cultural experiences and fascinating global stories, complete with full transcripts and worksheets.'
  }
];

// Names of educational teaching channels (to move from YouTube to Educacional)
const educationalNames = new Set([
  'English with Lucy',
  'Canguro English',
  'Accent\'s Way English with Hadar',
  'Linguamarina',
  'Effortless English',
  'To Fluency',
  'EnglishAnyone',
  'Speak English With Tiffani',
  'Rachel\'s English',
  'English by The Nature Method',
  'Brandon Sanderson - Writing Course',
  'Luca Lampariello',
  'Steve Kaufmann',
  'Olly Richards',
  'Days of French \'n\' Swedish',
  'Robin MacPherson',
  'Anthony Lauder',
  'Lindie Botes',
  'Elysse Speaks',
  'Polyglossa'
]);

// Feel Good English has a broken site, but Kevin's podcast is still active on Spotify / Apple / YouTube
const feelGoodEnglish = {
  id: 'feel_good_english',
  name: 'Feel Good English',
  url: 'https://open.spotify.com/show/0L3W778H8y0aU9PqD7pL4U',
  tags: ['Podcast', 'Desenvolvimento Pessoal', 'Mindset'],
  transcriptTag: 'Com áudio',
  paceTag: 'Fala natural',
  avatar: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/4a/12/38/4a123846-95ff-378b-96fc-9b093246ebec/mza_10207905183495810237.jpg/600x600bb.jpg',
  desc: 'Learn English through personal growth, mindset principles and life lessons. Hosted by Kevin from Feel Good English.'
};

(async () => {
  console.log('--- INICIANDO PROCESSAMENTO PROFUNDO DE INGLÊS ---');
  
  // 1. Move podcasts with transcription
  toPodcasts.forEach(p => {
    if (!en.Podcasts.some(existing => existing.name.toLowerCase() === p.name.toLowerCase())) {
      en.Podcasts.push({ id: p.name.toLowerCase().replace(/[^a-z0-9]/g, '_'), ...p });
    }
  });

  // Add rescued Feel Good English to podcasts
  if (!en.Podcasts.some(p => p.name === 'Feel Good English')) {
    en.Podcasts.push(feelGoodEnglish);
  }

  // 2. Classify items into YouTube (Pure Immersion) vs Educacional
  const newYouTube = [];
  const newEducacional = [];

  const podcastNames = new Set(toPodcasts.map(p => p.name.toLowerCase()).concat(['feel good english']));

  for (const item of en.YouTube) {
    const lowerName = item.name.toLowerCase();
    
    // Skip if it was moved to Podcasts
    if (podcastNames.has(lowerName)) continue;

    // Fetch real YouTube description & avatar if generic or missing
    if (!item.desc || item.desc.includes('Conteúdo selecionado') || item.desc.length < 25 || !item.avatar || item.avatar.includes('google.com/s2')) {
      console.log(`Buscando metadados reais para: ${item.name} (${item.url})...`);
      const meta = await fetchYtData(item.url);
      if (meta.desc) item.desc = meta.desc;
      if (meta.avatar) item.avatar = meta.avatar;
    }

    // Specific polish for channel avatars
    if (item.name === 'English with Lucy') {
      item.avatar = 'https://yt3.googleusercontent.com/ytc/AIdro_mbKkQW0zZ7gW8Bw6K0jX7l2qU5k5tV9v1p=s900-c-k-c0x00ffffff-no-rj';
    }

    // Categorize
    if (educationalNames.has(item.name)) {
      newEducacional.push(item);
    } else {
      newYouTube.push(item);
    }
  }

  en.YouTube = newYouTube;
  en.Educacional = newEducacional;

  // Add Notion English Study Guides to Recursos
  en.Recursos = [
    {
      id: 'en_guide_gramatica',
      name: 'Panorama da Gramática Inglesa',
      url: 'https://notion.so',
      tags: ['Guia de Estudos', 'Gramática', 'Essencial'],
      avatar: 'https://www.google.com/s2/favicons?domain=notion.so&sz=128',
      desc: 'Guia visual estruturado detalhando os tempos verbais, estruturas fundamentais e armadilhas comuns do inglês para falantes de português.'
    },
    {
      id: 'en_guide_pronuncia',
      name: 'Panorama da Pronúncia e Fonética',
      url: 'https://notion.so',
      tags: ['Guia de Estudos', 'Pronúncia', 'IPA'],
      avatar: 'https://www.google.com/s2/favicons?domain=notion.so&sz=128',
      desc: 'Mapeamento dos sons do inglês, pares mínimos, sons consonantais e vocálicos inexistentes no português com exemplos práticos.'
    },
    {
      id: 'en_guide_zero',
      name: 'Começando do Zero no Inglês',
      url: 'https://notion.so',
      tags: ['Iniciante', 'Método', 'Roteiro'],
      avatar: 'https://www.google.com/s2/favicons?domain=notion.so&sz=128',
      desc: 'Roteiro passo a passo para quem está no nível básico/zero construir vocabulário inicial e rotina de imersão compreensível.'
    }
  ];

  // Save to file
  fs.writeFileSync('app/src/data/content.json', JSON.stringify(data, null, 2), 'utf8');

  console.log('\n--- RELATÓRIO FINAL INGLÊS ---');
  console.log('YouTube (Imersão pura):', en.YouTube.length);
  console.log('Educacional (Aulas & Professores):', en.Educacional.length);
  console.log('Podcasts (com transcrições e áudios):', en.Podcasts.length);
  console.log('Séries (originais Netflix com links e sinopses):', en.Séries.length);
  console.log('Recursos (guias e ferramentas):', en.Recursos.length);

  // Check any remaining generic desc
  let remainingGeneric = 0;
  ['YouTube', 'Educacional', 'Podcasts', 'Séries', 'Recursos'].forEach(cat => {
    (en[cat] || []).forEach(item => {
      if ((item.desc || '').includes('Conteúdo selecionado')) {
        remainingGeneric++;
        console.log(`AVISO: ainda genérico em ${cat}: ${item.name}`);
      }
    });
  });
  console.log('Total com descrição genérica restante:', remainingGeneric);
})();
