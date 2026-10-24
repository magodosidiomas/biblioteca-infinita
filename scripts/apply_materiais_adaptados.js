const fs = require('fs');
const path = require('path');

const contentPath = path.resolve(__dirname, '../app/src/data/content.json');
const channelsTsPath = path.resolve(__dirname, '../app/src/data/channels.ts');
const viteConfigPath = path.resolve(__dirname, '../app/vite.config.ts');

const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// Channels to tag with "Materiais Adaptados"
const targetIds = ['easy_german', 'deutsch_mit_lara', 'extraenglish', 'effortlessenglish'];

for (const lang of Object.keys(content)) {
  for (const cat of Object.keys(content[lang])) {
    for (const item of content[lang][cat]) {
      if (targetIds.includes(item.id)) {
        if (!item.tags.includes('Materiais Adaptados')) {
          item.tags.push('Materiais Adaptados');
          console.log(`Added "Materiais Adaptados" to ${item.name} (${item.id})`);
        }
      }
    }
  }
}

fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), 'utf8');

// Dual sync
const mapCat = {
  YouTube: 'youtube',
  Podcasts: 'podcasts',
  Séries: 'series',
  Professores: 'professores',
  Pronúncia: 'professores',
  Recursos: 'sites'
};
const items = [];

Object.keys(content).forEach((langKey) => {
  const langObj = content[langKey] || {};
  Object.keys(langObj).forEach((k) => {
    const targetCat = mapCat[k];
    if (!targetCat) return;

    (langObj[k] || []).forEach((c) => {
      const rawInitials = (c.name || c.title || langKey.slice(0, 2).toUpperCase())
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      let desc = (c.desc || c.description || '')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();

      items.push({
        id: c.id || `${langKey}_${(c.name || c.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        category: targetCat,
        title: c.name || c.title,
        url: c.url || '#',
        avatar: c.avatar || null,
        initials: rawInitials || langKey.slice(0, 2).toUpperCase(),
        description: desc,
        beginnerFriendly: Boolean(c.difficulty === 'iniciante' || (c.tags || []).includes('Iniciante')),
        subtitlesAvailable: Boolean(c.subtitleTag === 'Legendas [CC]' || c.subtitleTag === 'Legendas bilíngues' || c.subtitlesAvailable),
        accent: c.accent || null,
        flag: c.flag || null,
        language: langKey,
        topics: (c.tags || c.topics || ['Geral']).filter(t => t !== 'Cultura e Entretenimento')
      });
    });
  });
});

const fileContent = `import type { ChannelItem } from '../types/content';\n\nexport const CHANNELS: ChannelItem[] = ${JSON.stringify(items, null, 2)};\n`;
fs.writeFileSync(channelsTsPath, fileContent, 'utf-8');

if (fs.existsSync(viteConfigPath)) {
  const now = new Date();
  fs.utimesSync(viteConfigPath, now, now);
}

console.log('Sync complete.');
