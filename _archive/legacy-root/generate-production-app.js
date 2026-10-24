const fs = require('fs');

const realAvatars = JSON.parse(fs.readFileSync('real-avatars.json', 'utf-8'));
const podcasts = JSON.parse(fs.readFileSync('podcasts-data.json', 'utf-8'));
const series = JSON.parse(fs.readFileSync('series-data.json', 'utf-8'));

const ytDescriptions = JSON.parse(fs.readFileSync('youtube-descriptions.json', 'utf-8'));

const channels = [
  { 
    id: "easy_french", 
    name: "Easy French", 
    url: "https://www.youtube.com/@EasyFrench", 
    tags: ["Cultura", "Entrevistas"], 
    subtitleTag: "Legendas bilíngues", 
    paceTag: "Fala pausada",
    avatar: realAvatars["easy_french"],
    desc: ytDescriptions["easy_french"]
  },
  { 
    id: "piece_of_french", 
    name: "Piece of French", 
    url: "https://www.youtube.com/@PieceofFrench", 
    tags: ["Cotidiano", "Vlog"], 
    subtitleTag: "Legendas [CC]", 
    paceTag: "Fala pausada",
    avatar: realAvatars["piece_of_french"],
    desc: ytDescriptions["piece_of_french"]
  },
  { 
    id: "wandering_french", 
    name: "Wandering French", 
    url: "https://www.youtube.com/@WanderingFrench", 
    tags: ["Quebec", "Pronúncia"], 
    subtitleTag: "Legendas fixas", 
    paceTag: "Fala natural",
    avatar: realAvatars["wandering_french"],
    desc: ytDescriptions["wandering_french"]
  },
  { 
    id: "linguisticae", 
    name: "Linguisticae", 
    url: "https://www.youtube.com/@Linguisticae", 
    tags: ["Linguística", "História"], 
    subtitleTag: "Legendas [CC]", 
    paceTag: "Fala natural",
    avatar: realAvatars["linguisticae"],
    desc: ytDescriptions["linguisticae"]
  },
  { 
    id: "monde_langues", 
    name: "Le Monde des Langues", 
    url: "https://www.youtube.com/@MondelanguesFrblog", 
    tags: ["Poliglota", "Cultura"], 
    subtitleTag: "Sem legendas", 
    paceTag: "Fala natural",
    avatar: realAvatars["monde_langues"],
    desc: ytDescriptions["monde_langues"]
  },
  { 
    id: "cyprien", 
    name: "Cyprien", 
    url: "https://www.youtube.com/@cyprien", 
    tags: ["Humor", "Ficção"], 
    subtitleTag: "Legendas [CC]", 
    paceTag: "Fala rápida",
    avatar: realAvatars["cyprien"],
    desc: ytDescriptions["cyprien"]
  },
  { 
    id: "guillaume_ruchon", 
    name: "Guillaume Ruchon", 
    url: "https://www.youtube.com/@guiruch", 
    tags: ["Cinema", "Vlog"], 
    subtitleTag: "Sem legendas", 
    paceTag: "Fala natural",
    avatar: realAvatars["guillaume_ruchon"],
    desc: ytDescriptions["guillaume_ruchon"]
  },
  { 
    id: "nota_bene", 
    name: "Nota Bene", 
    url: "https://www.youtube.com/@notabenemovies", 
    tags: ["História", "Cultura"], 
    subtitleTag: "Legendas [CC]", 
    paceTag: "Fala natural",
    avatar: realAvatars["nota_bene"],
    desc: ytDescriptions["nota_bene"]
  },
  { 
    id: "trash", 
    name: "Trash", 
    url: "https://www.youtube.com/@trash", 
    tags: ["Curiosidades", "Humor"], 
    subtitleTag: "Sem legendas", 
    paceTag: "Fala rápida",
    avatar: realAvatars["trash"],
    desc: ytDescriptions["trash"]
  }
];

const languages = [
  { code: "fr", name: "Francês", flag: "🇫🇷" },
  { code: "ru", name: "Russo", flag: "🇷🇺" },
  { code: "en", name: "Inglês", flag: "🇬🇧" },
  { code: "de", name: "Alemão", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "es", name: "Espanhol", flag: "🇪🇸" },
  { code: "ja", name: "Japonês", flag: "🇯🇵" }
];

