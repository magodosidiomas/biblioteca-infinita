const fs = require('fs');
const path = require('path');

const contentPath = path.resolve(__dirname, '../app/src/data/content.json');
const channelsFilePath = path.resolve(__dirname, '../app/src/data/channels.ts');
const channelsJsonPath = path.resolve(__dirname, '../app/src/data/channels.json');

const data = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const mapCat = {
  YouTube: 'youtube',
  Podcasts: 'podcasts',
  Séries: 'series',
  Filmes: 'movies',
  Professores: 'professores',
  Pronúncia: 'pronuncia',
  Recursos: 'sites'
};

const items = [];

Object.keys(data).forEach((langKey) => {
  const langObj = data[langKey] || {};
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
        beginnerFriendly: Boolean(c.difficulty === 'iniciante' || (c.tags || []).includes('Iniciante') || c.beginnerFriendly),
        subtitlesAvailable: Boolean(c.subtitleTag === 'Legendas [CC]' || c.subtitleTag === 'Legendas bilíngues' || c.subtitlesAvailable),
        transcriptUrl: c.transcriptUrl || c.transcript || null,
        avgDuration: c.avgDuration || null,
        accent: c.accent || null,
        flag: c.flag || null,
        language: langKey,
        topics: c.tags || c.topics || [],
        platform: c.platform || null,
        originalLanguage: c.originalLanguage || null,
        originalLanguageLabel: c.originalLanguageLabel || null
      });
    });
  });
});

fs.writeFileSync(channelsJsonPath, JSON.stringify(items, null, 2), 'utf-8');
const fileContent = `import type { ChannelItem } from '../types/content';\n\nexport const CHANNELS: ChannelItem[] = ${JSON.stringify(items, null, 2)};\n`;
fs.writeFileSync(channelsFilePath, fileContent, 'utf-8');
console.log(`Synced channels.ts & channels.json with ${items.length} items`);
