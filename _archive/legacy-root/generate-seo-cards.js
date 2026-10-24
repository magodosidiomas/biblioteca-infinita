const fs = require('fs');

// Função para buscar favicon em alta resolução via Google Favicon v2
function getHighResFavicon(urlStr) {
  try {
    const domain = new URL(urlStr).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch(e) {
    return '';
  }
}

// Scraper focado em SEO Rich Snippet (como o Google mostra na busca)
async function scrapeRichSnippet(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    const domain = parsed.hostname.replace('www.', '');
    const favicon = getHighResFavicon(targetUrl);

    // Se for YouTube vídeo / canal
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`, {
        signal: AbortSignal.timeout(5000)
      });
      if (oembedRes.ok) {
        const j = await oembedRes.json();
        return {
          url: targetUrl,
          domain: 'youtube.com',
          siteName: 'YouTube',
          favicon: favicon,
          title: j.title || j.author_name || '',
          snippet: `Canal oficial de ${j.author_name} no YouTube. Conteúdos e vídeos para imersão.`,
          thumbnail: j.thumbnail_url || favicon,
          type: 'YouTube'
        };
      }
    }

    // Scrape HTML para meta tags de busca (Google / SEO Rich Snippets)
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(6000)
    });
    const html = await res.text();

    // 1. Meta Title (SEO)
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i) ||
                       html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
    let title = titleMatch ? titleMatch[1].trim() : domain;
    // Limpeza de sufixos de SEO comuns como " - Home", " | Official Site"
    title = title.replace(/\s*([\|\-\–—]\s*(Home|Official Site|Welcome|Página Inicial)).*$/i, '');

    // 2. Meta Description (O snippet que aparece no Google)
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    let snippet = descMatch ? descMatch[1].trim() : '';

    // 3. Imagem de Thumbnail / Rich Snippet
    let thumb = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
    if (thumb && !thumb.startsWith('http')) {
      try { thumb = new URL(thumb, targetUrl).href; } catch(e){}
    }

    // 4. Site Name
    const siteNameMatch = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']*)["']/i);
    const siteName = siteNameMatch ? siteNameMatch[1].trim() : domain;

    return {
      url: targetUrl,
      domain: domain,
      siteName: siteName,
      favicon: favicon,
      title: title,
      snippet: snippet,
      thumbnail: thumb || favicon,
      hasRealThumb: Boolean(thumb && thumb.startsWith('http')),
      type: 'Web'
    };
  } catch(e) {
    return {
      url: targetUrl,
      domain: new URL(targetUrl).hostname.replace('www.', ''),
      siteName: new URL(targetUrl).hostname.replace('www.', ''),
      favicon: getHighResFavicon(targetUrl),
      title: 'Página de Imersão',
      snippet: 'Recurso curado para imersão e aprendizado de idioma.',
      thumbnail: getHighResFavicon(targetUrl),
      hasRealThumb: false,
      type: 'Web'
    };
  }
}

// Links reais do Notion para testar
const urls = [
  { name: "TED Talks", url: "https://www.youtube.com/@TED/videos", lang: "Inglês", level: "🌿 Básico" },
  { name: "Steve Kaufmann", url: "https://www.youtube.com/user/lingosteve", lang: "Inglês", level: "🌿 Básico" },
  { name: "Elllo Views", url: "https://www.elllo.org/english/1451/index.htm", lang: "Inglês", level: "🌱 Iniciante" },
  { name: "Teacher Luke", url: "https://teacherluke.co.uk/", lang: "Inglês", level: "🌿 Básico" },
  { name: "Podcast Italiano", url: "https://podcastitaliano.com/", lang: "Italiano", level: "🌱 Iniciante" },
  { name: "InnerFrench", url: "https://innerfrench.com/", lang: "Francês", level: "🌿 Básico" },
  { name: "Easy Stories in English", url: "https://easystoriesinenglish.com/", lang: "Inglês", level: "🌱 Iniciante" },
  { name: "Language Reactor", url: "https://www.languagereactor.com/", lang: "Geral", level: "Ferramenta" },
  { name: "Anisub (Anime)", url: "https://anisub.tv/", lang: "Japonês", level: "🌳 Nativo" }
];

async function run() {
  console.log("Extraindo dados SEO (Rich Snippets)...");
  const items = [];
  for (const u of urls) {
    const data = await scrapeRichSnippet(u.url);
    items.push({ ...u, ...data });
  }

  // Gera o HTML comparativo com a "Versão B: Snippet / Miniatura Lateral"
  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Versão B — Cards com SEO Snippet & Miniatura Lateral</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { background-color: #09090b; color: #fafafa; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  </style>
</head>
<body class="min-h-screen p-6 sm:p-12 selection:bg-purple-900 selection:text-white">

  <div class="max-w-5xl mx-auto space-y-12">
    
    <div>
      <span class="text-xs font-mono text-purple-400">Versão B — Baseada em SEO & Rich Snippets</span>
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 mt-1">
        Cards com SEO Snippet & Miniatura Lateral (Estilo Google Search / Arc Search)
      </h1>
      <p class="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
        Aqui não forçamos capa 16:9 grande. Puxamos o <strong>Favicon em alta resolução</strong>, o <strong>domínio de origem</strong>, a <strong>meta description real (snippet de busca)</strong> e uma <strong>miniatura lateral limpa</strong>.
      </p>
    </div>

    <!-- GRID DE CARDS ESTILO VERSÃO B -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      ${items.map(item => `
        <article class="group p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/90 transition-all duration-200 flex flex-col justify-between space-y-3.5">
          
          <div class="space-y-2.5">
            <!-- Header do Snippet: Favicon + Domínio + Nível -->
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-6 h-6 rounded-md bg-zinc-950 border border-zinc-800 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img src="${item.favicon}" alt="" class="w-full h-full object-contain">
                </div>
                <span class="text-xs font-medium text-zinc-400 truncate">${item.domain}</span>
              </div>

              <span class="px-2 py-0.5 rounded text-xs font-medium ${item.level.includes('🌱') ? 'bg-emerald-950/60 border border-emerald-800/40 text-emerald-300' : 'bg-amber-950/60 border border-amber-800/40 text-amber-300'} flex-shrink-0">
                ${item.level}
              </span>
            </div>

            <!-- Corpo: Título + Snippet de Busca + Miniatura Lateral -->
            <div class="flex gap-3.5 items-start justify-between">
              <div class="space-y-1.5 flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                  ${item.title}
                </h3>
                
                <p class="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  ${item.snippet || 'Recurso curado para imersão natural. Clique para acessar o conteúdo na íntegra.'}
                </p>
              </div>

              <!-- Miniatura lateral (Thumbnail quadrada ou avatar) -->
              <div class="w-16 h-16 rounded-lg bg-zinc-950 border border-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img src="${item.thumbnail}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
              </div>
            </div>
          </div>

          <!-- Rodapé do Card: Tags de Apoio e Link Direto (Sem dividers feios) -->
          <div class="flex items-center justify-between pt-1 text-xs">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-xs">Legendas</span>
              <span class="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-xs">Pausado</span>
            </div>

            <a href="${item.url}" target="_blank" class="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium transition">
              <span>Acessar</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </div>

        </article>
      `).join('')}

    </div>

  </div>

</body>
</html>`;

  fs.writeFileSync('cards-seo-preview.html', html, 'utf-8');
  console.log("Arquivo gerado: cards-seo-preview.html");
}

run();
