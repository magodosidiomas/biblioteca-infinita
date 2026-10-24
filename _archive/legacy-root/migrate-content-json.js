const fs = require('fs');

const TAG_MAP = {
  'Animation': 'Animação',
  'Books & Literature': 'Literatura',
  'Cinema': 'Cinema & TV',
  'Cinema Series & TV': 'Cinema & TV',
  'Cinema Séries & TV': 'Cinema & TV',
  'Ciência / Astronomia': 'Ciência & Astronomia',
  'Comedy': 'Humor',
  'Cotidiano': 'Cotidiano',
  'Cultura': 'Cultura',
  'Culture': 'Cultura',
  'Curiosidades': 'Curiosidades',
  'DIY | Crafts': 'Artesanato & DIY',
  'Dialogues': 'Diálogos',
  'Documentaries': 'Documentários',
  'Dublado': 'Dublado',
  'Entrepreneurship': 'Empreendedorismo',
  'Entrevistas': 'Entrevistas',
  'Ficção': 'Ficção',
  'Finanças': 'Finanças',
  'Food | Gastronomy | Recipes': 'Gastronomia & Culinária',
  'Gaming': 'Games',
  'Geography': 'Geografia',
  'History': 'História',
  'História': 'História',
  'Humor': 'Humor',
  'Imersão': 'Imersão',
  'Interviews': 'Entrevistas',
  'Japan': 'Japão',
  'Language Courses': 'Cursos de Idiomas',
  'Language Learning': 'Aprendizado de Idiomas',
  'Language Teacher': 'Professor de Idiomas',
  'Learning': 'Aprendizado de Idiomas',
  'Lectures': 'Palestras',
  'Life abroad | expats | immigrants': 'Vida no Exterior',
  'Linguistics': 'Linguística',
  'Linguística': 'Linguística',
  'Marketing': 'Marketing',
  'Materiais Adaptados': 'Materiais Adaptados',
  'Money | Finances | Economy': 'Finanças',
  'Motivational': 'Desenvolvimento Pessoal',
  'Music': 'Música',
  'Nerd | Geek': 'Cultura Geek',
  'News': 'Notícias',
  'Notícias': 'Notícias',
  'Philosophy': 'Filosofia',
  'Photography': 'Fotografia',
  'Poliglota': 'Poliglota',
  'Politics': 'Política',
  'Productivity | Self-development': 'Desenvolvimento Pessoal',
  'Programming': 'Programação',
  'Pronunciation': 'Pronúncia',
  'Pronúncia': 'Pronúncia',
  'Psychology': 'Psicologia',
  'Public speaking': 'Comunicação',
  'Quebec': 'Quebec',
  'Religious': 'Espiritualidade',
  'Science & Astronomy': 'Ciência & Astronomia',
  'Self-experiments': 'Experimentos',
  'Short films': 'Curtas',
  'Sports': 'Esportes',
  'Star Wars': 'Star Wars',
  'Série': 'Série',
  'Technology | Tech reviews': 'Tecnologia',
  'Travel': 'Viagem',
  'Trivia': 'Curiosidades',
  'True Stories': 'Histórias Reais',
  'Vlog': 'Vlog',
  'Vlogger / YouTuber': 'Vlog',
  'Well-being | Health': 'Saúde & Bem-estar',
  'Well-being | health': 'Saúde & Bem-estar',
  'YouTuber | Vlogger': 'Vlog',
  'Áudio Original': 'Áudio Original'
};

function levelToPace(level) {
  if (!level) return 'Fala natural';
  const clean = level.toUpperCase();
  if (clean.includes('A1') || clean.includes('A2')) return 'Fala pausada';
  if (clean.includes('C1') || clean.includes('C2')) return 'Fala rápida';
  return 'Fala natural'; // B1, B2 or default
}

function migrate() {
  const filePath = 'app/src/data/content.json';
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let totalItems = 0;
  let tagsMigrated = 0;
  let levelsRemoved = 0;

  for (const lang in data) {
    for (const cat in data[lang]) {
      if (Array.isArray(data[lang][cat])) {
        data[lang][cat].forEach(item => {
          totalItems++;

          // 1. Tags migration: map and deduplicate
          if (Array.isArray(item.tags)) {
            const newTags = new Set();
            item.tags.forEach(t => {
              const mapped = TAG_MAP[t] || t;
              newTags.add(mapped);
              tagsMigrated++;
            });
            item.tags = Array.from(newTags);
          }

          // 2. Pace determination from level if paceTag is missing or placeholder
          if (item.levelTag || item.level) {
            const currentLevel = item.levelTag || item.level;
            if (!item.paceTag) {
              item.paceTag = levelToPace(currentLevel);
            }
            delete item.levelTag;
            delete item.level;
            levelsRemoved++;
          }

          // Guarantee paceTag has a value
          if (!item.paceTag) {
            item.paceTag = 'Fala natural';
          }
        });
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Migration complete! Processed ${totalItems} items. Removed level from ${levelsRemoved} items.`);
}

migrate();
