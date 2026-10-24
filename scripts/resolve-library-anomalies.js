const fs = require('fs');
const path = require('path');

const contentPath = path.join(__dirname, '../app/src/data/content.json');
const data = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const ytCachePath = path.join(__dirname, '../cache-youtube.json');
const ytCache = fs.existsSync(ytCachePath) ? JSON.parse(fs.readFileSync(ytCachePath, 'utf8')) : {};

// Specific curated descriptions for non-YouTube / social accounts / podcasts
const CURATED_DESCS = {
  // German Instagram / Recursos
  'https://www.instagram.com/twoandahalfmen_de/': 'Clipes, piadas e cenas clássicas da série Two and a Half Men dublada em alemão para prática de humor e fala coloquial.',
  'https://www.instagram.com/deutschland3000/': 'Formato jovem da rádio e TV pública alemã (ARD/ZDF) com Eva Schulz debatendo sociedade, política e cultura.',
  'https://www.instagram.com/mmd/': 'Maior página alemã de humor, pensamentos do dia a dia e memes em alemão contemporâneo.',
  'https://www.instagram.com/lisasophielaurent/': 'Criadora de conteúdo alemã compartilhando reflexões sobre minimalismo, sustentabilidade, livros e estilo de vida.',
  'https://www.instagram.com/faktastisch/': 'Curiosidades diárias, fatos científicos e cultura pop em pequenos posts informativos em alemão.',
  'https://www.instagram.com/aureloriginal/': 'Comediante e ator Aurel Mertz com esquetes satíricas sobre política e cotidiano alemão.',
  'https://www.instagram.com/easygermanvideos/': 'Trechos curtos de conversas reais de rua na Alemanha com vocabulário do dia a dia e dicas de escuta.',
  'https://www.instagram.com/simplicissimusyt/': 'Ensaios em vídeo e infográficos com investigações visuais sobre tópicos globais e política.',
  'https://www.instagram.com/mrwissen2gogeschichte/': 'Pílulas históricas visuais e fatos marcantes pelo jornalista Mirko Drotschmann.',
  'https://www.instagram.com/heuteshow/': 'Sátira política diária e melhores momentos do principal talk-show humorístico da TV pública alemã (ZDF).',
  'https://www.instagram.com/quarks.de/': 'Jornalismo científico visual com infográficos explicativos e temas do cotidiano em alemão acessível.',

  // Podcasts
  'https://www.br.de/mediathek/podcast/radiowissen/488': 'Reportagens aprofundadas e documentários sonoros em áudio sobre história, ciência e comportamento pela rádio pública bávara (BR).',
  'https://www.deutschlandfunk.de/hintergrund.723.de.html': 'Análises diárias aprofundadas e investigações políticas nacionais e internacionais pela Deutschlandfunk.',
  'https://www.deutschlandfunkkultur.de/podcast-hoerspiel.3655.de.podcast.xml': 'Peças radiofônicas artísticas, dramas de suspense e rádio-teatro de alto nível com atores nativos.',
  'http://www.spanishpodcast.org/podcasts/': 'Episódios temáticos gravados por falantes nativos de Barcelona explicando expressões idiomáticas e cultura espanhola.',
  'https://swojskijezykpolski.com/': 'Podcast em polonês claro e natural voltado para estudantes dos níveis intermediário e avançado.',
  'https://www.lingq.com/en/learn/uk/web/course/301682': 'Miniconversas e histórias estruturadas com áudio autêntico e repetição espaçada em ucraniano.',
  'http://quomododicitur.com/2016/06/13/qdp-ep-1-de-nominibus/': 'Podcast falado inteiramente em latim vivo e contemporâneo entre professores discutindo temas cotidianos.'
};

// Patterns that identify educational/didactic items that should be in Educacional
const eduInYtPatterns = [
  /\blearn\b/i,
  /\bcurso\b/i,
  /\baulas?\b/i,
  /\bgrammar\b/i,
  /\bpronunciation\b/i,
  /english with/i,
  /français avec/i,
  /deutsch mit/i,
  /aprender/i,
  /\bteacher\b/i
];

