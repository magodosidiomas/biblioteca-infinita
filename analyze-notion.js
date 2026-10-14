const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const dir = path.join('Notion exports', '8359241f-1ec6-45cc-993d-d568d3f729a6_ExportBlock-3a087e5c-b298-49b8-afca-ef136db63605');
const files = fs.readdirSync(dir);
const csvFile = files.find(f => f.includes('Banco de dados') && f.endsWith('.csv'));
const content = fs.readFileSync(path.join(dir, csvFile), 'utf-8');

// Parse CSV simples lidando com quotes
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/(https?:\/\/[^",\s]+)/);
    const url = match ? match[1].trim() : '';
    
    // Tenta pegar o nome (primeira coluna)
    let name = '';
    if (line.startsWith('"')) {
      const endQuote = line.indexOf('"', 1);
      name = line.substring(1, endQuote);
    } else {
      name = line.split(',')[0];
    }
    
    // Pega o tipo (YouTube, Podcast, Série, etc.)
    let tipo = 'Outro';
    if (line.includes('YouTube')) tipo = 'YouTube';
    else if (line.includes('Podcast')) tipo = 'Podcast';
    else if (line.includes('Série')) tipo = 'Série';
    else if (line.includes('Audiolivros')) tipo = 'Audiolivros';

    if (url) {
      rows.push({ name: name.trim(), url, tipo, rawLine: line });
    }
  }
  return rows;
}

const rows = parseCSV(content);

console.log(`Total de links encontrados no Notion: ${rows.length}`);

const domains = {};
rows.forEach(r => {
  try {
    const host = new URL(r.url).hostname.replace('www.', '');
    domains[host] = (domains[host] || 0) + 1;
  } catch(e){}
});

console.log('Distribuição por Domínio:');
console.log(JSON.stringify(domains, null, 2));

// Selecionar uma amostra representativa de diferentes tipos
const sampleUrls = [
  // 1. YouTube Channel padrão
  rows.find(r => r.url.includes('youtube.com/@TED') || r.url.includes('Polyglossa')),
  // 2. YouTube com /c/ ou /user/
  rows.find(r => r.url.includes('youtube.com/c/') || r.url.includes('BetterIdeas')),
  // 3. Podcast / Spotify ou site de podcast
  rows.find(r => r.tipo === 'Podcast' && (r.url.includes('spotify') || r.url.includes('elllo') || r.url.includes('teacherluke'))),
  // 4. Outro domínio / Blog / Graded readers
  rows.find(r => !r.url.includes('youtube') && !r.url.includes('spotify') && r.url.includes('http')),
  // 5. Série (se houver)
  rows.find(r => r.tipo === 'Série') || rows.find(r => r.url.includes('netflix'))
].filter(Boolean);

console.log('\nAmostra selecionada para teste de scrape:');
sampleUrls.forEach(s => console.log(`- [${s.tipo}] ${s.name}: ${s.url}`));
