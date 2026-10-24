const fs = require('fs');

const channels = [
  { id: "easy_french", name: "Easy French", url: "https://www.youtube.com/@EasyFrench", tags: ["Cultura", "Entrevistas"], subtitleTag: "Legendas bilíngues", paceTag: "Fala pausada" },
  { id: "piece_of_french", name: "Piece of French", url: "https://www.youtube.com/@PieceofFrench", tags: ["Cotidiano", "Vlog"], subtitleTag: "Legendas CC", paceTag: "Fala pausada" },
  { id: "wandering_french", name: "Wandering French", url: "https://www.youtube.com/@WanderingFrench", tags: ["Quebec", "Pronúncia"], subtitleTag: "Legendas fixas", paceTag: "Fala natural" },
  { id: "linguisticae", name: "Linguisticae", url: "https://www.youtube.com/@Linguisticae", tags: ["Linguística", "História"], subtitleTag: "Legendas CC", paceTag: "Fala natural" },
  { id: "monde_langues", name: "Le Monde des Langues", url: "https://www.youtube.com/@lemondedeslangues", tags: ["Poliglota"], subtitleTag: "Sem legendas", paceTag: "Fala natural" },
  { id: "cyprien", name: "Cyprien", url: "https://www.youtube.com/@cyprien", tags: ["Humor", "Ficção"], subtitleTag: "Legendas CC", paceTag: "Fala rápida" },
  { id: "guillaume_ruchon", name: "Guillaume Ruchon", url: "https://www.youtube.com/@guiruch", tags: ["Cinema", "Vlog"], subtitleTag: "Sem legendas", paceTag: "Fala natural" },
  { id: "nota_bene", name: "Nota Bene", url: "https://www.youtube.com/@notabenemovies", tags: ["História"], subtitleTag: "Legendas CC", paceTag: "Fala natural" },
  { id: "trash", name: "Trash", url: "https://www.youtube.com/@trash", tags: ["Curiosidades", "Pop"], subtitleTag: "Sem legendas", paceTag: "Fala rápida" }
];

async function updatePreviewWithTags() {
  console.log("Atualizando preview.html com tríade completa: Temas, Legendas e Ritmo de fala...");
  
  // Usamos os dados cacheados ou extraídos
  const existingPreview = fs.readFileSync('preview.html', 'utf-8');
  
  // Extrai os avatares já existentes no preview.html para não precisar dar fetch se já estiverem lá
  const avatarMatches = [...existingPreview.matchAll(/img src="([^"]+)"/g)].map(m => m[1]);
  const descMatches = [...existingPreview.matchAll(/line-clamp-2">\s*([\s\S]*?)\s*<\/p>/g)].map(m => m[1]);
  const titleMatches = [...existingPreview.matchAll(/text-base font-bold[^>]*>\s*([\s\S]*?)\s*<\/h2>/g)].map(m => m[1]);

  const cardsHtml = channels.map((c, idx) => {
    const avatar = avatarMatches[idx] || 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128';
    const title = titleMatches[idx] || c.name;
    const desc = descMatches[idx] || 'Canal dedicado a conteúdos autênticos para imersão natural no idioma.';
    
    // 1ª Linha: Tag badges temáticas (fundo bem escuro, roxo profundo e borda sutil)
    const tagBadges = c.tags.map(t => `
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-[#1e1528] text-purple-300/80 border border-purple-900/40">
        ${t}
      </span>
    `).join('');

    // 2ª Linha: Tag de legendas (fundo bem escuro e discreto)
    const isNoSubtitle = c.subtitleTag === "Sem legendas";
    const subtitleBadge = `
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${isNoSubtitle ? 'bg-[#121215] text-zinc-600 border border-zinc-800/60' : 'bg-[#18181b] text-zinc-300 border border-zinc-800'}">
        ${c.subtitleTag}
      </span>
    `;

    // 2ª Linha: Tag de ritmo da fala (fundo neutro elegante)
    const paceBadge = `
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-[#18181b] text-zinc-400 border border-zinc-800">
        ${c.paceTag}
      </span>
    `;

    return `
        <div class="group relative p-7 sm:p-8 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between border-b border-zinc-800 md:border-b-0 ${idx < channels.length - (channels.length % 3 || 3) ? 'lg:border-b lg:border-zinc-800' : ''} ${idx % 3 !== 2 ? 'lg:border-r lg:border-zinc-800' : ''} ${idx % 2 === 0 ? 'md:max-lg:border-r md:max-lg:border-zinc-800' : ''} ${idx < channels.length - (channels.length % 2 || 2) ? 'md:max-lg:border-b md:max-lg:border-zinc-800' : ''}">
          
          <!-- Link principal de clique que cobre o card inteiro (exceto o botão de favoritar) -->
          <a href="${c.url}" target="_blank" class="absolute inset-0 z-0" aria-label="Abrir canal ${c.name}"></a>

          <div class="space-y-4 relative z-10 pointer-events-none">
            <!-- Topo do card: Avatar à esquerda, Botão de Favoritar à direita -->
            <div class="flex items-start justify-between gap-4">
              <!-- Avatar oficial em alta resolução com fallback seguro -->
              <div class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img src="${avatar}" alt="${c.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=youtube.com&sz=128'">
              </div>

              <!-- Botão de Salvar/Favoritar (com pointer-events-auto para capturar clique sem abrir o link) -->
              <button type="button" onclick="event.stopPropagation(); this.classList.toggle('text-rose-500'); this.classList.toggle('text-zinc-600');" class="pointer-events-auto w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:bg-zinc-800/60 transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100" title="Salvar na minha lista">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
              </button>
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center gap-1.5">
                <h2 class="text-base font-bold tracking-tight text-zinc-100 group-hover:text-purple-300 transition-colors truncate">
                  ${title}
                </h2>
                <!-- Micro-seta elegante que desliza suavemente no hover -->
                <svg class="w-3.5 h-3.5 text-zinc-600 group-hover:text-purple-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
              </div>

              <!-- Altura fixa travada para a descrição (h-10) garante alinhamento pixel-perfect das tags -->
              <p class="text-sm text-zinc-400 leading-relaxed line-clamp-2 h-10 overflow-hidden">
                ${desc}
              </p>
            </div>
          </div>

          <!-- Rodapé com tags em duas linhas alinhadas -->
          <div class="pt-6 space-y-2.5 relative z-10 pointer-events-none">
            <!-- 1ª Linha: Categorias temáticas -->
            <div class="flex flex-wrap gap-1.5 items-center min-h-[22px]">
              ${tagBadges}
            </div>
            <!-- 2ª Linha: Suporte textual (Legendas) + Ritmo da fala -->
            <div class="flex flex-wrap gap-1.5 items-center min-h-[22px]">
              ${subtitleBadge}
              ${paceBadge}
            </div>
          </div>
        </div>`;
  }).join('');

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
        ${channels.length} canais disponíveis
      </div>
    </div>

    <!-- GRADE CONECTADA (4PX GRID: P-7 / P-8, AVATAR 48PX, TITLES 16PX, DESCRIPTIONS 14PX LINE-CLAMP-2 + TAGS NO RODAPÉ) -->
    <div class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      ${cardsHtml}
    </div>

  </div>

</body>
</html>`;

  fs.writeFileSync('preview.html', html, 'utf-8');
  console.log("preview.html atualizado com sucesso!");
}

updatePreviewWithTags();
