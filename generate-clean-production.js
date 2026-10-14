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

async function generateCleanProductionView() {
  console.log("Unificando no layout vencedor (Variação A) com dropdowns de Legendas, Ritmo e Favoritos corretos...");

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

            <button type="button" onclick="event.stopPropagation(); this.classList.toggle('heart-active'); updateFavoritesCount();" class="pointer-events-auto w-8 h-8 rounded-lg border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 active:scale-90 transition-all duration-200" title="Salvar nos favoritos">
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

  const cardsHtml = channels.map((c, i) => renderCard(c, i, channels.length)).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biblioteca de Imersão — Francês</title>
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
    .filter-active {
      background-color: rgba(147, 51, 234, 0.15) !important;
      color: #d8b4fe !important;
      border-color: rgba(147, 51, 234, 0.4) !important;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  </style>
</head>
<body class="min-h-screen bg-[#09090b] text-zinc-100 p-6 sm:p-12 selection:bg-purple-900 selection:text-white">

  <div class="max-w-5xl mx-auto space-y-7">

    <!-- CABEÇALHO -->
    <header class="space-y-6 pt-2">
      
      <!-- Título & Subtítulo -->
      <div class="space-y-1.5">
        <div class="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400">
          <span>🧙🏻‍♂️</span>
          <span>Biblioteca de Imersão · Francês</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
          Explorar Conteúdos
        </h1>
        <p class="text-sm text-zinc-400">
          Curadoria de materiais autênticos recomendados para prática e imersão natural.
        </p>
      </div>

      <!-- NAVEGAÇÃO REFINADA (TABS FLUTUANTES + BUSCA + FILTROS COM DROPDOWN) -->
      <div class="space-y-3.5">
        
        <!-- Tabs Flutuantes (Fundo apenas na ativa) -->
        <div class="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-colors">
            Todos
          </button>
          <button class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60 transition-colors">
            YouTube
          </button>
          <button class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-colors">
            Podcasts
          </button>
          <button class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-colors">
            Séries & Filmes
          </button>
          <button class="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-colors">
            Leitura & Textos
          </button>
        </div>

        <!-- Barra de busca full-width -->
        <div class="w-full relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <input 
            id="search-input" 
            type="text" 
            placeholder="Buscar canais no YouTube..." 
            class="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors shadow-sm"
            oninput="handleSearch(this.value)"
          >
        </div>

        <!-- BARRA DE FILTROS COM DROPDOWNS SUTIS -->
        <div class="flex flex-wrap items-center gap-2 pt-0.5">
          
          <!-- 1. Dropdown de Tema com botão de limpar individual -->
          <div class="relative flex items-center">
            <div id="btn-tema-group" class="inline-flex items-center rounded-lg bg-[#141417] border border-zinc-800 hover:border-zinc-700 transition-colors">
              <button onclick="toggleDropdown('dropdown-tema')" id="btn-tema" class="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5">
                <span id="label-tema">Tema</span>
                <svg class="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
              </button>
              <button onclick="clearSingleFilter('tema', event)" id="clear-tema" class="hidden pr-2 pl-0.5 text-zinc-500 hover:text-zinc-200" title="Limpar tema">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div id="dropdown-tema" class="dropdown-menu hidden absolute left-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-50 space-y-0.5">
              <button onclick="selectFilter('tema', 'Todos')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800/80 rounded-lg">Todos os temas</button>
              <button onclick="selectFilter('tema', 'Cultura')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg flex justify-between"><span>Cultura</span><span class="text-zinc-600 font-mono text-[10px]">3</span></button>
              <button onclick="selectFilter('tema', 'História')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg flex justify-between"><span>História</span><span class="text-zinc-600 font-mono text-[10px]">2</span></button>
              <button onclick="selectFilter('tema', 'Humor')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg flex justify-between"><span>Humor</span><span class="text-zinc-600 font-mono text-[10px]">1</span></button>
              <button onclick="selectFilter('tema', 'Linguística')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg flex justify-between"><span>Linguística</span><span class="text-zinc-600 font-mono text-[10px]">1</span></button>
            </div>
          </div>

          <!-- 2. Dropdown de Legendas com botão de limpar individual -->
          <div class="relative flex items-center">
            <div id="btn-legendas-group" class="inline-flex items-center rounded-lg bg-[#141417] border border-zinc-800 hover:border-zinc-700 transition-colors">
              <button onclick="toggleDropdown('dropdown-legendas')" id="btn-legendas" class="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5">
                <span id="label-legendas">Legendas</span>
                <svg class="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
              </button>
              <button onclick="clearSingleFilter('legendas', event)" id="clear-legendas" class="hidden pr-2 pl-0.5 text-zinc-500 hover:text-zinc-200" title="Limpar legenda">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div id="dropdown-legendas" class="dropdown-menu hidden absolute left-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-50 space-y-0.5">
              <button onclick="selectFilter('legendas', 'Todas')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800/80 rounded-lg">Todas as opções</button>
              <button onclick="selectFilter('legendas', 'Legendas CC')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Legendas CC</button>
              <button onclick="selectFilter('legendas', 'Legendas fixas')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Legendas no vídeo</button>
              <button onclick="selectFilter('legendas', 'Legendas bilíngues')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Legendas bilíngues</button>
              <button onclick="selectFilter('legendas', 'Sem legendas')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Sem legendas</button>
            </div>
          </div>

          <!-- 3. Dropdown de Velocidade da Fala com botão de limpar individual -->
          <div class="relative flex items-center">
            <div id="btn-velocidade-group" class="inline-flex items-center rounded-lg bg-[#141417] border border-zinc-800 hover:border-zinc-700 transition-colors">
              <button onclick="toggleDropdown('dropdown-velocidade')" id="btn-velocidade" class="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5">
                <span id="label-velocidade">Velocidade da fala</span>
                <svg class="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
              </button>
              <button onclick="clearSingleFilter('velocidade', event)" id="clear-velocidade" class="hidden pr-2 pl-0.5 text-zinc-500 hover:text-zinc-200" title="Limpar velocidade">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div id="dropdown-velocidade" class="dropdown-menu hidden absolute left-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-50 space-y-0.5">
              <button onclick="selectFilter('velocidade', 'Todas')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800/80 rounded-lg">Qualquer velocidade</button>
              <button onclick="selectFilter('velocidade', 'Fala pausada')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Fala pausada</button>
              <button onclick="selectFilter('velocidade', 'Fala natural')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Fala natural</button>
              <button onclick="selectFilter('velocidade', 'Fala rápida')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Fala rápida</button>
            </div>
          </div>

          <!-- 4. Chip de Favoritos Limpo -->
          <button onclick="toggleFavoritesOnly(this)" id="btn-favoritos" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141417] text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5 transition-colors">
            <svg class="w-3.5 h-3.5 text-zinc-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            <span>Favoritos</span>
          </button>

          <!-- 5. Botão Global 'Limpar Filtros' (Aparece somente quando há filtros ativos) -->
          <button onclick="clearAllFilters()" id="btn-clear-all" class="hidden text-xs text-zinc-500 hover:text-zinc-200 hover:underline px-2 py-1.5 transition-colors ml-1">
            Limpar filtros
          </button>

        </div>

      </div>

    </header>

    <!-- GRADE CONECTADA (3X3) -->
    <div id="cards-grid" class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      ${cardsHtml}
    </div>

    <!-- FEEDBACK DE BUSCA VAZIA -->
    <div id="no-results" class="hidden py-16 text-center space-y-2">
      <p class="text-sm text-zinc-400">Nenhum canal encontrado para os filtros selecionados.</p>
    </div>

  </div>

  <script>
    // Gerenciador de Dropdowns
    function toggleDropdown(id) {
      event.stopPropagation();
      const menu = document.getElementById(id);
      const isHidden = menu.classList.contains('hidden');
      document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
      if (isHidden) {
        menu.classList.remove('hidden');
      }
    }

    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.add('hidden'));
    });

    // Contador de Favoritos Interativo
    function updateFavoritesCount() {
      const activeCount = document.querySelectorAll('.heart-active').length;
      const countEl = document.getElementById('fav-count');
      countEl.textContent = activeCount;
      if (activeCount > 0) {
        countEl.className = 'text-[10px] text-rose-400 font-mono font-semibold';
      } else {
        countEl.className = 'text-[10px] text-zinc-600 font-mono';
      }
    }

    // Toggle de visualização só de favoritos
    function toggleFavoritesOnly(btn) {
      btn.classList.toggle('filter-active');
      const isFilterActive = btn.classList.contains('filter-active');
      const heartIcon = btn.querySelector('svg');
      
      if (isFilterActive) {
        heartIcon.classList.add('fill-rose-500', 'text-rose-500');
      } else {
        heartIcon.classList.remove('fill-rose-500', 'text-rose-500');
      }
    }

    // Gerenciador de Seleção de Filtros
    function selectFilter(category, value) {
      const label = document.getElementById('label-' + category);
      const group = document.getElementById('btn-' + category + '-group');
      const clearBtn = document.getElementById('clear-' + category);
      
      const defaultLabels = { tema: 'Tema', legendas: 'Legendas', velocidade: 'Velocidade da fala' };
      const isDefault = (value === 'Todos' || value === 'Todas' || value === 'Qualquer velocidade');

      if (isDefault) {
        label.textContent = defaultLabels[category];
        group.classList.remove('filter-active');
        clearBtn.classList.add('hidden');
      } else {
        label.textContent = value;
        group.classList.add('filter-active');
        clearBtn.classList.remove('hidden');
      }
      checkActiveFilters();
    }

    // Limpar filtro individual através do 'x'
    function clearSingleFilter(category, event) {
      event.stopPropagation();
      const defaultLabels = { tema: 'Tema', legendas: 'Legendas', velocidade: 'Velocidade da fala' };
      const label = document.getElementById('label-' + category);
      const group = document.getElementById('btn-' + category + '-group');
      const clearBtn = document.getElementById('clear-' + category);

      label.textContent = defaultLabels[category];
      group.classList.remove('filter-active');
      clearBtn.classList.add('hidden');
      checkActiveFilters();
    }

    // Limpar TODOS os filtros de uma vez
    function clearAllFilters() {
      ['tema', 'legendas', 'velocidade'].forEach(cat => {
        const defaultLabels = { tema: 'Tema', legendas: 'Legendas', velocidade: 'Velocidade da fala' };
        document.getElementById('label-' + cat).textContent = defaultLabels[cat];
        document.getElementById('btn-' + cat + '-group').classList.remove('filter-active');
        document.getElementById('clear-' + cat).classList.add('hidden');
      });

      const favBtn = document.getElementById('btn-favoritos');
      favBtn.classList.remove('filter-active');
      favBtn.querySelector('svg').classList.remove('fill-rose-500', 'text-rose-500');

      document.getElementById('search-input').value = '';
      handleSearch('');
      checkActiveFilters();
    }

    function checkActiveFilters() {
      const hasActive = document.querySelectorAll('.filter-active').length > 0;
      const clearAllBtn = document.getElementById('btn-clear-all');
      if (hasActive) {
        clearAllBtn.classList.remove('hidden');
      } else {
        clearAllBtn.classList.add('hidden');
      }
    }

    // Busca interativa client-side em tempo real
    function handleSearch(query) {
      const q = query.toLowerCase().trim();
      const cards = document.querySelectorAll('.channel-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(q)) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const noResults = document.getElementById('no-results');
      if (visibleCount === 0) {
        noResults.classList.remove('hidden');
      } else {
        noResults.classList.add('hidden');
      }
    }
  </script>

</body>
</html>`;

  fs.writeFileSync('preview.html', html, 'utf-8');
  console.log("preview.html gerado com dropdowns limpos e favoritos funcionais!");
}

generateCleanProductionView();
