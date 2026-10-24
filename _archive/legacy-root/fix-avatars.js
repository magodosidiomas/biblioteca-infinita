const fs = require('fs');

const channels = [
  { id: "easy_french", name: "Easy French", url: "https://www.youtube.com/@EasyFrench" },
  { id: "piece_of_french", name: "Piece of French", url: "https://www.youtube.com/@PieceofFrench" },
  { id: "wandering_french", name: "Wandering French", url: "https://www.youtube.com/@WanderingFrench" },
  { id: "linguisticae", name: "Linguisticae", url: "https://www.youtube.com/@Linguisticae" },
  { id: "monde_langues", name: "Le Monde des Langues", url: "https://www.youtube.com/@lemondedeslangues" },
  { id: "cyprien", name: "Cyprien", url: "https://www.youtube.com/@cyprien" },
  { id: "guillaume_ruchon", name: "Guillaume Ruchon", url: "https://www.youtube.com/@guiruch" },
  { id: "nota_bene", name: "Nota Bene", url: "https://www.youtube.com/@notabenemovies" },
  { id: "trash", name: "Trash", url: "https://www.youtube.com/@trash" }
];

async function fetchRealAvatars() {
  console.log("Baixando avatares oficiais e extraindo URLs reais...");
  const results = [];

  for (const c of channels) {
    try {
      console.log(`Buscando ${c.name}...`);
      const res = await fetch(c.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();

      // Pega imagem OG oficial do canal
      const match = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i);
      let avatar = match ? match[1] : '';

      // Título
      const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
      let title = titleMatch ? titleMatch[1].replace(/\s*-\s*YouTube/i, '').trim() : c.name;

      // Descrição
      const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
      let desc = descMatch ? descMatch[1].trim() : '';

      results.push({
        name: title,
        url: c.url,
        avatar: avatar,
        description: desc
      });
      console.log(` -> Sucesso: ${title} | Avatar: ${avatar ? avatar.slice(0, 50) + '...' : 'Vazio'}`);
    } catch(err) {
      console.error(`Erro em ${c.name}:`, err.message);
    }
  }

  // Gera o HTML atualizado sem links quebrados
  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biblioteca de Imersão — Francês (YouTube)</title>
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
<body class="min-h-screen bg-[#09090b] text-zinc-100 p-6 sm:p-10 selection:bg-purple-900 selection:text-white">

  <div class="max-w-6xl mx-auto space-y-8">

    <!-- CABEÇALHO -->
    <div class="border-b border-zinc-800 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-sm">🧙🏻‍♂️</span>
          <span class="text-xs font-semibold text-zinc-400">Biblioteca de Imersão · Mago dos Idiomas</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Canais em Francês
        </h1>
        <p class="text-sm text-zinc-400">
          Curadoria de canais recomendados para prática e imersão natural.
        </p>
      </div>

      <div class="text-xs text-zinc-500 font-medium font-mono">
        ${results.length} canais disponíveis
      </div>
    </div>

    <!-- GRADE CONECTADA (4PX GRID: P-6 / 24PX, AVATAR 48PX, TITLES 18PX, DESCRIPTIONS 14PX LINE-CLAMP-2) -->
    <div class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      ${results.map((c, idx) => `
        <a href="${c.url}" target="_blank" class="group block p-6 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between space-y-4 border-b border-zinc-800 md:border-b-0 ${idx < results.length - (results.length % 3 || 3) ? 'lg:border-b lg:border-zinc-800' : ''} ${idx % 3 !== 2 ? 'lg:border-r lg:border-zinc-800' : ''} ${idx % 2 === 0 ? 'md:max-lg:border-r md:max-lg:border-zinc-800' : ''} ${idx < results.length - (results.length % 2 || 2) ? 'md:max-lg:border-b md:max-lg:border-zinc-800' : ''}">
          <div class="space-y-3.5">
            <!-- Avatar oficial em alta resolução com fallback seguro -->
            <div class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img src="${c.avatar}" alt="${c.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=youtube.com&sz=128'">
            </div>
            <div class="space-y-1.5">
              <h2 class="text-lg font-bold tracking-tight text-zinc-100 group-hover:text-purple-300 transition-colors truncate">
                ${c.name}
              </h2>
              <p class="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                ${c.description || 'Canal dedicado a conteúdos autênticos para imersão natural no idioma.'}
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
  console.log("preview.html atualizado com avatares 100% reais!");
}

fetchRealAvatars();
