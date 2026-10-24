const fs = require('fs');

const channelsToScrape = [
  // 5 Russos
  { name: "Russian With Max", url: "https://www.youtube.com/channel/UCklUqFEcJqFnWKEBozw5p4g" },
  { name: "Russian with Dasha", url: "https://www.youtube.com/channel/UCd99oM7GvrWrVoaz1i_6fwA" },
  { name: "Орел и Решка", url: "https://www.youtube.com/@OreliReshka" },
  { name: "varlamov", url: "https://www.youtube.com/@varlamov" },
  { name: "ТОПЛЕС", url: "https://www.youtube.com/@toplesofficial" },
  // 4 Franceses
  { name: "Easy French", url: "https://www.youtube.com/@EasyFrench" },
  { name: "Piece of French", url: "https://www.youtube.com/@PieceofFrench" },
  { name: "Cyprien", url: "https://www.youtube.com/@cyprien" },
  { name: "Nota Bene", url: "https://www.youtube.com/@notabenemovies" }
];

async function scrapeAll() {
  console.log("Raspando 9 canais reais...");
  const results = [];

  for (const item of channelsToScrape) {
    try {
      console.log(`Buscando ${item.name}...`);
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        signal: AbortSignal.timeout(6000)
      });
      const html = await res.text();

      // Avatar
      const avatar = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
      
      // Título oficial
      let title = (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || [])[1] || item.name;
      title = title.replace(/\s*-\s*YouTube/i, '').trim();

      // Descrição oficial do canal
      let desc = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) ||
                  html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';

      results.push({
        name: title,
        url: item.url,
        avatar: avatar || 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
        description: desc.trim() || 'Canal dedicado a conteúdos autênticos para imersão natural.'
      });
    } catch(err) {
      console.error(`Erro em ${item.name}:`, err.message);
      results.push({
        name: item.name,
        url: item.url,
        avatar: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
        description: 'Canal dedicado a conteúdos autênticos para imersão natural no idioma.'
      });
    }
  }

  // Gera o HTML do grid conectado estritamente com os 3 elementos solicitados
  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biblioteca de Imersão — Canais do YouTube</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #09090b;
      color: #fafafa;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body class="min-h-screen bg-[#09090b] text-zinc-100 p-6 sm:p-12 selection:bg-purple-900 selection:text-white">

  <div class="max-w-6xl mx-auto space-y-8">

    <!-- CABEÇALHO LIMPO -->
    <div class="border-b border-zinc-800 pb-5">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm">🧙🏻‍♂️</span>
        <span class="text-xs font-semibold text-zinc-400">Biblioteca de Imersão · Mago dos Idiomas</span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-zinc-100">
        Canais Recomendados no YouTube
      </h1>
      <p class="text-xs text-zinc-400 mt-1">
        Grade monolítica de 9 cards reais (Russo e Francês da sua base) — Apenas ícone, nome e descrição oficial.
      </p>
    </div>

    <!-- GRADE CONECTADA (3x3 = 9 CARDS) -->
    <!-- Linhas contínuas de 1px com divide-x e divide-y -->
    <div class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
      ${results.map((c, idx) => `
        <a href="${c.url}" target="_blank" class="group block p-6 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between space-y-4 ${idx >= 3 ? 'lg:border-t lg:border-zinc-800' : ''}">
          <div class="space-y-4">
            
            <!-- 1. ÍCONE (Avatar oficial do canal) -->
            <div class="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
              <img src="${c.avatar}" alt="${c.name}" class="w-full h-full object-cover">
            </div>

            <!-- 2. NOME & 3. DESCRIÇÃO DO CANAL -->
            <div class="space-y-1.5">
              <h2 class="text-base font-bold text-zinc-100 group-hover:text-purple-300 transition-colors line-clamp-1">
                ${c.name}
              </h2>
              <p class="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                ${c.description}
              </p>
            </div>

          </div>
        </a>
      `).join('')}
    </div>

  </div>

</body>
</html>`;

  fs.writeFileSync('preview.html', html, 'utf-8');
  console.log("Arquivo atualizado com sucesso: preview.html");
}

scrapeAll();
