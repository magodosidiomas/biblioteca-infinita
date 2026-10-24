const fs = require('fs');
const path = require('path');

const contentPath = path.join(__dirname, '../app/src/data/content.json');
const backupPath = path.join(__dirname, '../app/src/data/content.backup.json');

// 1. Create a safe backup first
const rawData = fs.readFileSync(contentPath, 'utf-8');
fs.writeFileSync(backupPath, rawData, 'utf-8');
console.log(`✅ Backup created at: ${backupPath}`);

const data = JSON.parse(rawData);

const CANONICAL_CATEGORIES = ['YouTube', 'Podcasts', 'Séries', 'Professores', 'Pronúncia', 'Recursos'];

let stats = {
  initialTotal: 0,
  sitesRemoved: 0,
  sameTabDuplicatesRemoved: 0,
  cleanedTitles: 0,
  finalTotal: 0,
  slopCount: 0,
  missingTagsCount: 0,
  missingAvatarCount: 0,
  educationalInYtCount: 0,
};

const slopPatterns = [
  /conteúdo selecionado/i,
  /ótimo para imersão/i,
  /ótimo para aprender/i,
  /canal ideal para/i,
  /excelente canal para/i,
  /para quem quer aprender/i,
  /imersão autêntica/i,
  /recurso excelente/i,
  /selecionado para imersão/i
];

const dirtyTitlePatterns = [
  /\s*[-–—|]\s*YouTube\s*[-–—|]?$/i,
  /\s*[-–—|]\s*YouTube\s*-$/i,
  /\s*[-–—|]\s*Dailymotion\s*$/i,
  /\s*[-–—|]\s*Netflix\s*$/i
];

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

// Cleaned data container
const cleanedData = {};

// Scan and clean
for (const lang of Object.keys(data)) {
  cleanedData[lang] = {};

  // Count initial items
  for (const cat of Object.keys(data[lang])) {
    if (Array.isArray(data[lang][cat])) {
      stats.initialTotal += data[lang][cat].length;
      if (cat === 'Sites') {
        stats.sitesRemoved += data[lang][cat].length;
      }
    }
  }

  // Process only canonical categories
  for (const cat of CANONICAL_CATEGORIES) {
    const rawItems = data[lang][cat] || [];
    const seen = new Set();
    const cleanList = [];

    for (let item of rawItems) {
      const urlKey = (item.url || '').trim().toLowerCase();
      const nameKey = (item.name || '').trim().toLowerCase();
      const dedupKey = urlKey ? `${urlKey}` : `${nameKey}`;

      // Skip exact same-category duplicates (except notion.so which shares URL across distinct resources)
      if (dedupKey && dedupKey !== 'https://notion.so' && seen.has(dedupKey)) {
        console.log(`🗑️ Removed duplicate in ${lang} > ${cat}: "${item.name}"`);
        stats.sameTabDuplicatesRemoved++;
        continue;
      }
      seen.add(dedupKey);

      // Clean title if it has dirty suffixes
      let cleanName = item.name || '';
      for (const pattern of dirtyTitlePatterns) {
        if (pattern.test(cleanName)) {
          const oldName = cleanName;
          cleanName = cleanName.replace(pattern, '').trim();
          console.log(`✨ Cleaned title: "${oldName}" -> "${cleanName}"`);
          stats.cleanedTitles++;
        }
      }
      item.name = cleanName;

      // Quality checks
      const isSlop = slopPatterns.some(p => p.test(item.desc || ''));
      if (isSlop) stats.slopCount++;

      const isMissingTags = !item.tags || item.tags.length === 0;
      if (isMissingTags) stats.missingTagsCount++;

      const isMissingAvatar = !item.avatar || item.avatar.trim() === '';
      if (isMissingAvatar) stats.missingAvatarCount++;

      if (cat === 'YouTube' && eduInYtPatterns.some(p => p.test(item.name || ''))) {
        stats.educationalInYtCount++;
      }

      cleanList.push(item);
      stats.finalTotal++;
    }

    cleanedData[lang][cat] = cleanList;
  }
}

// Write cleaned data back
fs.writeFileSync(contentPath, JSON.stringify(cleanedData, null, 2), 'utf-8');

console.log('\n========================================');
console.log('       DETERMINISTIC CLEANUP REPORT     ');
console.log('========================================');
console.log(`Initial raw items in content.json:   ${stats.initialTotal}`);
console.log(`Orphaned/duplicate "Sites" removed:  -${stats.sitesRemoved}`);
console.log(`Exact same-tab duplicates removed:   -${stats.sameTabDuplicatesRemoved}`);
console.log(`Titles cleaned of junk suffixes:     ${stats.cleanedTitles}`);
console.log(`Final canonical items remaining:     ${stats.finalTotal}`);
console.log('----------------------------------------');
console.log('        ACTIONABLE ANOMALY AUDIT        ');
console.log('----------------------------------------');
console.log(`1. AI Slop descriptions:             ${stats.slopCount} items`);
console.log(`2. Missing/empty tags:               ${stats.missingTagsCount} items`);
console.log(`3. Missing avatars:                  ${stats.missingAvatarCount} items`);
console.log(`4. Potential "Educacional" in YT:    ${stats.educationalInYtCount} items`);
console.log('========================================\n');
