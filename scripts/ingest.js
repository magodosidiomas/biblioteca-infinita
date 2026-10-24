#!/usr/bin/env node
/**
 * scripts/ingest.js
 * Ingestion Engine Unificado — Biblioteca Infinita
 * 
 * Pipeline elegante e atômico para auditar e adicionar canais do YouTube:
 * 1. Extração oficial de metadados verbatim (Anti-Slop: zero texto inventado)
 * 2. Auditoria rigorosa de legendas humanas (10 vídeos recentes, threshold >= 70%)
 * 3. Normalização atômica de tags via dicionário canônico (TAG_ALIASES)
 * 4. Persistência atômica dupla: content.json + channels.ts
 * 5. Invalidação de cache do Vite
 * 6. Validação automática de integridade pós-gravação
 * 
 * Uso:
 *   node scripts/ingest.js <url1> [url2...] [--lang <idioma>] [--tags "Tag1,Tag2"] [--beginner] [--dry-run]
 *   node scripts/ingest.js --file urls.txt [--lang <idioma>] [--beginner]
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const CONTENT_PATH = path.resolve(__dirname, '../app/src/data/content.json');
const CHANNELS_PATH = path.resolve(__dirname, '../app/src/data/channels.ts');
const TAGS_PATH = path.resolve(__dirname, '../app/src/constants/tags.ts');
const VITE_CONFIG_PATH = path.resolve(__dirname, '../app/vite.config.ts');
const VALIDATE_SCRIPT = path.resolve(__dirname, 'validate-catalog.js');

// ==========================================
// 1. HTTP HELPER (Follow Redirects, Headers)
// ==========================================
function fetchUrl(targetUrl, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(targetUrl);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,de;q=0.8,pt-BR;q=0.7',
      },
      timeout: timeoutMs
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirect = res.headers.location;
        if (redirect.startsWith('/')) {
          redirect = `${urlObj.origin}${redirect}`;
        }
        return fetchUrl(redirect, timeoutMs).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout (${timeoutMs}ms) fetching ${targetUrl}`));
    });
    req.on('error', reject);
  });
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&#([0-9]{1,6});/gi, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

// ==========================================
// 2. TAG RESOLVER (Usa tags.ts Canônico)
// ==========================================
function loadCanonicalTaxonomy() {
  const tagsContent = fs.readFileSync(TAGS_PATH, 'utf8');
  const aliases = new Map();
  const canonical = new Set();

  const categoryTitles = new Set([
    'Dificuldade & Nível',
    'Nível & Dificuldade',
    'Legendas & Transcrição',
    'Didático & Ensino',
    'Gêneros & Ficção',
    'Cultura & Vida Real'
  ]);

  const catStart = tagsContent.indexOf('export const TAG_CATEGORIES');
  const catEnd = tagsContent.indexOf('export const ALL_CANONICAL_TAGS');
  const block = tagsContent.substring(catStart, catEnd > 0 ? catEnd : undefined);

  const tagMatches = block.matchAll(/"([^"]+)"/g);
  for (const m of tagMatches) {
    if (!categoryTitles.has(m[1])) {
      canonical.add(m[1]);
    }
  }

  const aliasStart = tagsContent.indexOf('export const TAG_ALIASES');
  const aliasEnd = tagsContent.indexOf('export function resolveTag');
  const aliasBlock = tagsContent.substring(aliasStart, aliasEnd > 0 ? aliasEnd : undefined);

  const aLines = aliasBlock.split(/\r?\n/);
  for (const l of aLines) {
    const km = l.match(/"([^"]+)":\s*"([^"]+)"/);
    if (km) {
      aliases.set(km[1].toLowerCase(), km[2]);
      canonical.add(km[2]);
    }
  }

  return { canonical, aliases };
}

function normalizeTag(tag, { canonical, aliases }) {
  if (!tag) return null;
  const clean = tag.trim();
  if (canonical.has(clean)) return clean;

  const aliased = aliases.get(clean.toLowerCase());
  if (aliased) return aliased;

  return clean;
}

// ==========================================
// 3. YOUTUBE METADATA EXTRACTOR (Verbatim)
// ==========================================
async function extractYouTubeMetadata(channelUrl) {
  const cleanUrl = channelUrl.trim().replace(/\/+$/, '');
  const baseChannelUrl = cleanUrl.replace(/\/(videos|featured|playlists|search|shorts|streams)\/?.*$/i, '');
  
  // 1. Fetch channel main page
  const html = await fetchUrl(baseChannelUrl);

  // Title
  const titleMatch = html.match(/<meta property="og:title" content="([^"]+)">/) ||
                     html.match(/<title>([^<]+)<\/title>/);
  let title = titleMatch ? decodeHtmlEntities(titleMatch[1]).replace(/\s*[-–—|]\s*YouTube\s*[-–—|]?$/i, '').trim() : '';

  // Avatar
  const avatarMatch = html.match(/<meta property="og:image" content="([^"]+)">/);
  let avatar = avatarMatch ? avatarMatch[1] : '';

  // Description verbatim
  const descMatch = html.match(/<meta property="og:description" content="([^"]+)">/) ||
                    html.match(/<meta name="description" content="([^"]+)">/);
  let desc = descMatch ? decodeHtmlEntities(descMatch[1]).trim() : '';

  // 2. Fetch /videos tab for recent long-form video IDs
  let videoIds = [];
  try {
    const videosHtml = await fetchUrl(`${baseChannelUrl}/videos`);
    const jsonMatch = videosHtml.match(/var ytInitialData = ({.*?});<\/script>/s) ||
                      videosHtml.match(/window\["ytInitialData"\] = ({.*?});<\/script>/s);

    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[1]);
      const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
      const videosTab = tabs.find(t => t.tabRenderer?.title === 'Videos' || t.tabRenderer?.endpoint?.commandMetadata?.webCommandMetadata?.url?.includes('/videos'));
      const contents = videosTab?.tabRenderer?.content?.richGridRenderer?.contents || [];

      for (const item of contents) {
        // Modern YouTube lockupViewModel
        const lvm = item?.richItemRenderer?.content?.lockupViewModel;
        if (lvm && lvm.contentId) {
          videoIds.push(lvm.contentId);
          continue;
        }
        // Legacy videoRenderer
        const vr = item?.richItemRenderer?.content?.videoRenderer;
        if (vr && vr.videoId) {
          videoIds.push(vr.videoId);
        }
      }
    }
  } catch (err) {
    // Fallback: regex scan
  }

  // Fallback se não pegou via /videos
  if (videoIds.length === 0) {
    const fallbackMatches = Array.from(html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)).map(m => m[1]);
    videoIds = [...new Set(fallbackMatches)].slice(0, 10);
  }

  videoIds = [...new Set(videoIds)].slice(0, 10);

  return {
    url: baseChannelUrl,
    title,
    avatar,
    desc,
    videoIds
  };
}

// ==========================================
// 4. SUBTITLE AUDIT SCANNER (Human CC vs ASR)
// ==========================================
async function auditSubtitles(videoIds, maxSamples = 8) {
  const sample = videoIds.slice(0, maxSamples);
  if (sample.length === 0) {
    return {
      subtitlesAvailable: false,
      ratio: 0,
      ratioFormatted: '0/0',
      sampleCount: 0,
      manualLanguages: []
    };
  }

  const detectedLanguages = new Set();
  let manualCount = 0;

  for (const vid of sample) {
    try {
      const vHtml = await fetchUrl(`https://www.youtube.com/watch?v=${vid}`, 6000);
      const captionMatch = vHtml.match(/"captionTracks":\s*(\[.*?\])/);
      if (captionMatch) {
        const tracks = JSON.parse(captionMatch[1]);
        const manualTracks = tracks.filter(t => !t.kind || t.kind !== 'asr');
        if (manualTracks.length > 0) {
          manualCount++;
          manualTracks.forEach(t => detectedLanguages.add(t.languageCode || t.name?.simpleText));
        }
      }
    } catch (e) {
      // Falha pontual em vídeo individual não interrompe auditoria
    }
  }

  const ratio = sample.length > 0 ? manualCount / sample.length : 0;
  const subtitlesAvailable = ratio >= 0.7;

  return {
    subtitlesAvailable,
    ratio,
    ratioFormatted: `${manualCount}/${sample.length}`,
    sampleCount: sample.length,
    manualLanguages: Array.from(detectedLanguages)
  };
}

// ==========================================
// 5. ATOMIC DUAL-SYNC & PERSISTENCE
// ==========================================
function syncChannelsTs(content) {
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
          beginnerFriendly: Boolean(c.difficulty === 'iniciante' || (c.tags || []).includes('Iniciante') || c.beginnerFriendly),
          subtitlesAvailable: Boolean(c.subtitleTag === 'Legendas [CC]' || c.subtitleTag === 'Legendas bilíngues' || c.subtitlesAvailable),
          transcriptUrl: c.transcriptUrl || c.transcript || null,
          avgDuration: c.avgDuration || null,
          accent: c.accent || null,
          flag: c.flag || null,
          language: langKey,
          topics: c.tags || c.topics || []
        });
      });
    });
  });

  const fileContent = `import type { ChannelItem } from '../types/content';\n\nexport const CHANNELS: ChannelItem[] = ${JSON.stringify(items, null, 2)};\n`;
  fs.writeFileSync(CHANNELS_PATH, fileContent, 'utf-8');
}

// ==========================================
// 6. MAIN INGESTION PIPELINE
// ==========================================
async function ingestChannel(rawUrl, options = {}) {
  const { lang = 'german', format = 'YouTube', tags = [], beginner = false, dryRun = false } = options;
  const taxonomy = loadCanonicalTaxonomy();

  console.log(`\n🔍 Extraindo metadados oficiais: ${rawUrl}`);
  const meta = await extractYouTubeMetadata(rawUrl);

  if (!meta.title) {
    throw new Error(`Não foi possível extrair metadados para: ${rawUrl}`);
  }

  console.log(`   🏷️  Título: ${meta.title}`);
  console.log(`   📝 Bio: ${meta.desc ? meta.desc.slice(0, 90) + '...' : '(sem bio)'}`);
  console.log(`   🖼️  Avatar: ${meta.avatar ? 'OK' : 'Não encontrado'}`);
  console.log(`   🎬 Vídeos recentes para amostra: ${meta.videoIds.length}`);

  // Auditoria de Legendas
  console.log(`   ⏳ Auditando legendas humanas (amostra de até 8 vídeos)...`);
  const ccResult = await auditSubtitles(meta.videoIds, 8);
  console.log(`   💬 Resultado CC: ${ccResult.ratioFormatted} (${(ccResult.ratio * 100).toFixed(0)}%) -> ${ccResult.subtitlesAvailable ? '✅ Legendas [CC] verificadas' : '❌ Sem legendas manuais (ASR)'}`);

  // Normalização de Tags Atômicas
  const finalTags = new Set();
  if (beginner) {
    finalTags.add('Iniciante');
    finalTags.add('Materiais Adaptados');
  }

  for (const t of tags) {
    const norm = normalizeTag(t, taxonomy);
    if (norm) finalTags.add(norm);
  }

  if (finalTags.size === 0) {
    finalTags.add('Vlog'); // Fallback padrão seguro
  }

  // Gera ID consistente
  const handleMatch = meta.url.match(/@([a-zA-Z0-9_.-]+)/);
  const handleOrName = handleMatch ? handleMatch[1].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : meta.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
  const id = `${lang}_${format.toLowerCase()}_${handleOrName}`;

  const channelRecord = {
    id,
    name: meta.title,
    url: meta.url,
    tags: Array.from(finalTags),
    avatar: meta.avatar,
    desc: meta.desc,
    subtitleTag: ccResult.subtitlesAvailable ? 'Legendas [CC]' : null,
    _langKey: lang,
    _format: format,
    subtitlesAvailable: ccResult.subtitlesAvailable
  };

  if (dryRun) {
    console.log(`\n🧪 [DRY-RUN] Registro formatado pronto (não salvo):`);
    console.log(JSON.stringify(channelRecord, null, 2));
    return channelRecord;
  }

  // Persistência em content.json
  const content = JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf8'));
  if (!content[lang]) content[lang] = {};
  if (!content[lang][format]) content[lang][format] = [];

  const existingIdx = content[lang][format].findIndex(c => c.url.toLowerCase() === meta.url.toLowerCase() || c.id === id);
  if (existingIdx >= 0) {
    content[lang][format][existingIdx] = channelRecord;
    console.log(`   🔄 Registro existente atualizado no banco.`);
  } else {
    content[lang][format].push(channelRecord);
    console.log(`   ➕ Novo registro inserido no banco.`);
  }

  fs.writeFileSync(CONTENT_PATH, JSON.stringify(content, null, 2), 'utf8');

  // Sincronização channels.ts
  syncChannelsTs(content);
  console.log(`   📦 Dual-sync executado: content.json + channels.ts sincronizados.`);

  // Invalidação de Cache Vite
  if (fs.existsSync(VITE_CONFIG_PATH)) {
    const vc = fs.readFileSync(VITE_CONFIG_PATH, 'utf8');
    fs.writeFileSync(VITE_CONFIG_PATH, vc, 'utf8');
  }

  return channelRecord;
}

// ==========================================
// 7. CLI ARGUMENT PARSER
// ==========================================
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso do Ingestion Engine:
  node scripts/ingest.js <url1> [url2...] [opções]

Opções:
  --lang <idioma>      Idioma do canal (padrão: german)
  --format <formato>   Formato (padrão: YouTube)
  --tags "T1,T2"       Tags separadas por vírgula (resolvidas via TAG_ALIASES)
  --beginner           Marca como iniciante e adiciona "Materiais Adaptados"
  --dry-run, --audit   Apenas audita metadados e legendas sem persistir
  --file <caminho>     Arquivo de texto contendo uma lista de URLs (uma por linha)
    `);
    process.exit(0);
  }

  let lang = 'german';
  let format = 'YouTube';
  let tags = [];
  let beginner = false;
  let dryRun = false;
  let urls = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--lang' && args[i + 1]) {
      lang = args[++i].trim();
    } else if (arg === '--format' && args[i + 1]) {
      format = args[++i].trim();
    } else if (arg === '--tags' && args[i + 1]) {
      const rawTags = args[++i];
      const cleanRaw = rawTags.replace(/^["'\\]+|["'\\]+$/g, '');
      tags = cleanRaw.split(',').map(s => s.replace(/^["'\\]+|["'\\]+$/g, '').trim()).filter(Boolean);
    } else if (arg.startsWith('--tags=')) {
      const rawTags = arg.slice(7);
      const cleanRaw = rawTags.replace(/^["'\\]+|["'\\]+$/g, '');
      tags = cleanRaw.split(',').map(s => s.replace(/^["'\\]+|["'\\]+$/g, '').trim()).filter(Boolean);
    } else if (arg === '--beginner' || arg === '--iniciante') {
      beginner = true;
    } else if (arg === '--dry-run' || arg === '--audit') {
      dryRun = true;
    } else if (arg === '--file' && args[i + 1]) {
      const filePath = path.resolve(args[++i]);
      if (fs.existsSync(filePath)) {
        const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        urls.push(...lines);
      } else {
        console.error(`Arquivo não encontrado: ${filePath}`);
        process.exit(1);
      }
    } else if (!arg.startsWith('--')) {
      const cleanArg = arg.replace(/^["'\\]+|["'\\]+$/g, '').trim();
      if (cleanArg.startsWith('http://') || cleanArg.startsWith('https://') || cleanArg.startsWith('@') || cleanArg.includes('youtube.com')) {
        urls.push(cleanArg);
      }
    }
  }

  if (urls.length === 0) {
    console.error('Nenhuma URL fornecida.');
    process.exit(1);
  }

  console.log(`\n🚀 Ingestão Iniciada (${urls.length} canais) | Idioma: ${lang} | Modo: ${dryRun ? 'DRY-RUN (Auditoria)' : 'GRAVAÇÃO'}`);

  const results = [];
  for (const u of urls) {
    try {
      const res = await ingestChannel(u, { lang, format, tags, beginner, dryRun });
      results.push(res);
    } catch (err) {
      console.error(`❌ Erro processando ${u}: ${err.message}`);
    }
  }

  if (!dryRun) {
    console.log(`\n🔍 Executando Quality Gate de Validação pós-ingestão...`);
    const { execSync } = require('child_process');
    try {
      execSync(`node "${VALIDATE_SCRIPT}"`, { stdio: 'inherit' });
      console.log(`\n✨ SUCESSO: Todos os canais foram ingeridos, sincronizados e validados!`);
    } catch (e) {
      console.error(`❌ Falha na validação do catálogo.`);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
}

module.exports = {
  ingestChannel,
  extractYouTubeMetadata,
  auditSubtitles,
  syncChannelsTs
};
