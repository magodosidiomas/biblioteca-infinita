const fs = require('fs');
const path = require('path');

// 1. Load Canonical Tags from tags.ts
function loadCanonicalTags() {
  const tagsTsPath = path.resolve(__dirname, '../app/src/constants/tags.ts');
  const tagsContent = fs.readFileSync(tagsTsPath, 'utf8');

  // Look for block between export const TAG_CATEGORIES and export const ALL_CANONICAL_TAGS
  const startIndex = tagsContent.indexOf('export const TAG_CATEGORIES');
  const endIndex = tagsContent.indexOf('export const ALL_CANONICAL_TAGS');
  const block = tagsContent.substring(startIndex, endIndex > 0 ? endIndex : undefined);

  const tags = new Set();
  const categoryTitles = new Set([
    'Dificuldade & Nível',
    'Nível & Dificuldade',
    'Legendas & Transcrição',
    'Didático & Ensino',
    'Gêneros & Ficção',
    'Cultura & Vida Real'
  ]);

  const tagMatches = block.matchAll(/"([^"]+)"/g);
  for (const m of tagMatches) {
    if (!categoryTitles.has(m[1])) {
      tags.add(m[1]);
    }
  }

  // Also include canonical aliases
  const aliasStart = tagsContent.indexOf('export const TAG_ALIASES');
  const aliasEnd = tagsContent.indexOf('export function resolveTag');
  const aliasBlock = tagsContent.substring(aliasStart, aliasEnd > 0 ? aliasEnd : undefined);
  const aliases = new Map();

  const aLines = aliasBlock.split(/\r?\n/);
  for (const l of aLines) {
    const km = l.match(/"([^"]+)":\s*"([^"]+)"/);
    if (km) {
      aliases.set(km[1].toLowerCase(), km[2]);
      tags.add(km[2]);
    }
  }

  return { tags, aliases };
}

