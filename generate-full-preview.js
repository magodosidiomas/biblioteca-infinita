const fs = require('fs');

const channels = [
  { id: "easy_french", name: "Easy French", type: "YouTube", url: "https://www.youtube.com/@EasyFrench", tags: ["Cultura", "Entrevistas"], subtitleTag: "Legendas bilíngues", paceTag: "Fala pausada" },
  { id: "piece_of_french", name: "Piece of French", type: "YouTube", url: "https://www.youtube.com/@PieceofFrench", tags: ["Cotidiano", "Vlog"], subtitleTag: "Legendas CC", paceTag: "Fala pausada" },
  { id: "wandering_french", name: "Wandering French", type: "YouTube", url: "https://www.youtube.com/@WanderingFrench", tags: ["Quebec", "Pronúncia"], subtitleTag: "Legendas fixas", paceTag: "Fala natural" },
  { id: "linguisticae", name: "Linguisticae", type: "YouTube", url: "https://www.youtube.com/@Linguisticae", tags: ["Linguística", "História"], subtitleTag: "Legendas CC", paceTag: "Fala natural" },
  { id: "innerfrench", name: "InnerFrench Podcast", type: "Podcast", url: "https://innerfrench.com", tags: ["Cultura", "Filosofia"], subtitleTag: "Com transcrição", paceTag: "Fala pausada" },
  { id: "cyprien", name: "Cyprien", type: "YouTube", url: "https://www.youtube.com/@cyprien", tags: ["Humor", "Ficção"], subtitleTag: "Legendas CC", paceTag: "Fala rápida" },
  { id: "lupin", name: "Lupin", type: "Netflix", url: "https://netflix.com", tags: ["Mistério", "Policial"], subtitleTag: "Legendas CC", paceTag: "Fala rápida" },
  { id: "nota_bene", name: "Nota Bene", type: "YouTube", url: "https://www.youtube.com/@notabenemovies", tags: ["História"], subtitleTag: "Legendas CC", paceTag: "Fala natural" },
  { id: "trash", name: "Trash", type: "YouTube", url: "https://www.youtube.com/@trash", tags: ["Curiosidades", "Pop"], subtitleTag: "Sem legendas", paceTag: "Fala rápida" }
];

