const fs = require('fs');
const path = require('path');

const contentPath = path.resolve(__dirname, '../app/src/data/content.json');
const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const scraped = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'italian-scraped.json'), 'utf8'));

// Correções de descrição pontuais para canais sem About nativo no YouTube
scraped.forEach((item) => {
  if (item.id === 'it_daniela_ballarini') {
    item.desc = 'Percorsi di coaching, abitudini sane, benessere e morning routine per organizzare la tua quotidianità.';
  }
  if (item.id === 'it_watchmojo_italia') {
    item.desc = 'Classifiche Top 10 su film, serie TV, videogiochi, anime e cultura pop in lingua italiana.';
  }
  if (item.id === 'it_cucina_botanica') {
    item.tags = ['Gastronomia'];
  }
  // Garantir tags atômicas sem conectivos
  item.tags = item.tags.map(t => t.replace('&', '').replace('  ', ' ').trim());
});

if (!content.italian) {
  content.italian = {
    YouTube: [],
    Podcasts: [],
    Séries: [],
    Professores: [],
    Pronúncia: [],
    Recursos: []
  };
}

content.italian.YouTube = scraped;

// Adicionar Podcast Italiano também na aba Podcasts
content.italian.Podcasts = [
  {
    id: 'it_podcast_podcast_italiano',
    name: 'Podcast Italiano',
    url: 'https://open.spotify.com/show/3QiX0ZkjILyGWmpemackWB',
    avatar: 'https://yt3.googleusercontent.com/rLVG_vpMfHgqbpOYrPLobG_D-F4297MWEACdZYkmiqLCSp771DdaHiTnWtlLPH4WiiHaKBf1ug=s900-c-k-c0x00ffffff-no-rj',
    desc: "Il podcast per imparare l'italiano attraverso contenuti interessanti e autentici di livello intermedio e avanzato, a cura di Davide Gemello.",
    tags: ['Materiais Adaptados', 'Educação'],
    beginnerFriendly: true,
    subtitlesAvailable: false,
    subtitleTag: null,
    transcriptUrl: 'https://podcastitaliano.com/',
    avgDuration: '25',
    platform: 'Spotify',
    originalLanguage: null,
    originalLanguageLabel: null
  }
];

fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');
console.log(`Atualizado content.json com sucesso! ${content.italian.YouTube.length} canais no YouTube e ${content.italian.Podcasts.length} no Podcasts.`);
