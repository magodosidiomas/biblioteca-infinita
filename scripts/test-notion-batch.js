const fs = require('fs');

async function scrapePage(targetUrl) {
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(6000)
    });
    const html = await res.text();
    
    const ogTitle = (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) ||
                     html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
    
    let ogImage = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
    if (ogImage && !ogImage.startsWith('http')) {
      try { ogImage = new URL(ogImage, targetUrl).href; } catch(e){}
    }

    const ogDesc = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';

    const host = new URL(targetUrl).hostname.replace('www.', '');

    return {
      url: targetUrl,
      platform: host,
      title: ogTitle.trim(),
      description: ogDesc.trim(),
      thumbnail: ogImage,
      status: ogImage ? 'OK (Com Imagem)' : 'Sem imagem (Fallback)'
    };
  } catch(e) {
    return {
      url: targetUrl,
      platform: 'Erro',
      title: '',
      thumbnail: '',
      status: 'Erro: ' + e.message
    };
  }
}

const urlsToTest = [
  { name: "TED Talks (YouTube)", url: "https://www.youtube.com/@TED/videos" },
  { name: "Steve Kaufmann (YouTube)", url: "https://www.youtube.com/user/lingosteve" },
  { name: "InnerFrench (Site do Podcast)", url: "https://innerfrench.com/" },
  { name: "Elllo (Portal de Áudio/Texto)", url: "https://elllo.org/english/levels/index.htm" },
  { name: "Teacher Luke (Blog/Podcast)", url: "https://teacherluke.co.uk/" },
  { name: "Podcast Italiano (Site)", url: "https://podcastitaliano.com/" },
  { name: "Language Reactor (Ferramenta)", url: "https://www.languagereactor.com/" },
  { name: "Easy Stories in English (Site)", url: "https://easystoriesinenglish.com/" },
  { name: "Anisub (Série/Anime)", url: "https://anisub.tv/" },
  { name: "Netflix (Exemplo Série)", url: "https://www.netflix.com/title/70153404" }
];

async function main() {
  console.log("Iniciando varredura com fetch nativo...\n");
  const results = [];
  for (const item of urlsToTest) {
    console.log(`Buscando: ${item.name} (${item.url})...`);
    const scraped = await scrapePage(item.url);
    console.log(` -> Status: ${scraped.status} | Título: ${scraped.title ? scraped.title.slice(0, 40) + '...' : '(sem título)'}`);
    results.push({ ...item, scraped });
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Auditoria de Scrape Real — Notion</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style> body { background-color: #09090b; color: #fafafa; font-family: 'Plus Jakarta Sans', sans-serif; } </style>
</head>
<body class="p-8 max-w-6xl mx-auto space-y-8">
  <div>
    <span class="text-xs font-mono text-purple-400">Auditoria Direta da sua Base do Notion</span>
    <h1 class="text-2xl font-bold text-zinc-100 mt-1">O que a Engine Consegue Puxar dos seus Links</h1>
    <p class="text-xs text-zinc-400 mt-1">
      Análise real de 10 domínios representativos da sua lista de 123 recursos exportados.
    </p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    ${results.map(r => {
      const s = r.scraped || {};
      const hasThumb = s.thumbnail && s.thumbnail.startsWith('http');
      return `
        <div class="rounded-xl bg-zinc-900/60 border border-zinc-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div class="relative aspect-video w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
              ${hasThumb ? `
                <img src="${s.thumbnail}" class="w-full h-full object-cover">
              ` : `
                <div class="text-center p-4">
                  <span class="text-2xl block mb-1">🌐</span>
                  <span class="text-xs font-mono text-zinc-500">Sem imagem de capa aberta</span>
                </div>
              `}
              <span class="absolute top-2.5 right-2.5 text-xs px-2 py-0.5 rounded bg-zinc-950/80 border border-zinc-800 text-zinc-300">
                ${s.platform || 'Web'}
              </span>
            </div>

            <div class="p-4 space-y-2">
              <span class="text-[11px] font-mono text-purple-400">${r.name}</span>
              <h3 class="text-sm font-semibold text-zinc-100 line-clamp-2">${s.title || r.name}</h3>
              ${s.description ? `<p class="text-xs text-zinc-400 line-clamp-2">${s.description}</p>` : ''}
            </div>
          </div>

          <div class="p-4 pt-0 space-y-2">
            <span class="inline-block text-[11px] font-mono ${hasThumb ? 'text-emerald-400' : 'text-amber-400'}">
              ${s.status}
            </span>
            <a href="${r.url}" target="_blank" class="block text-xs text-purple-400 hover:underline truncate">
              ${r.url}
            </a>
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync('notion-scrape-audit.html', html, 'utf-8');
  console.log("\nAuditoria finalizada com sucesso! Arquivo gerado: notion-scrape-audit.html");
}

main();