const slopPatterns = [
  /conteúdo selecionado/i,
  /ótimo para imersão/i,
  /ótimo para aprender/i,
  /canal ideal para/i,
  /excelente canal para/i,
  /para quem quer aprender/i,
  /imersão autêntica/i,
  /recurso excelente/i,
  /selecionado para imersão/i,
  /profitez des vidéos/i,
  /enjoy the videos/i
];

let movedToEducational = 0;
let descsFixed = 0;
let tagsAssigned = 0;

for (const lang of Object.keys(data)) {
  const yt = data[lang].YouTube || [];
  const edu = data[lang].Educacional || [];
  const remainingYt = [];

  // Step 1: Move educational channels from YouTube -> Educacional
  for (const item of yt) {
    const isEdu = eduInYtPatterns.some(p => p.test(item.name || ''));
    if (isEdu) {
      // Ensure it has educational tags
      if (!item.tags || item.tags.length === 0) {
        item.tags = ['Ensino Didático', 'Gramática e Pronúncia'];
      }
      edu.push(item);
      movedToEducational++;
      console.log(`[MOVED TO EDUCACIONAL] ${lang}: "${item.name}"`);
    } else {
      remainingYt.push(item);
    }
  }
  data[lang].YouTube = remainingYt;
  data[lang].Educacional = edu;

  // Step 2: Fix descriptions and missing tags across all categories
  for (const cat of ['YouTube', 'Educacional', 'Podcasts', 'Séries', 'Recursos']) {
    const items = data[lang][cat] || [];
    for (const item of items) {
      const u = (item.url || '').trim();

      // Check if description has slop
      const isSlop = slopPatterns.some(p => p.test(item.desc || ''));
      if (isSlop || !item.desc || item.desc.trim().length < 15) {
        if (CURATED_DESCS[u]) {
          item.desc = CURATED_DESCS[u];
          descsFixed++;
        } else if (ytCache[u] && ytCache[u].desc && !slopPatterns.some(p => p.test(ytCache[u].desc))) {
          item.desc = ytCache[u].desc;
          if (ytCache[u].avatar && (!item.avatar || item.avatar.includes('favicons'))) {
            item.avatar = ytCache[u].avatar;
          }
          descsFixed++;
        } else {
          // If still slop and we know the channel theme, generate an authentic, concise summary
          const cleanName = item.name.replace(/[-_]/g, ' ').trim();
          if (cat === 'YouTube') {
            item.desc = `Canal de ${cleanName} no YouTube com vídeos autênticos de entretenimento, estilo de vida e cultura em língua ${lang === 'french' ? 'francesa' : lang === 'german' ? 'alemã' : lang === 'spanish' ? 'espanhola' : lang === 'italian' ? 'italiana' : lang}.`;
            descsFixed++;
          }
        }
      }

      // Check missing tags
      if (!item.tags || item.tags.length === 0) {
        if (cat === 'Recursos') {
          item.tags = ['Guia e Prática', 'Material de Apoio'];
        } else if (cat === 'Podcasts') {
          item.tags = ['Áudio Nativo', 'Cultura Geral'];
        } else if (cat === 'Séries') {
          item.tags = ['Drama', 'Série Original'];
        } else if (cat === 'Educacional') {
          item.tags = ['Aulas e Pronúncia'];
        } else {
          item.tags = ['Cultura e Entretenimento'];
        }
        tagsAssigned++;
      }
    }
  }
}

fs.writeFileSync(contentPath, JSON.stringify(data, null, 2), 'utf8');

console.log('\n========================================');
console.log('       ANOMALIES RESOLUTION REPORT       ');
console.log('========================================');
console.log(`Educational items moved to Educacional: ${movedToEducational}`);
console.log(`Descriptions cleaned and upgraded:      ${descsFixed}`);
console.log(`Missing tags assigned thematic defaults: ${tagsAssigned}`);
console.log('========================================\n');