function runValidation() {
  console.log('🔍 Executing Automated Catalog & Anti-Slop Validation...\n');

  const contentPath = path.resolve(__dirname, '../app/src/data/content.json');
  const channelsTsPath = path.resolve(__dirname, '../app/src/data/channels.ts');

  if (!fs.existsSync(contentPath)) {
    console.error('❌ ERRO CRÍTICO: content.json não encontrado em', contentPath);
    process.exit(1);
  }
  if (!fs.existsSync(channelsTsPath)) {
    console.error('❌ ERRO CRÍTICO: channels.ts não encontrado em', channelsTsPath);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
  const channelsTsContent = fs.readFileSync(channelsTsPath, 'utf8');

  // Extract CHANNELS array from channels.ts
  const chMatch = channelsTsContent.match(/export const CHANNELS(?::\s*(?:Channel|ChannelItem)\[\])?\s*=\s*(\[[\s\S]*?\]);?\s*$/);
  if (!chMatch) {
    console.error('❌ ERRO CRÍTICO: Não foi possível analisar CHANNELS em channels.ts');
    process.exit(1);
  }
  const channelsTs = JSON.parse(chMatch[1]);

  const { tags: canonicalTags, aliases } = loadCanonicalTags();
  const errors = [];
  const warnings = [];

  // 1. Dual-Sync Parity Check (Anti-Zumbi)
  const contentItems = [];
  for (const lang of Object.keys(content)) {
    const langObj = content[lang] || {};
    for (const cat of Object.keys(langObj)) {
      for (const item of (langObj[cat] || [])) {
        contentItems.push({ ...item, _lang: lang, _cat: cat });
      }
    }
  }

  console.log(`📦 Itens em content.json: ${contentItems.length}`);
  console.log(`📦 Itens em channels.ts:   ${channelsTs.length}`);
  console.log(`🏷️  Tags canônicas carregadas: ${canonicalTags.size}`);

  if (contentItems.length !== channelsTs.length) {
    errors.push(`Dessincronia de contagem: content.json tem ${contentItems.length} itens mas channels.ts tem ${channelsTs.length} itens.`);
  }

  const tsIdSet = new Set(channelsTs.map(c => c.id));
  const contentIdSet = new Set(contentItems.map(c => c.id || `${c._lang}_${(c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`));

  for (const cid of contentIdSet) {
    if (!tsIdSet.has(cid)) {
      errors.push(`Item em content.json com ID "${cid}" não encontrado em channels.ts`);
    }
  }
  for (const tid of tsIdSet) {
    if (!contentIdSet.has(tid)) {
      errors.push(`Item fantasma (zumbi) em channels.ts com ID "${tid}" não existe em content.json`);
    }
  }

  // 2. Taxonomy & Tags Check
  const FORBIDDEN_COMPOUNDS = ['&', ' e ', '/'];
  const BANNED_TAGS = ['Cultura e Entretenimento', 'Geral'];

  for (const item of contentItems) {
    const tags = item.tags || [];
    for (const t of tags) {
      // Check banned tags
      if (BANNED_TAGS.includes(t)) {
        errors.push(`[${item.name || item.id}] Tag proibida encontrada: "${t}"`);
      }

      // Check compound tags with &, e, /
      for (const fb of FORBIDDEN_COMPOUNDS) {
        if (t.includes(fb) && !['Ação & Aventura', 'Crime & Suspense', 'Ficção Científica', 'Legendas [CC]'].includes(t)) {
          errors.push(`[${item.name || item.id}] Tag composta proibida ("${fb}") encontrada: "${t}"`);
        }
      }

      // Check emojis
      if (/[\u{1F300}-\u{1FAFF}]/u.test(t)) {
        errors.push(`[${item.name || item.id}] Emoji proibido em tag: "${t}"`);
      }

      // Check canonical tag recognition
      if (!canonicalTags.has(t) && !aliases.has(t.toLowerCase())) {
        warnings.push(`[${item.name || item.id}] Tag não-canônica desconhecida: "${t}"`);
      }
    }
  }

  // 3. Subtitles Consistency Check (Anti-False-CC)
  for (const item of contentItems) {
    const hasCCLabel = item.subtitleTag === 'Legendas [CC]';
    const isBilingual = item.subtitleTag === 'Legendas bilíngues' || (item.tags || []).includes('Legendas bilíngues');
    const isSubAvailable = Boolean(item.subtitlesAvailable);

    if (hasCCLabel && !isSubAvailable) {
      errors.push(`[${item.name || item.id}] subtitleTag é "Legendas [CC]" mas subtitlesAvailable é false.`);
    }

    // If channel has ccStats, verify ratio threshold
    if (item.ccStats) {
      const ratio = item.ccStats.sampleCount > 0 ? item.ccStats.manualCount / item.ccStats.sampleCount : 0;
      if (ratio < 0.7 && hasCCLabel) {
        errors.push(`[${item.name || item.id}] Possui selo "Legendas [CC]" mas o ratio auditado foi de apenas ${item.ccStats.ratioFormatted} (< 70%).`);
      }
      if (ratio >= 0.7 && !hasCCLabel && !isBilingual) {
        warnings.push(`[${item.name || item.id}] Auditou ${item.ccStats.ratioFormatted} (>= 70%) mas não possui selo "Legendas [CC]".`);
      }
    }
  }

  // 4. Metadata & AI Slop Check
  const AI_SLOP_TELLS = [
    '100% autêntico',
    'explore nossa vasta',
    'catálogo atualizado diariamente',
    'imersão garantida',
    'o melhor canal do youtube',
    'canal incrível'
  ];
  const PLACEHOLDER_DESCS = [
    'More about this channel',
    'Mehr über diesen Kanal',
    'Für geschäftliche Anfragen:',
    'https://'
  ];

  for (const item of contentItems) {
    const desc = (item.desc || item.description || '').trim();
    const isPosterCategory = item._cat === 'Séries' || item._cat === 'Filmes';
    if (!desc && !isPosterCategory) {
      warnings.push(`[${item.name || item.id}] Descrição está vazia.`);
    }

    for (const ph of PLACEHOLDER_DESCS) {
      if (desc === ph || desc.startsWith(ph) && desc.length < 50) {
        warnings.push(`[${item.name || item.id}] Descrição parece ser um placeholder/link: "${desc.slice(0, 40)}..."`);
      }
    }

    for (const slop of AI_SLOP_TELLS) {
      if (desc.toLowerCase().includes(slop)) {
        errors.push(`[${item.name || item.id}] AI slop tell detectado na descrição: "${slop}"`);
      }
    }

    // Avatar check
    const avatar = item.avatar || item.avatarUrl;
    if (!avatar || !avatar.startsWith('http')) {
      errors.push(`[${item.name || item.id}] Avatar ausente ou com URL inválida: "${avatar}"`);
    }
  }

  // 5. Professores Separation Check
  for (const item of contentItems) {
    if (item._cat === 'YouTube' && item.isTeacher === true) {
      errors.push(`[${item.name || item.id}] Canal de professor colocado na aba de imersão YouTube.`);
    }
  }

  // Summary Report
  console.log('\n--- RESULTADO DA VALIDAÇÃO ---');
  if (warnings.length > 0) {
    console.warn(`⚠️  ${warnings.length} Avisos:`);
    warnings.forEach(w => console.warn(`   • ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\n❌ ${errors.length} ERROS ENCONTRADOS NO CATÁLOGO:`);
    errors.forEach(e => console.error(`   ✖ ${e}`));
    console.error('\nA validação FALHOU. Corrija os erros acima antes de prosseguir.');
    process.exit(1);
  } else {
    console.log('✅ VALIDAÇÃO DO CATÁLOGO PASSOU COM SUCESSO! 0 erros.');
  }
}

runValidation();