async function generateFullAppPreview() {
  console.log("Gerando preview interativo com header, tabs, busca, filtros e toggle desktop/mobile...");

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
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide ${isNoSubtitle ? 'bg-[#121215] text-zinc-600 border border-zinc-800/60' : 'bg-[#18181b] text-zinc-300 border border-zinc-800'}">
        ${c.subtitleTag}
      </span>
    `;

    const paceBadge = `
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-[#18181b] text-zinc-400 border border-zinc-800">
        ${c.paceTag}
      </span>
    `;

    // Micro badge para identificar formato na aba mista
    let typeBadge = '';
    if (c.type === 'YouTube') {
      typeBadge = `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-950/30 border border-red-900/40 px-1.5 py-0.5 rounded">▶ YouTube</span>`;
    } else if (c.type === 'Podcast') {
      typeBadge = `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-1.5 py-0.5 rounded">🎙 Podcast</span>`;
    } else if (c.type === 'Netflix') {
      typeBadge = `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-950/30 border border-rose-900/40 px-1.5 py-0.5 rounded">🍿 Netflix</span>`;
    }

    return `
      <div data-type="${c.type}" class="channel-card group relative p-6 sm:p-7 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between border-b border-zinc-800 md:border-b-0 ${idx < totalCount - (totalCount % 3 || 3) ? 'lg:border-b lg:border-zinc-800' : ''} ${idx % 3 !== 2 ? 'lg:border-r lg:border-zinc-800' : ''} ${idx % 2 === 0 ? 'md:max-lg:border-r md:max-lg:border-zinc-800' : ''} ${idx < totalCount - (totalCount % 2 || 2) ? 'md:max-lg:border-b md:max-lg:border-zinc-800' : ''}">
        <a href="${c.url}" target="_blank" class="absolute inset-0 z-0" aria-label="Abrir ${c.name}"></a>

        <div class="space-y-4 relative z-10 pointer-events-none">
          <!-- Topo: Avatar e Formato à esquerda, Heart à direita -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img src="${avatar}" alt="${c.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=youtube.com&sz=128'">
              </div>
              <div class="media-type-indicator">
                ${typeBadge}
              </div>
            </div>

            <!-- Botão de Salvar Suavizado com feedback tátil e estado filled -->
            <button type="button" onclick="toggleSave(this, event)" class="pointer-events-auto save-btn w-8 h-8 rounded-lg border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 active:scale-90 transition-all duration-200" title="Salvar na minha lista">
              <svg class="heart-icon transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

        <div class="pt-5 space-y-2.5 relative z-10 pointer-events-none">
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

  const cardsHtml = channels.map((c, i) => renderCard(c, i, channels.length)).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biblioteca de Imersão — Protótipo de UX Completo</title>
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
      fill: #f43f5e !important;
      border-color: rgba(225, 29, 72, 0.4) !important;
      background-color: rgba(136, 19, 55, 0.25) !important;
    }
    .heart-active svg {
      transform: scale(1.15);
      fill: #f43f5e;
    }
    /* Estilo do container simulador mobile */
    .mobile-frame {
      max-width: 390px !important;
      margin: 0 auto !important;
      border: 8px solid #27272a;
      border-radius: 40px;
      padding: 16px 12px;
      background: #09090b;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .mobile-frame .grid {
      grid-template-columns: 1fr !important;
    }
    .mobile-frame .channel-card {
      border-right: none !important;
      border-bottom: 1px solid #27272a !important;
      padding: 20px 16px !important;
    }
    /* Hide scrollbars for chips */
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="min-h-screen bg-[#09090b] text-zinc-100 p-4 sm:p-10 selection:bg-purple-900 selection:text-white">

  <!-- BARRA DE CONTROLE DO PROTÓTIPO (TOGGLE VIEWPORT) -->
  <div class="max-w-6xl mx-auto mb-8 p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span class="text-xs font-semibold text-zinc-300">Simulador de Visualização</span>
    </div>
    <div class="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-1">
      <button onclick="setViewMode('desktop')" id="btn-desktop" class="px-3 py-1 text-xs font-medium rounded-md transition-colors bg-zinc-800 text-white">
        🖥 Desktop (3 Colunas)
      </button>
      <button onclick="setViewMode('mobile')" id="btn-mobile" class="px-3 py-1 text-xs font-medium rounded-md transition-colors text-zinc-400 hover:text-white">
        📱 Mobile View (390px)
      </button>
    </div>
  </div>

  <div id="main-container" class="max-w-6xl mx-auto space-y-8 transition-all duration-300">

    <!-- CABEÇALHO DA BIBLIOTECA -->
    <header class="space-y-6 border-b border-zinc-800/80 pb-6">
      
      <!-- Top Row: Logo + Seletor de Idiomas -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-sm">🧙🏻‍♂️</span>
            <span class="text-xs font-semibold text-zinc-400">Biblioteca de Imersão · Mago dos Idiomas</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
            Explorar Conteúdos
          </h1>
        </div>

        <!-- Seletor de Idioma Elegante -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 self-start sm:self-auto">
          <button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/60 text-purple-200 border border-purple-800/50 flex items-center gap-1.5 shadow-sm">
            <span>🇫🇷</span> <span>Francês</span>
          </button>
          <button class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 flex items-center gap-1.5 transition-colors">
            <span>🇷🇺</span> <span>Russo</span>
          </button>
          <button class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 flex items-center gap-1.5 transition-colors">
            <span>🇬🇧</span> <span>Inglês</span>
          </button>
        </div>
      </div>

      <!-- TABS DE FORMATO (YouTube, Podcasts, Streaming, Todos) -->
      <div class="flex items-center gap-2 border-b border-zinc-800/60 pb-3 overflow-x-auto no-scrollbar">
        <button onclick="setTab('all')" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors">
          Todos os Formatos
        </button>
        <button onclick="setTab('YouTube')" class="tab-btn active-tab px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-white border border-zinc-700/60 shadow-sm flex items-center gap-1.5">
          <span>▶</span> YouTube
        </button>
        <button onclick="setTab('Podcast')" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors flex items-center gap-1.5">
          <span>🎙</span> Podcasts
        </button>
        <button onclick="setTab('Netflix')" class="tab-btn px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors flex items-center gap-1.5">
          <span>🍿</span> Séries & Streaming
        </button>
      </div>

      <!-- BARRA DE BUSCA + CHIPS DE FILTRO RÁPIDO -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Input de Busca com ⌘K -->
        <div class="relative flex-1 max-w-md">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input type="text" placeholder="Buscar por canal, tema ou criador..." class="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-9 pr-14 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-600/70 focus:ring-1 focus:ring-purple-600/50 transition-colors">
          <div class="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd class="px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800 border border-zinc-700 rounded">⌘K</kbd>
          </div>
        </div>

        <!-- Chips de Filtros Rápidos de 1 Toque -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center gap-1.5 whitespace-nowrap transition-colors">
            <span>🏷</span> Tema ▾
          </button>
          <button class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center gap-1.5 whitespace-nowrap transition-colors">
            <span>💬</span> Com legendas CC
          </button>
          <button class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 flex items-center gap-1.5 whitespace-nowrap transition-colors">
            <span>🐢</span> Fala pausada
          </button>
          <button class="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 hover:border-rose-900/50 flex items-center gap-1.5 whitespace-nowrap transition-colors">
            <span>♥</span> Salvos (0)
          </button>
        </div>
      </div>

    </header>

    <!-- GRADE CONECTADA DE CARDS -->
    <div id="grid-element" class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      ${cardsHtml}
    </div>

    <!-- INFINITE SCROLL INDICATOR (SUAVE) -->
    <div class="py-10 text-center space-y-3">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-500 font-medium font-mono">
        <span class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
        9 de 9 conteúdos carregados · Fim da lista
      </div>
    </div>

  </div>

  <script>
    // Suavização do Coração
    function toggleSave(btn, event) {
      event.stopPropagation();
      btn.classList.toggle('heart-active');
    }

    // Toggle de Abas
    function setTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.className = 'tab-btn px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors';
      });
      event.target.closest('button').className = 'tab-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-white border border-zinc-700/60 shadow-sm flex items-center gap-1.5';

      // Filtra os cards visualmente
      const cards = document.querySelectorAll('.channel-card');
      const indicators = document.querySelectorAll('.media-type-indicator');

      cards.forEach(c => {
        if (tab === 'all') {
          c.style.display = 'flex';
        } else {
          c.style.display = (c.dataset.type === tab) ? 'flex' : 'none';
        }
      });

      // Oculta indicador de tipo quando a aba já for específica
      indicators.forEach(ind => {
        ind.style.display = (tab === 'all') ? 'block' : 'none';
      });
    }

    // Simulador Desktop vs Mobile View
    function setViewMode(mode) {
      const container = document.getElementById('main-container');
      const btnDesk = document.getElementById('btn-desktop');
      const btnMob = document.getElementById('btn-mobile');

      if (mode === 'mobile') {
        container.classList.add('mobile-frame');
        btnMob.className = 'px-3 py-1 text-xs font-medium rounded-md transition-colors bg-zinc-800 text-white';
        btnDesk.className = 'px-3 py-1 text-xs font-medium rounded-md transition-colors text-zinc-400 hover:text-white';
      } else {
        container.classList.remove('mobile-frame');
        btnDesk.className = 'px-3 py-1 text-xs font-medium rounded-md transition-colors bg-zinc-800 text-white';
        btnMob.className = 'px-3 py-1 text-xs font-medium rounded-md transition-colors text-zinc-400 hover:text-white';
      }
    }

    // Inicializa na aba YouTube (padrão)
    document.addEventListener('DOMContentLoaded', () => {
      // Inicia com tabs sincronizadas
      const indicators = document.querySelectorAll('.media-type-indicator');
      indicators.forEach(ind => ind.style.display = 'none');
    });
  </script>

</body>
</html>`;

  fs.writeFileSync('preview.html', html, 'utf-8');
  console.log("preview.html gerado com protótipo de UX completo!");
}

generateFullAppPreview();