// Design de Card Aprovado (Seguindo Artcraft: Full-Width com dividers no mobile + Grade conectada no desktop)
function renderCard(item, idx, totalCount) {
  const tagBadges = item.tags.map(t => `
    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide bg-[#1e1528] text-purple-300/80 border border-purple-900/40">
      ${t}
    </span>
  `).join('');

  const isPodcast = item.format === 'Podcasts';
  const isSeries = item.format === 'Séries';
  
  let metaSecondary = item.subtitleTag;
  if (isPodcast) metaSecondary = item.transcriptTag;
  if (isSeries) metaSecondary = item.levelTag;

  let metaTertiary = item.paceTag;
  if (isSeries) metaTertiary = item.platformTag;

  const fallbackFavicon = isPodcast 
    ? 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128' 
    : isSeries 
      ? 'https://www.google.com/s2/favicons?domain=imdb.com&sz=128' 
      : 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128';

  // Séries usa pôster vertical 2:3 (w-12 h-18), Podcasts usa rounded-xl, YouTube usa rounded-full
  const thumbWrapClass = isSeries 
    ? 'w-12 h-18 aspect-[2/3] rounded-lg' 
    : isPodcast 
      ? 'w-12 h-12 rounded-xl' 
      : 'w-12 h-12 rounded-full';

  const subBadgeHtml = `<span class="px-2 py-0.5 rounded bg-[#18181b] text-zinc-400 border border-zinc-800">${metaSecondary}</span>`;
  const tertiaryBadgeHtml = metaTertiary ? `<span class="px-2 py-0.5 rounded bg-[#18181b] text-zinc-400 border border-zinc-800">${metaTertiary}</span>` : '';
  const extraPaceHtml = isSeries ? `<span class="px-2 py-0.5 rounded bg-[#18181b] text-zinc-400 border border-zinc-800">${item.paceTag}</span>` : '';

  return `
    <article data-format="${item.format}" data-title="${item.name.toLowerCase()}" data-theme="${item.tags.join(' ').toLowerCase()}" data-sub="${metaSecondary}" data-pace="${item.paceTag}" class="channel-card group relative p-6 sm:p-7 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between border-b border-zinc-800 last:border-b-0 md:last:border-b ${idx < totalCount - (totalCount % 3 || 3) ? 'lg:border-b lg:border-zinc-800' : ''} ${idx % 3 !== 2 ? 'lg:border-r lg:border-zinc-800' : ''} ${idx % 2 === 0 ? 'md:max-lg:border-r md:max-lg:border-zinc-800' : ''} ${idx < totalCount - (totalCount % 2 || 2) ? 'md:max-lg:border-b md:max-lg:border-zinc-800' : ''}">
      <a href="${item.url}" target="_blank" class="absolute inset-0 z-0" aria-label="Abrir ${item.name}"></a>

      <div class="space-y-4 relative z-10 pointer-events-none">
        <div class="flex items-start justify-between gap-4">
          <div class="${thumbWrapClass} bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
            <img src="${item.avatar}" alt="${item.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='${fallbackFavicon}'">
          </div>

          <button type="button" onclick="toggleCardFavorite(this, event)" class="pointer-events-auto heart-btn w-8 h-8 rounded-lg border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 active:scale-90 transition-all duration-200" title="Salvar nos favoritos">
            <svg class="transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </button>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center gap-1.5">
            <h2 class="text-base font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors truncate">
              ${item.name}
            </h2>
            <svg class="w-3.5 h-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </div>

          <p class="text-sm text-zinc-400 leading-relaxed line-clamp-2 h-10 overflow-hidden">
            ${item.desc}
          </p>
        </div>
      </div>

      <div class="pt-5 space-y-2.5 relative z-10 pointer-events-none">
        <div class="flex flex-wrap gap-1.5 items-center min-h-[22px]">
          ${tagBadges}
        </div>
        <div class="flex flex-wrap gap-1.5 items-center text-xs text-zinc-400 min-h-[22px]">
          ${subBadgeHtml}
          ${tertiaryBadgeHtml}
          ${extraPaceHtml}
        </div>
      </div>
    </article>`;
}

// Preparar catálogo unificado com tags de formato
const allItems = [
  ...channels.map(c => ({ ...c, format: 'YouTube' })),
  ...podcasts.map(p => ({ ...p, format: 'Podcasts' })),
  ...series.map(s => ({ ...s, format: 'Séries' }))
];

const cardsHtml = allItems.map((item, i) => renderCard(item, i, allItems.length)).join('');

