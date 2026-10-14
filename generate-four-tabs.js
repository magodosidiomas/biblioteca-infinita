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

async function generateFourTabDesigns() {
  console.log("Gerando 4 designs distintos de navegação/tabs para tipo de conteúdo...");

  const existingPreview = fs.readFileSync('preview.html', 'utf-8');
  const avatarMatches = [...existingPreview.matchAll(/img src="([^"]+)"/g)].map(m => m[1]);
  const descMatches = [...existingPreview.matchAll(/line-clamp-2">\s*([\s\S]*?)\s*<\/p>/g)].map(m => m[1]);
  const titleMatches = [...existingPreview.matchAll(/text-base font-bold[^>]*>\s*([\s\S]*?)\s*<\/h2>/g)].map(m => m[1]);

  function renderCard(c, idx, totalCount) {
    const avatar = avatarMatches[idx % 9] || 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128';
    const title = titleMatches[idx % 9] || c.name;
    const desc = descMatches[idx % 9] || 'Conteúdo autêntico selecionado para imersão natural no idioma.';

    const tagBadges = c.tags.map(t => `
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-[#1e1528] text-purple-300/80 border border-purple-900/40">
        ${t}
      </span>
    `).join('');

    const isNoSubtitle = c.subtitleTag === "Sem legendas";
    const subtitleBadge = `
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${isNoSubtitle ? 'bg-[#121215] text-zinc-600 border border-zinc-800/60' : 'bg-[#18181b] text-zinc-400 border border-zinc-800'}">
        ${c.subtitleTag}
      </span>
    `;

    const paceBadge = `
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-[#18181b] text-zinc-400 border border-zinc-800">
        ${c.paceTag}
      </span>
    `;

    return `
      <div class="channel-card group relative p-7 sm:p-8 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between border-b border-zinc-800 md:border-b-0 ${idx < totalCount - (totalCount % 3 || 3) ? 'lg:border-b lg:border-zinc-800' : ''} ${idx % 3 !== 2 ? 'lg:border-r lg:border-zinc-800' : ''} ${idx % 2 === 0 ? 'md:max-lg:border-r md:max-lg:border-zinc-800' : ''} ${idx < totalCount - (totalCount % 2 || 2) ? 'md:max-lg:border-b md:max-lg:border-zinc-800' : ''}">
        <a href="${c.url}" target="_blank" class="absolute inset-0 z-0" aria-label="Abrir ${c.name}"></a>

        <div class="space-y-4 relative z-10 pointer-events-none">
          <div class="flex items-start justify-between gap-4">
            <div class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img src="${avatar}" alt="${c.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=youtube.com&sz=128'">
            </div>

            <button type="button" onclick="event.stopPropagation(); this.classList.toggle('heart-active');" class="pointer-events-auto w-8 h-8 rounded-lg border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 active:scale-90 transition-all duration-200" title="Salvar na minha lista">
              <svg class="transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </button>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center gap-1.5">
              <h2 class="text-base font-bold tracking-tight text-zinc-100 group-hover:text-purple-300 transition-colors truncate">
                ${title}
              </h2>
              <svg class="w-3.5 h-3.5 text-zinc-600 group-hover:text-purple-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </div>

            <p class="text-sm text-zinc-400 leading-relaxed line-clamp-2 h-10 overflow-hidden">
              ${desc}
            </p>
          </div>
        </div>

        <div class="pt-6 space-y-2.5 relative z-10 pointer-events-none">
          <div class="flex flex-wrap gap-1.5 items-center min-h-[22px]">
            ${tagBadges}
          </div>
          <div class="flex flex-wrap gap-1.5 items-center min-h-[22px]">
            ${subtitleBadge}
            ${paceBadge}
          </div>
        </div>
      </div>`;
  }

  // Cards para preview abaixo das tabs
  const cardsHtml = channels.slice(0, 3).map((c, i) => renderCard(c, i, 3)).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biblioteca de Imersão — 4 Conceitos de Navegação/Tabs</title>
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
    .heart-active {
      color: #f43f5e !important;
      border-color: rgba(225, 29, 72, 0.4) !important;
      background-color: rgba(136, 19, 55, 0.25) !important;
    }
    .heart-active svg {
      transform: scale(1.15);
      fill: #f43f5e;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="min-h-screen bg-[#09090b] text-zinc-100 p-6 sm:p-12 selection:bg-purple-900 selection:text-white space-y-20">

  <div class="max-w-5xl mx-auto space-y-20">

    <div class="space-y-2">
      <div class="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400">
        <span>🧙🏻‍♂️</span>
        <span>Biblioteca de Imersão · Exploração de Navegação</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
        4 Abordagens para Filtrar Tipo de Conteúdo
      </h1>
      <p class="text-sm text-zinc-400 max-w-2xl">
        Cada opção resolve a navegação entre YouTube, Podcasts e Streaming de forma diferente. Role a página para comparar o peso visual e a ergonomia de cada uma.
      </p>
    </div>

    <!-- ========================================== -->
    <!-- CONCEITO 1: SEGMENTED PILL SWITCHER        -->
    <!-- ========================================== -->
    <section class="space-y-6 p-8 rounded-2xl border border-zinc-800 bg-[#0c0c0e]">
      <div class="space-y-1">
        <span class="text-xs font-mono font-semibold text-purple-400">CONCEITO 1 · O MAIS NATIVO (LINEAR / RAYCAST STYLE)</span>
        <h2 class="text-xl font-bold text-zinc-100">Segmented Control Isolado</h2>
        <p class="text-xs text-zinc-400">Uma "cápsula" segmentada e elegante que agrupa as opções em bloco único com contagem sutil de itens.</p>
      </div>

      <!-- Search + Segmented Control -->
      <div class="space-y-4">
        <!-- Barra de busca -->
        <div class="w-full relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input type="text" placeholder="Buscar canal, assunto ou criador..." class="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700">
        </div>

        <!-- Segmented Control Bar -->
        <div class="inline-flex items-center p-1 rounded-xl bg-[#141417] border border-zinc-800/80 gap-1 overflow-x-auto no-scrollbar max-w-full">
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-100 shadow-sm flex items-center gap-2">
            <span>Todos</span>
            <span class="text-[10px] text-zinc-400 font-mono px-1.5 py-0.2 bg-zinc-900 rounded">123</span>
          </button>
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors flex items-center gap-2">
            <span>YouTube</span>
            <span class="text-[10px] text-zinc-500 font-mono px-1.5 py-0.2 bg-zinc-900/60 rounded">64</span>
          </button>
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors flex items-center gap-2">
            <span>Podcasts</span>
            <span class="text-[10px] text-zinc-500 font-mono px-1.5 py-0.2 bg-zinc-900/60 rounded">28</span>
          </button>
          <button class="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 transition-colors flex items-center gap-2">
            <span>Séries & Filmes</span>
            <span class="text-[10px] text-zinc-500 font-mono px-1.5 py-0.2 bg-zinc-900/60 rounded">16</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- CONCEITO 2: SEARCH INLINE COM TABS NO TOPO -->
    <!-- ========================================== -->
    <section class="space-y-6 p-8 rounded-2xl border border-zinc-800 bg-[#0c0c0e]">
      <div class="space-y-1">
        <span class="text-xs font-mono font-semibold text-purple-400">CONCEITO 2 · O MAIS MINIMALISTA (SUBSTACK / MEDIUM STYLE)</span>
        <h2 class="text-xl font-bold text-zinc-100">Abas Tipográficas com Indicador Inferior (Underline Tabs)</h2>
        <p class="text-xs text-zinc-400">Zero caixas ou cápsulas. Apenas texto puro com linha indicadora de estado ativo, respirando sobre a busca.</p>
      </div>

      <div class="space-y-5">
        <!-- Underline Tabs -->
        <div class="flex items-center gap-6 border-b border-zinc-800/80 overflow-x-auto no-scrollbar">
          <button class="pb-3 text-sm font-semibold text-purple-400 border-b-2 border-purple-500 flex items-center gap-2 whitespace-nowrap">
            <span>Todos os conteúdos</span>
          </button>
          <button class="pb-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-2 whitespace-nowrap">
            <span>YouTube</span>
          </button>
          <button class="pb-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-2 whitespace-nowrap">
            <span>Podcasts</span>
          </button>
          <button class="pb-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-2 whitespace-nowrap">
            <span>Séries & Filmes</span>
          </button>
        </div>

        <!-- Barra de busca abaixo das tabs -->
        <div class="w-full relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input type="text" placeholder="Buscar canal, assunto ou criador..." class="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700">
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- CONCEITO 3: SPLIT HEADER (HORIZONTAL ROW)  -->
    <!-- ========================================== -->
    <section class="space-y-6 p-8 rounded-2xl border border-zinc-800 bg-[#0c0c0e]">
      <div class="space-y-1">
        <span class="text-xs font-mono font-semibold text-purple-400">CONCEITO 3 · O MAIS COMPACTO (TOOLBAR PATTERN)</span>
        <h2 class="text-xl font-bold text-zinc-100">Barra Unificada (Search à Esquerda + Chips à Direita)</h2>
        <p class="text-xs text-zinc-400">Em vez de empilhar elementos, coloca a busca e os tipos de conteúdo lado a lado em uma única linha horizontal.</p>
      </div>

      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <!-- Busca flexível à esquerda -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input type="text" placeholder="Buscar canal, assunto ou criador..." class="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700">
        </div>

        <!-- Chips soltos à direita -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button class="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-100 border border-zinc-700/60 shadow-sm whitespace-nowrap">
            Todos
          </button>
          <button class="px-3 py-2 rounded-xl text-xs font-medium bg-[#141417] text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 whitespace-nowrap transition-colors">
            YouTube
          </button>
          <button class="px-3 py-2 rounded-xl text-xs font-medium bg-[#141417] text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 whitespace-nowrap transition-colors">
            Podcasts
          </button>
          <button class="px-3 py-2 rounded-xl text-xs font-medium bg-[#141417] text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 whitespace-nowrap transition-colors">
            Séries
          </button>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- CONCEITO 4: CHIPS COM ÍCONES SUTIS         -->
    <!-- ========================================== -->
    <section class="space-y-6 p-8 rounded-2xl border border-zinc-800 bg-[#0c0c0e]">
      <div class="space-y-1">
        <span class="text-xs font-mono font-semibold text-purple-400">CONCEITO 4 · O MAIS EXPRESSIVO (APP STORE / AIRBNB STYLE)</span>
        <h2 class="text-xl font-bold text-zinc-100">Chips de Pílula com Micro-Ícones</h2>
        <p class="text-xs text-zinc-400">Pílulas horizontais bem espaçadas com ícones nítidos que comunicam o meio de consumo instantaneamente.</p>
      </div>

      <div class="space-y-4">
        <!-- Barra de busca -->
        <div class="w-full relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input type="text" placeholder="Buscar canal, assunto ou criador..." class="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700">
        </div>

        <!-- Chips de Pílula -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button class="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-950 flex items-center gap-1.5 shadow-sm whitespace-nowrap">
            <span>✨</span> <span>Todos</span>
          </button>
          <button class="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#141417] text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 whitespace-nowrap transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> <span>YouTube</span>
          </button>
          <button class="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#141417] text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 whitespace-nowrap transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> <span>Podcasts</span>
          </button>
          <button class="px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#141417] text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 whitespace-nowrap transition-colors">
            <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span> <span>Séries & Streaming</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Preview da grade conectada logo abaixo para ver o contexto real -->
    <div class="space-y-4 pt-4 border-t border-zinc-800/80">
      <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Contexto dos Cards Abaixo da Navegação
      </div>
      <div class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        ${cardsHtml}
      </div>
    </div>

  </div>

</body>
</html>`;

  fs.writeFileSync('preview.html', html, 'utf-8');
  console.log("preview.html gerado com os 4 conceitos de navegação!");
}

generateFourTabDesigns();