const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biblioteca Infinita</title>
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
    .filter-pill-active {
      background-color: #1a1625 !important;
      color: #e9d5ff !important;
      border-color: rgba(168, 85, 247, 0.5) !important;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .animate-sheet-up {
      animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  </style>
</head>
<body class="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-purple-900 selection:text-white pb-20">

  <!-- ================= TOPNAV LIMPO (CONTEXTO GLOBAL E ESCALÁVEL) ================= -->
  <header id="app-header" class="sticky top-0 z-40 w-full border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur-md">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-2.5 flex-shrink-0">
        <span class="text-xl select-none">🧙🏻‍♂️</span>
        <span class="text-base font-bold tracking-tight text-zinc-100 whitespace-nowrap">Biblioteca Infinita</span>
      </div>

      <!-- Seletor de Idioma (Popover no Desktop / Bottom Sheet no Mobile) -->
      <div class="relative flex-shrink-0">
        <button id="btn-lang" onclick="handleLangClick(event)" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-[#141417] text-zinc-200 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all shadow-sm">
          <span id="current-lang-flag" class="text-lg leading-none">🇫🇷</span>
          <span id="current-lang-name" class="font-semibold text-zinc-100 text-sm">Francês</span>
          <svg class="w-3.5 h-3.5 text-zinc-500 transition-transform duration-200" id="lang-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
        </button>

        <!-- Popover Ancorado Exclusivo para Desktop (sm:block) -->
        <div id="lang-popover" onclick="event.stopPropagation()" class="hidden absolute right-0 top-full mt-2 w-56 rounded-2xl border border-zinc-800 bg-[#121215] p-2 shadow-2xl z-50 space-y-2">
          <input type="text" placeholder="Buscar idioma..." oninput="filterLanguages(this.value, 'lang-popover-list')" class="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 transition-colors">
          <div id="lang-popover-list" class="max-h-56 overflow-y-auto space-y-1 no-scrollbar p-0.5">
            ${languages.map(l => `
              <button onclick="changeLanguage('${l.name}', '${l.flag}')" class="w-full text-left px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 flex items-center gap-3 transition-colors">
                <span class="text-xl leading-none">${l.flag}</span>
                <span class="font-medium text-sm text-zinc-100">${l.name}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

    </div>
  </header>

  <!-- ================= CONTEÚDO PRINCIPAL (PADDING SUPERIOR ENXUTO: pt-3 sm:pt-4) ================= -->
  <main id="main-content" class="max-w-5xl mx-auto px-0 sm:px-6 pt-3 sm:pt-4 pb-12 space-y-4">

    <!-- CONTROLES COM RESPIRO LATERAL (px-4 no mobile, px-0 no desktop) -->
    <div id="controls-container" class="px-4 sm:px-0 space-y-3.5">
      
      <!-- Abas de Formato (Opção B Fixada: Tipográfica, Underline Violeta) -->
      <div id="variant-b-container">
        <div class="flex items-center gap-6 px-0.5 overflow-x-auto no-scrollbar">
          <button onclick="switchGlobalTab('YouTube')" data-tab="YouTube" class="var-b-btn pb-2 text-sm font-bold text-white border-b-2 border-purple-400 transition-all flex-shrink-0 whitespace-nowrap">
            YouTube
          </button>
          <button onclick="switchGlobalTab('Podcasts')" data-tab="Podcasts" class="var-b-btn pb-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all flex-shrink-0 whitespace-nowrap">
            Podcasts
          </button>
          <button onclick="switchGlobalTab('Séries')" data-tab="Séries" class="var-b-btn pb-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all flex-shrink-0 whitespace-nowrap">
            Séries
          </button>
          <button onclick="switchGlobalTab('Filmes')" data-tab="Filmes" class="var-b-btn pb-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all flex-shrink-0 whitespace-nowrap">
            Filmes
          </button>
          <button onclick="switchGlobalTab('Sites')" data-tab="Sites" class="var-b-btn pb-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent transition-all flex-shrink-0 whitespace-nowrap">
            Sites
          </button>
        </div>
      </div>

      <!-- Bloco de Refinamento (Busca + Filtros com ritmo de 12px entre si) -->
      <div class="space-y-3">
        <!-- Linha 2: Barra de Busca Fill-Container (text-sm, 14px, cantos refinados) -->
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <input 
            id="search-input" 
            type="text" 
            placeholder="Buscar canais..." 
            class="w-full bg-[#121215] border border-zinc-800 rounded-xl pl-10 pr-9 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all shadow-sm"
            oninput="handleSearchInput(this.value)"
          >
          <button id="search-clear-btn" onclick="clearSearch()" class="hidden absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-200" title="Limpar busca">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <!-- Linha 3: Barra de Filtros (Scroll suave no mobile, visível no desktop) -->
        <div class="flex items-center gap-1.5 overflow-x-auto sm:overflow-visible no-scrollbar py-0.5">

        <!-- Filtro Tema -->
        <div class="relative flex-shrink-0">
          <div id="pill-wrap-tema" class="inline-flex items-center rounded-xl bg-[#141417] border border-zinc-800 transition-colors">
            <button onclick="handleFilterClick('dropdown-tema', 'Tema', event)" class="px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap">
              <span id="label-tema">Tema</span>
              <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
            </button>
            <button id="pill-x-tema" onclick="setFilter('tema', null)" class="hidden pr-2.5 pl-0.5 py-1.5 text-zinc-400 hover:text-zinc-100" title="Limpar este filtro">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <!-- Popover Ancorado Desktop -->
          <div id="dropdown-tema" onclick="event.stopPropagation()" class="hidden absolute left-0 top-full mt-2 w-52 rounded-2xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-30 space-y-0.5">
            <button onclick="setFilter('tema', 'Cultura')" class="item-tema-cultura w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Cultura</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
            <button onclick="setFilter('tema', 'História')" class="item-tema-história w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>História</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
            <button onclick="setFilter('tema', 'Humor')" class="item-tema-humor w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Humor</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
            <button onclick="setFilter('tema', 'Linguística')" class="item-tema-linguística w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Linguística</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
            <button onclick="setFilter('tema', 'Cotidiano')" class="item-tema-cotidiano w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Cotidiano</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
            <button onclick="setFilter('tema', 'Cinema')" class="item-tema-cinema w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Cinema</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
          </div>
        </div>

        <!-- Filtro Legendas -->
        <div class="relative flex-shrink-0">
          <div id="pill-wrap-legendas" class="inline-flex items-center rounded-xl bg-[#141417] border border-zinc-800 transition-colors">
            <button onclick="handleFilterClick('dropdown-legendas', 'Legendas', event)" class="px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap">
              <span id="label-legendas">Legendas</span>
              <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
            </button>
            <button id="pill-x-legendas" onclick="setFilter('legendas', null)" class="hidden pr-2.5 pl-0.5 py-1.5 text-zinc-400 hover:text-zinc-100" title="Limpar este filtro">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <!-- Popover Ancorado Desktop -->
          <div id="dropdown-legendas" onclick="event.stopPropagation()" class="hidden absolute left-0 top-full mt-2 w-52 rounded-2xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-30 space-y-0.5">
            <!-- Opções YouTube -->
            <div id="legendas-yt-options" class="space-y-0.5">
              <button onclick="setFilter('legendas', 'Legendas [CC]')" class="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Legendas [CC]</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
              <button onclick="setFilter('legendas', 'Legendas fixas')" class="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Legendas fixas</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
              <button onclick="setFilter('legendas', 'Legendas bilíngues')" class="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Legendas bilíngues</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
              <button onclick="setFilter('legendas', 'Sem legendas')" class="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Sem legendas</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
            </div>
            <!-- Opções Podcasts -->
            <div id="legendas-podcast-options" class="hidden space-y-0.5">
              <button onclick="setFilter('legendas', 'Com transcrição')" class="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Com transcrição</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
              <button onclick="setFilter('legendas', 'Áudio nativo')" class="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Áudio nativo</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
            </div>
          </div>
        </div>

        <!-- Filtro Velocidade da Fala -->
        <div class="relative flex-shrink-0">
          <div id="pill-wrap-velocidade" class="inline-flex items-center rounded-xl bg-[#141417] border border-zinc-800 transition-colors">
            <button onclick="handleFilterClick('dropdown-velocidade', 'Velocidade', event)" class="px-3.5 py-1.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 flex items-center gap-1.5 whitespace-nowrap">
              <span id="label-velocidade">Velocidade da fala</span>
              <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
            </button>
            <button id="pill-x-velocidade" onclick="setFilter('velocidade', null)" class="hidden pr-2.5 pl-0.5 py-1.5 text-zinc-400 hover:text-zinc-100" title="Limpar este filtro">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <!-- Popover Ancorado Desktop -->
          <div id="dropdown-velocidade" onclick="event.stopPropagation()" class="hidden absolute left-0 top-full mt-2 w-52 rounded-2xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-30 space-y-0.5">
            <button onclick="setFilter('velocidade', 'Fala pausada')" class="item-velocidade-pausada w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Fala pausada</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
            <button onclick="setFilter('velocidade', 'Fala natural')" class="item-velocidade-natural w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Fala natural</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
            <button onclick="setFilter('velocidade', 'Fala rápida')" class="item-velocidade-rápida w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-xl flex items-center justify-between"><span>Fala rápida</span><span class="check hidden text-purple-400 font-semibold">✓</span></button>
          </div>
        </div>

        <!-- Toggle Favoritos (Hover e Ativo na paleta harmônica violeta/lavanda) -->
        <button id="btn-favoritos" onclick="toggleFavoritesFilter()" class="px-3.5 py-1.5 rounded-xl text-sm font-medium bg-[#141417] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 flex-shrink-0 whitespace-nowrap transition-all">
          <svg class="w-4 h-4 text-zinc-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          <span>Favoritos</span>
        </button>

        <!-- Botão Global Limpar Filtros -->
        <button id="btn-clear-all" onclick="resetAllFilters()" class="hidden text-sm text-zinc-400 hover:text-zinc-100 flex items-center gap-1.5 px-3 py-1.5 font-medium ml-auto flex-shrink-0 whitespace-nowrap transition-colors rounded-lg hover:bg-zinc-800/50">
          <svg class="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          <span>Limpar filtros</span>
        </button>

      </div>

    </div>

    <!-- ================= GRADE DE CARDS (PADRÃO ARTCRAFT: FULL WIDTH NO MOBILE COM DIVIDERS + GRADE CONECTADA NO DESKTOP) ================= -->
    <div id="cards-grid" class="w-full border-y sm:border border-zinc-800 sm:rounded-xl bg-[#09090b] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-hidden shadow-lg">
      ${cardsHtml}
    </div>

    <!-- ================= EMPTY STATE SEM CONTAINER (LIVRE NO CANVAS) ================= -->
    <div id="no-results" class="hidden py-24 sm:py-32 px-4 text-center max-w-sm mx-auto flex flex-col items-center justify-center">
      <div class="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-500 mb-4 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
          <path d="m8 11 6 0"/>
        </svg>
      </div>
      <h3 class="text-base font-semibold text-zinc-100 mb-1.5">
        Nenhum conteúdo encontrado
      </h3>
      <p class="text-xs text-zinc-400 leading-relaxed mb-5">
        Tente buscar por termos mais amplos ou limpe os filtros ativos.
      </p>
      <button onclick="resetAllFilters()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-200 hover:bg-zinc-700 active:scale-[0.98] transition-all shadow-sm">
        <span>Limpar filtros</span>
      </button>
    </div>

  </main>

  <!-- ================= BOTTOM SHEET EXCLUSIVO PARA MOBILE (< 640px) ================= -->
  <div id="mobile-bottom-sheet" class="hidden fixed inset-0 z-50 sm:hidden">
    <!-- Backdrop Blur -->
    <div onclick="closeMobileBottomSheet()" class="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"></div>
    
    <!-- Gaveta Inferior Estilo Imerso -->
    <div class="fixed bottom-0 inset-x-0 z-50 bg-[#121215] border-t border-zinc-800 rounded-t-3xl p-5 pb-8 space-y-4 max-h-[85vh] flex flex-col animate-sheet-up shadow-2xl">
      <!-- Drag Handle -->
      <div class="w-12 h-1.5 rounded-full bg-zinc-700/80 mx-auto mb-1 flex-shrink-0"></div>
      
      <!-- Cabeçalho -->
      <div class="flex items-center justify-between pb-2 border-b border-zinc-800/80 flex-shrink-0">
        <div>
          <h4 id="sheet-title" class="text-base font-bold text-zinc-100">Filtro</h4>
          <p id="sheet-subtitle" class="text-xs text-zinc-500">Selecione para refinar</p>
        </div>
        <button onclick="closeMobileBottomSheet()" class="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Barra de Pesquisa dentro do Sheet (ativada para idiomas) -->
      <div id="sheet-search-wrap" class="hidden flex-shrink-0">
        <input 
          id="sheet-search-input" 
          type="text" 
          placeholder="Buscar idioma..." 
          oninput="filterLanguages(this.value, 'sheet-options')" 
          class="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-colors"
        >
      </div>

      <!-- Lista de Opções Rolável (Touch target 48px) -->
      <div id="sheet-options" class="space-y-1.5 py-1 overflow-y-auto no-scrollbar flex-1"></div>

      <!-- Ações do Rodapé (Filtros normais) -->
      <div id="sheet-footer-actions" class="pt-2 flex items-center gap-3 flex-shrink-0">
        <button onclick="clearCurrentSheetFilter()" class="flex-1 py-3 rounded-xl text-sm font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-center">
          Limpar
        </button>
        <button onclick="closeMobileBottomSheet()" class="flex-1 py-3 rounded-xl text-sm font-semibold text-zinc-900 bg-zinc-100 hover:bg-white transition-colors text-center shadow-sm">
          Ver canais
        </button>
      </div>
    </div>
  </div>

  <!-- ================= JAVASCRIPT ================= -->
  <script>
    const filterConfigs = {
      'Idioma': {
        key: 'idioma',
        title: 'Selecionar Idioma',
        subtitle: 'Alterne o catálogo de imersão',
        isLang: true
      },
      'Tema': {
        key: 'tema',
        title: 'Filtrar por Tema',
        subtitle: 'Selecione um tópico de interesse',
        items: ['Cultura', 'História', 'Humor', 'Linguística', 'Cotidiano', 'Cinema']
      },
      'Legendas': {
        key: 'legendas',
        title: 'Filtrar por Legendas',
        subtitle: 'Tipo de legenda disponível nos vídeos',
        items: ['Legendas [CC]', 'Legendas fixas', 'Legendas bilíngues', 'Sem legendas']
      },
      'Velocidade': {
        key: 'velocidade',
        title: 'Velocidade da Fala',
        subtitle: 'Ritmo da dicção dos criadores',
        items: ['Fala pausada', 'Fala natural', 'Fala rápida']
      }
    };

    const state = {
      tema: null,
      legendas: null,
      velocidade: null,
      favoritosOnly: false,
      searchQuery: '',
      currentSheetCategory: 'tema',
      currentTab: 'YouTube',
      currentLang: 'Francês',
      currentFlag: '🇫🇷'
    };

    // Busca Inline
    function handleSearchInput(val) {
      state.searchQuery = val.trim();
      const clearBtn = document.getElementById('search-clear-btn');
      if (clearBtn) clearBtn.classList.toggle('hidden', val.trim().length === 0);
      applyAllFilters();
    }

    function clearSearch() {
      const input = document.getElementById('search-input');
      if (input) input.value = '';
      handleSearchInput('');
    }

    // Breakpoint Handler para Idioma
    function handleLangClick(event) {
      if (window.innerWidth < 640) {
        openMobileBottomSheet('Idioma');
      } else {
        toggleDropdown('lang-popover', event);
      }
    }

    // Breakpoint Handler para Filtros
    function handleFilterClick(popoverId, categoryLabel, event) {
      if (window.innerWidth < 640) {
        openMobileBottomSheet(categoryLabel);
      } else {
        toggleDropdown(popoverId, event);
      }
    }

    function toggleDropdown(id, event) {
      if (event) event.stopPropagation();
      const el = document.getElementById(id);
      if (!el) return;
      const isHidden = el.classList.contains('hidden');
      closeAllDropdowns();
      if (isHidden) {
        el.classList.remove('hidden');
        if (id === 'lang-popover') {
          document.getElementById('lang-chevron').classList.add('rotate-180');
        }
      }
    }

    function closeAllDropdowns() {
      document.querySelectorAll('#lang-popover, #dropdown-tema, #dropdown-legendas, #dropdown-velocidade').forEach(d => {
        d.classList.add('hidden');
      });
      const chev = document.getElementById('lang-chevron');
      if (chev) chev.classList.remove('rotate-180');
    }

    document.addEventListener('click', () => {
      closeAllDropdowns();
    });

    // Idiomas
    function changeLanguage(name, flag) {
      state.currentLang = name;
      state.currentFlag = flag;
      document.getElementById('current-lang-name').textContent = name;
      document.getElementById('current-lang-flag').textContent = flag;
      closeAllDropdowns();
      closeMobileBottomSheet();
    }

    function filterLanguages(val, containerId) {
      const q = val.toLowerCase().trim();
      const cont = document.getElementById(containerId);
      if (!cont) return;
      cont.querySelectorAll('button').forEach(b => {
        b.style.display = b.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
      });
    }

    // Alternância Unificada de Abas (Opção B adotada)
    function switchGlobalTab(tabName) {
      state.currentTab = tabName;

      document.querySelectorAll('.var-b-btn').forEach(btn => {
        const isMatch = btn.dataset.tab === tabName;
        btn.className = 'var-b-btn pb-2 text-sm transition-all ' +
          (isMatch 
            ? 'font-bold text-white border-b-2 border-purple-400' 
            : 'font-medium text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent');
      });

      const input = document.getElementById('search-input');
      if (input) input.placeholder = 'Buscar em ' + tabName + '...';

      // Atualizar label e opções do filtro de legendas/transcrição
      const labelLegendas = document.getElementById('label-legendas');
      const ytOpts = document.getElementById('legendas-yt-options');
      const podOpts = document.getElementById('legendas-podcast-options');

      // Se mudou de aba, limpar filtro de legendas caso não faça sentido
      if (state.legendas) {
        setFilter('legendas', null);
      }

      if (tabName === 'Podcasts') {
        if (labelLegendas) labelLegendas.textContent = 'Transcrição';
        if (ytOpts) ytOpts.classList.add('hidden');
        if (podOpts) podOpts.classList.remove('hidden');
        filterConfigs['Legendas'].title = 'Filtrar por Transcrição';
        filterConfigs['Legendas'].subtitle = 'Disponibilidade de texto ou áudio puro';
        filterConfigs['Legendas'].items = ['Com transcrição', 'Áudio nativo'];
      } else {
        if (labelLegendas) labelLegendas.textContent = 'Legendas';
        if (ytOpts) ytOpts.classList.remove('hidden');
        if (podOpts) podOpts.classList.add('hidden');
        filterConfigs['Legendas'].title = 'Filtrar por Legendas';
        filterConfigs['Legendas'].subtitle = 'Tipo de legenda disponível nos vídeos';
        filterConfigs['Legendas'].items = ['Legendas [CC]', 'Legendas fixas', 'Legendas bilíngues', 'Sem legendas'];
      }

      applyAllFilters();
    }

    // Função utilitária para normalizar acentos
    function normalizeStr(str) {
      return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    }

    // Filtros
    function setFilter(category, val) {
      if (state[category] === val) {
        val = null;
      }
      state[category] = val;

      const defaultNames = { 
        tema: 'Tema', 
        legendas: state.currentTab === 'Podcasts' ? 'Transcrição' : 'Legendas', 
        velocidade: 'Velocidade da fala' 
      };
      const label = document.getElementById('label-' + category);
      const pillWrap = document.getElementById('pill-wrap-' + category);
      const pillX = document.getElementById('pill-x-' + category);

      if (label && pillWrap && pillX) {
        if (val) {
          label.textContent = val;
          pillWrap.classList.add('filter-pill-active');
          pillX.classList.remove('hidden');
        } else {
          label.textContent = defaultNames[category];
          pillWrap.classList.remove('filter-pill-active');
          pillX.classList.add('hidden');
        }
      }

      updateOptionHighlights(category, val);
      closeAllDropdowns();
      applyAllFilters();
    }

    function updateOptionHighlights(category, activeVal) {
      const cont = document.getElementById('dropdown-' + category);
      if (!cont) return;
      cont.querySelectorAll('button').forEach(btn => {
        const spanText = btn.querySelector('span:first-child')?.textContent.trim();
        const checkIcon = btn.querySelector('.check');
        if (spanText && spanText === activeVal) {
          btn.classList.add('bg-purple-950/40', 'text-purple-200', 'font-medium');
          if (checkIcon) checkIcon.classList.remove('hidden');
        } else {
          btn.classList.remove('bg-purple-950/40', 'text-purple-200', 'font-medium');
          if (checkIcon) checkIcon.classList.add('hidden');
        }
      });
    }

    function toggleFavoritesFilter() {
      state.favoritosOnly = !state.favoritosOnly;
      const btn = document.getElementById('btn-favoritos');
      const icon = btn.querySelector('svg');
      btn.classList.toggle('filter-pill-active', state.favoritosOnly);
      icon.classList.toggle('fill-purple-400', state.favoritosOnly);
      icon.classList.toggle('text-purple-400', state.favoritosOnly);
      applyAllFilters();
    }

    function resetAllFilters() {
      setFilter('tema', null);
      setFilter('legendas', null);
      setFilter('velocidade', null);
      if (state.favoritosOnly) toggleFavoritesFilter();
      clearSearch();
      applyAllFilters();
    }

    function toggleCardFavorite(btn, event) {
      event.stopPropagation();
      btn.classList.toggle('heart-active');
      if (state.favoritosOnly) {
        applyAllFilters();
      }
    }

    function applyAllFilters() {
      const q = normalizeStr(state.searchQuery);
      const currentTab = state.currentTab;
      const cards = document.querySelectorAll('.channel-card');
      let visible = 0;

      cards.forEach(c => {
        const format = c.dataset.format;
        const titleNorm = normalizeStr(c.dataset.title);
        const themeNorm = normalizeStr(c.dataset.theme);
        const sub = c.dataset.sub;
        const pace = c.dataset.pace;
        const isFav = c.querySelector('.heart-btn').classList.contains('heart-active');

        const matchFormat = (format === currentTab);
        const matchSearch = !q || titleNorm.includes(q) || themeNorm.includes(q);
        const matchTheme = !state.tema || themeNorm.includes(normalizeStr(state.tema));
        const matchSub = !state.legendas || sub === state.legendas;
        const matchPace = !state.velocidade || pace === state.velocidade;
        const matchFav = !state.favoritosOnly || isFav;

        if (matchFormat && matchSearch && matchTheme && matchSub && matchPace && matchFav) {
          c.style.display = 'flex';
          visible++;
        } else {
          c.style.display = 'none';
        }
      });

      document.getElementById('no-results').classList.toggle('hidden', visible > 0);
      document.getElementById('cards-grid').classList.toggle('hidden', visible === 0);

      const hasAny = state.tema || state.legendas || state.velocidade || state.favoritosOnly || q.length > 0;
      document.getElementById('btn-clear-all').classList.toggle('hidden', !hasAny);
    }

    // ================= BOTTOM SHEET MOBILE (DESIGN IMERSO) =================
    function openMobileBottomSheet(categoryLabel) {
      closeAllDropdowns();
      const conf = filterConfigs[categoryLabel] || filterConfigs['Tema'];
      state.currentSheetCategory = conf.key;

      document.getElementById('sheet-title').textContent = conf.title;
      document.getElementById('sheet-subtitle').textContent = conf.subtitle;
      
      const searchWrap = document.getElementById('sheet-search-wrap');
      const footerActions = document.getElementById('sheet-footer-actions');
      const cont = document.getElementById('sheet-options');
      cont.innerHTML = '';

      if (conf.isLang) {
        searchWrap.classList.remove('hidden');
        footerActions.classList.add('hidden');
        document.getElementById('sheet-search-input').value = '';

        languages.forEach(l => {
          const isSelected = state.currentLang === l.name;
          const btn = document.createElement('button');
          btn.className = \`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium transition-all flex items-center justify-between \${
            isSelected ? 'bg-purple-950/40 text-purple-200 border border-purple-800/40' : 'text-zinc-200 hover:bg-zinc-800/60'
          }\`;
          btn.innerHTML = \`
            <span class="flex items-center gap-3.5">
              <span class="text-2xl leading-none">\${l.flag}</span>
              <span class="font-medium text-sm text-zinc-100">\${l.name}</span>
            </span>
            <span class="\${isSelected ? '' : 'hidden'} text-purple-400 font-bold">✓</span>
          \`;
          btn.onclick = () => changeLanguage(l.name, l.flag);
          cont.appendChild(btn);
        });
      } else {
        searchWrap.classList.add('hidden');
        footerActions.classList.remove('hidden');

        const currentVal = state[conf.key];
        conf.items.forEach(item => {
          const isSelected = currentVal === item;
          const btn = document.createElement('button');
          btn.className = \`w-full text-left px-4 py-3.5 rounded-2xl text-sm font-medium transition-all flex items-center justify-between \${
            isSelected ? 'bg-purple-950/40 text-purple-200 border border-purple-800/40' : 'text-zinc-200 hover:bg-zinc-800/60'
          }\`;
          btn.innerHTML = \`
            <span>\${item}</span>
            <span class="\${isSelected ? '' : 'hidden'} text-purple-400 font-bold">✓</span>
          \`;
          btn.onclick = () => {
            setFilter(conf.key, isSelected ? null : item);
            openMobileBottomSheet(categoryLabel);
          };
          cont.appendChild(btn);
        });
      }

      document.getElementById('mobile-bottom-sheet').classList.remove('hidden');
    }

    function closeMobileBottomSheet() {
      document.getElementById('mobile-bottom-sheet').classList.add('hidden');
    }

    function clearCurrentSheetFilter() {
      if (state.currentSheetCategory !== 'idioma') {
        setFilter(state.currentSheetCategory, null);
      }
      closeMobileBottomSheet();
    }

    // Inicialização da interface e ativação imediata dos filtros da aba inicial
    document.addEventListener('DOMContentLoaded', () => {
      applyAllFilters();
    });
    // Execução síncrona imediata caso o DOM já esteja pronto
    applyAllFilters();
  </script>

</body>
</html>`;

fs.writeFileSync('preview.html', fullHtml, 'utf-8');
console.log("preview.html gerado com sucesso: Opção A aplicada (Search inline com os filtros, abaixo das tabs)!");
