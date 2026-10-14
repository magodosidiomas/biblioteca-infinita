const fs = require('fs');

const channels = [
  { id: "easy_french", name: "Easy French", url: "https://www.youtube.com/@EasyFrench", tags: ["Cultura", "Entrevistas"], subtitleTag: "Legendas bilíngues", paceTag: "Fala pausada" },
  { id: "piece_of_french", name: "Piece of French", url: "https://www.youtube.com/@PieceofFrench", tags: ["Cotidiano", "Vlog"], subtitleTag: "Legendas CC", paceTag: "Fala pausada" },
  { id: "nota_bene", name: "Nota Bene", url: "https://www.youtube.com/@notabenemovies", tags: ["História"], subtitleTag: "Legendas CC", paceTag: "Fala natural" }
];

async function generateAllFilterPatternsComparison() {
  console.log("Gerando comparativo interativo de todos os padrões de filtros...");

  const existingPreview = fs.readFileSync('preview.html', 'utf-8');
  const avatarMatches = [...existingPreview.matchAll(/img src="([^"]+)"/g)].map(m => m[1]);
  const descMatches = [...existingPreview.matchAll(/line-clamp-2">\s*([\s\S]*?)\s*<\/p>/g)].map(m => m[1]);
  const titleMatches = [...existingPreview.matchAll(/text-base font-bold[^>]*>\s*([\s\S]*?)\s*<\/h2>/g)].map(m => m[1]);

  function renderCard(c, idx) {
    const avatar = avatarMatches[idx % 9] || 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128';
    const title = titleMatches[idx % 9] || c.name;
    const desc = descMatches[idx % 9] || 'Conteúdo autêntico selecionado para imersão natural no idioma.';

    const tagBadges = c.tags.map(t => `
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-[#1e1528] text-purple-300/80 border border-purple-900/40">
        ${t}
      </span>
    `).join('');

    return `
      <div class="group relative p-6 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between border-b border-zinc-800 md:border-b-0 lg:border-r lg:border-zinc-800 last:border-r-0">
        <a href="${c.url}" target="_blank" class="absolute inset-0 z-0"></a>
        <div class="space-y-3 relative z-10 pointer-events-none">
          <div class="flex items-start justify-between gap-3">
            <div class="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
              <img src="${avatar}" alt="${c.name}" class="w-full h-full object-cover">
            </div>
            <button type="button" class="pointer-events-auto w-7 h-7 rounded-lg border border-zinc-800/80 bg-zinc-900/40 flex items-center justify-center text-zinc-500 hover:text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
          </div>
          <div>
            <h2 class="text-sm font-bold text-zinc-100 truncate">${title}</h2>
            <p class="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">${desc}</p>
          </div>
        </div>
        <div class="pt-4 flex flex-wrap gap-1.5 items-center relative z-10 pointer-events-none">
          ${tagBadges}
          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#18181b] text-zinc-400 border border-zinc-800">${c.subtitleTag}</span>
        </div>
      </div>`;
  }

  const sampleCards = channels.map((c, i) => renderCard(c, i)).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biblioteca de Imersão — Comparativo Completo de Padrões de Filtros</title>
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
    .pill-active {
      background-color: #1a1625 !important;
      color: #e9d5ff !important;
      border-color: rgba(168, 85, 247, 0.45) !important;
    }
    /* Linear hover morph */
    .linear-active:hover .linear-arrow { display: none !important; }
    .linear-active:hover .linear-close { display: flex !important; }

    /* Pill with direct X button */
    .tag-chip-active {
      background-color: #27272a !important;
      color: #f4f4f5 !important;
      border-color: #3f3f46 !important;
    }
  </style>
</head>
<body class="min-h-screen bg-[#09090b] text-zinc-100 p-6 sm:p-12 selection:bg-purple-900 selection:text-white space-y-16">

  <div class="max-w-5xl mx-auto space-y-16">

    <!-- CABEÇALHO DA PÁGINA -->
    <div class="space-y-2 border-b border-zinc-800 pb-6">
      <div class="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400">
        <span>🧙🏻‍♂️</span>
        <span>Biblioteca de Imersão · Laboratório de UX</span>
      </div>
      <h1 class="text-3xl font-bold tracking-tight text-zinc-100">
        Comparativo Interativo: 4 Padrões de Filtro & Limpeza
      </h1>
      <p class="text-sm text-zinc-400 max-w-2xl">
        Interaja com cada uma das 4 opções abaixo (clique nos filtros, selecione opções e teste como eles são limpos individualmente e em lote).
      </p>
    </div>

    <!-- ========================================================================= -->
    <!-- OPÇÃO 1: PADRÃO NOTION (Limpeza no Menu Dropdown + Botão Limpar Tudo)     -->
    <!-- ========================================================================= -->
    <section class="space-y-5 p-8 rounded-2xl border border-zinc-800/80 bg-[#0c0c0e]">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-mono font-semibold text-purple-400">PADRÃO 1 · NOTION NATIVE</span>
          <h2 class="text-lg font-bold text-zinc-100">Menu com Reset Interno ('Limpar filtro' no topo do dropdown)</h2>
          <p class="text-xs text-zinc-400 mt-0.5">O botão externo nunca muda de forma. Para limpar, o usuário clica em 'Limpar filtro' no topo do dropdown ou usa 'Limpar tudo' à direita.</p>
        </div>
      </div>

      <!-- Barra de Filtros Opção 1 -->
      <div class="flex flex-wrap items-center gap-2 pt-2">
        <!-- Tema Dropdown -->
        <div class="relative">
          <button onclick="toggleMenu('opt1-tema')" id="btn-opt1-tema" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141417] text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5 transition-colors">
            <span id="label-opt1-tema">Tema</span>
            <svg class="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
          </button>
          <div id="opt1-tema" class="dropdown-box hidden absolute left-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-50 space-y-0.5">
            <button onclick="setOpt1('tema', null)" class="w-full text-left px-2.5 py-1.5 text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg flex items-center gap-2">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Limpar filtro</span>
            </button>
            <div class="h-px bg-zinc-800/80 my-1"></div>
            <button onclick="setOpt1('tema', 'Cultura')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Cultura</button>
            <button onclick="setOpt1('tema', 'História')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">História</button>
            <button onclick="setOpt1('tema', 'Humor')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Humor</button>
          </div>
        </div>

        <!-- Legendas Dropdown -->
        <div class="relative">
          <button onclick="toggleMenu('opt1-leg')" id="btn-opt1-leg" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141417] text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5 transition-colors">
            <span id="label-opt1-leg">Legendas</span>
            <svg class="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
          </button>
          <div id="opt1-leg" class="dropdown-box hidden absolute left-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-50 space-y-0.5">
            <button onclick="setOpt1('leg', null)" class="w-full text-left px-2.5 py-1.5 text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20 rounded-lg flex items-center gap-2">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span>Limpar filtro</span>
            </button>
            <div class="h-px bg-zinc-800/80 my-1"></div>
            <button onclick="setOpt1('leg', 'Legendas CC')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Legendas CC</button>
            <button onclick="setOpt1('leg', 'Legendas fixas')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Legendas no vídeo</button>
            <button onclick="setOpt1('leg', 'Sem legendas')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Sem legendas</button>
          </div>
        </div>

        <button onclick="clearOpt1All()" id="clear-opt1-all" class="hidden text-xs text-zinc-500 hover:text-zinc-200 hover:underline px-2 py-1.5 font-medium ml-1">
          Limpar tudo
        </button>
      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- OPÇÃO 2: PADRÃO LINEAR (Pill Morphing: '▾' vira '✕' no Hover)             -->
    <!-- ========================================================================= -->
    <section class="space-y-5 p-8 rounded-2xl border border-zinc-800/80 bg-[#0c0c0e]">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-mono font-semibold text-purple-400">PADRÃO 2 · LINEAR MORPHING</span>
          <h2 class="text-lg font-bold text-zinc-100">Pill Inteligente (Setinha '▾' se transforma em '✕' no Hover)</h2>
          <p class="text-xs text-zinc-400 mt-0.5">Quando ativo, o botão exibe 'Tema: História ▾'. Ao passar o mouse por cima da pill ativa, a setinha vira um '✕' para limpeza rápida.</p>
        </div>
      </div>

      <!-- Barra de Filtros Opção 2 -->
      <div class="flex flex-wrap items-center gap-2 pt-2">
        <div class="relative">
          <button onclick="handleLinearClick('tema', event)" id="btn-opt2-tema" class="group/pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141417] text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <span id="label-opt2-tema">Tema</span>
            <svg class="linear-arrow w-3 h-3 text-zinc-500 group-hover/pill:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
            <span class="linear-close hidden w-3 h-3 text-purple-300 hover:text-white items-center justify-center">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </span>
          </button>
          <div id="opt2-tema" class="dropdown-box hidden absolute left-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-50 space-y-0.5">
            <button onclick="setOpt2('tema', 'Cultura')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Cultura</button>
            <button onclick="setOpt2('tema', 'História')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">História</button>
            <button onclick="setOpt2('tema', 'Humor')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Humor</button>
          </div>
        </div>

        <div class="relative">
          <button onclick="handleLinearClick('leg', event)" id="btn-opt2-leg" class="group/pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141417] text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <span id="label-opt2-leg">Legendas</span>
            <svg class="linear-arrow w-3 h-3 text-zinc-500 group-hover/pill:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>
            <span class="linear-close hidden w-3 h-3 text-purple-300 hover:text-white items-center justify-center">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </span>
          </button>
          <div id="opt2-leg" class="dropdown-box hidden absolute left-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-50 space-y-0.5">
            <button onclick="setOpt2('leg', 'Legendas CC')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Legendas CC</button>
            <button onclick="setOpt2('leg', 'Legendas fixas')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Legendas no vídeo</button>
            <button onclick="setOpt2('leg', 'Sem legendas')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Sem legendas</button>
          </div>
        </div>

        <button onclick="clearOpt2All()" id="clear-opt2-all" class="hidden text-xs text-zinc-500 hover:text-zinc-200 hover:underline px-2 py-1.5 font-medium ml-1">
          Limpar filtros
        </button>
      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- OPÇÃO 3: PADRÃO APPLIED TAGS (Filtros ativos viram Tags Fecháveis abaixo)  -->
    <!-- ========================================================================= -->
    <section class="space-y-5 p-8 rounded-2xl border border-zinc-800/80 bg-[#0c0c0e]">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-mono font-semibold text-purple-400">PADRÃO 3 · AIRBNB / E-COMMERCE STYLE</span>
          <h2 class="text-lg font-bold text-zinc-100">Pills de Ativação Separadas (Linha de Filtros Aplicados)</h2>
          <p class="text-xs text-zinc-400 mt-0.5">Os dropdowns permanecem intactos. Quando você seleciona algo, surge uma tag fechável com '✕' bem evidente ao lado.</p>
        </div>
      </div>

      <!-- Barra de Filtros Opção 3 -->
      <div class="space-y-3 pt-2">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Dropdowns Limpos -->
          <div class="relative">
            <button onclick="toggleMenu('opt3-tema')" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141417] text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5">
              <span>Tema ▾</span>
            </button>
            <div id="opt3-tema" class="dropdown-box hidden absolute left-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-50 space-y-0.5">
              <button onclick="addOpt3Tag('Tema', 'Cultura')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Cultura</button>
              <button onclick="addOpt3Tag('Tema', 'História')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">História</button>
              <button onclick="addOpt3Tag('Tema', 'Humor')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Humor</button>
            </div>
          </div>

          <div class="relative">
            <button onclick="toggleMenu('opt3-leg')" class="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141417] text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 flex items-center gap-1.5">
              <span>Legendas ▾</span>
            </button>
            <div id="opt3-leg" class="dropdown-box hidden absolute left-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-[#121215] p-1.5 shadow-2xl z-50 space-y-0.5">
              <button onclick="addOpt3Tag('Legendas', 'Legendas CC')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Legendas CC</button>
              <button onclick="addOpt3Tag('Legendas', 'Sem legendas')" class="w-full text-left px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800/80 rounded-lg">Sem legendas</button>
            </div>
          </div>
        </div>

        <!-- Linha de Tags Ativas -->
        <div id="opt3-tags-container" class="flex flex-wrap items-center gap-1.5 empty:hidden pt-1">
          <!-- Injetado via JS -->
        </div>
      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- OPÇÃO 4: BOTÃO ÚNICO DE FILTRO (MODAL / FLYOUT EXPANSÍVEL)                -->
    <!-- ========================================================================= -->
    <section class="space-y-5 p-8 rounded-2xl border border-zinc-800/80 bg-[#0c0c0e]">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-xs font-mono font-semibold text-purple-400">PADRÃO 4 · SINGLE FILTER TRIGGER</span>
          <h2 class="text-lg font-bold text-zinc-100">Botão Agrupado Único ('Filtros ▾')</h2>
          <p class="text-xs text-zinc-400 mt-0.5">Em vez de vários botões soltos na barra, há apenas UM botão de filtro. Ao clicar, abre um popover elegante com todas as opções e um botão 'Limpar tudo' no rodapé.</p>
        </div>
      </div>

      <div class="pt-2 relative">
        <div class="inline-flex items-center gap-2">
          <button onclick="toggleMenu('opt4-flyout')" id="btn-opt4-main" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#141417] text-zinc-300 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 shadow-sm transition-colors">
            <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            <span id="label-opt4">Filtros</span>
            <span id="badge-opt4" class="hidden px-1.5 py-0.2 bg-purple-900/60 text-purple-300 font-mono text-[10px] rounded">0</span>
          </button>
        </div>

        <!-- Flyout Popover Único -->
        <div id="opt4-flyout" class="dropdown-box hidden absolute left-0 top-full mt-2 w-72 rounded-xl border border-zinc-800 bg-[#121215] p-3 shadow-2xl z-50 space-y-3">
          <div class="space-y-1">
            <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Tema</span>
            <div class="grid grid-cols-2 gap-1 text-xs">
              <button onclick="setOpt4('tema', 'Cultura')" class="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-left text-zinc-300">Cultura</button>
              <button onclick="setOpt4('tema', 'História')" class="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-left text-zinc-300">História</button>
            </div>
          </div>
          <div class="space-y-1 pt-1 border-t border-zinc-800/60">
            <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">Legendas</span>
            <div class="grid grid-cols-2 gap-1 text-xs">
              <button onclick="setOpt4('leg', 'CC')" class="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-left text-zinc-300">Com CC</button>
              <button onclick="setOpt4('leg', 'Sem')" class="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-left text-zinc-300">Sem legendas</button>
            </div>
          </div>
          <div class="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <button onclick="clearOpt4All()" class="text-zinc-500 hover:text-rose-400">Limpar filtros</button>
            <button onclick="toggleMenu('opt4-flyout')" class="px-2.5 py-1 rounded bg-zinc-800 text-white font-medium">Aplicar</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Contexto dos Cards Abaixo -->
    <div class="space-y-4 pt-6 border-t border-zinc-800">
      <div class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Referência de Espaçamento com a Grade de Cards
      </div>
      <div class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 md:grid-cols-3">
        ${sampleCards}
      </div>
    </div>

  </div>

  <script>
    // Gerenciamento geral de dropdowns
    function toggleMenu(id) {
      event.stopPropagation();
      const el = document.getElementById(id);
      const isHidden = el.classList.contains('hidden');
      document.querySelectorAll('.dropdown-box').forEach(b => b.classList.add('hidden'));
      if (isHidden) el.classList.remove('hidden');
    }
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-box').forEach(b => b.classList.add('hidden'));
    });

    // ================= PADRÃO 1 (NOTION) =================
    let opt1State = { tema: null, leg: null };
    function setOpt1(cat, val) {
      opt1State[cat] = val;
      const label = document.getElementById('label-opt1-' + cat);
      const btn = document.getElementById('btn-opt1-' + cat);
      if (val) {
        label.textContent = val;
        btn.classList.add('pill-active');
      } else {
        label.textContent = cat === 'tema' ? 'Tema' : 'Legendas';
        btn.classList.remove('pill-active');
      }
      document.querySelectorAll('.dropdown-box').forEach(b => b.classList.add('hidden'));
      const hasAny = opt1State.tema || opt1State.leg;
      document.getElementById('clear-opt1-all').classList.toggle('hidden', !hasAny);
    }
    function clearOpt1All() {
      setOpt1('tema', null);
      setOpt1('leg', null);
    }

    // ================= PADRÃO 2 (LINEAR) =================
    let opt2State = { tema: null, leg: null };
    function handleLinearClick(cat, ev) {
      ev.stopPropagation();
      const btn = document.getElementById('btn-opt2-' + cat);
      if (ev.target.closest('.linear-close') && btn.classList.contains('linear-active')) {
        setOpt2(cat, null);
        return;
      }
      toggleMenu('opt2-' + cat);
    }
    function setOpt2(cat, val) {
      opt2State[cat] = val;
      const label = document.getElementById('label-opt2-' + cat);
      const btn = document.getElementById('btn-opt2-' + cat);
      if (val) {
        label.textContent = (cat === 'tema' ? 'Tema: ' : 'Legendas: ') + val;
        btn.classList.add('linear-active', 'pill-active');
      } else {
        label.textContent = cat === 'tema' ? 'Tema' : 'Legendas';
        btn.classList.remove('linear-active', 'pill-active');
      }
      document.querySelectorAll('.dropdown-box').forEach(b => b.classList.add('hidden'));
      const hasAny = opt2State.tema || opt2State.leg;
      document.getElementById('clear-opt2-all').classList.toggle('hidden', !hasAny);
    }
    function clearOpt2All() {
      setOpt2('tema', null);
      setOpt2('leg', null);
    }

    // ================= PADRÃO 3 (TAGS SEPARADAS) =================
    let opt3State = {};
    function addOpt3Tag(cat, val) {
      opt3State[cat] = val;
      renderOpt3Tags();
      document.querySelectorAll('.dropdown-box').forEach(b => b.classList.add('hidden'));
    }
    function removeOpt3Tag(cat) {
      delete opt3State[cat];
      renderOpt3Tags();
    }
    function renderOpt3Tags() {
      const container = document.getElementById('opt3-tags-container');
      const keys = Object.keys(opt3State);
      if (keys.length === 0) {
        container.innerHTML = '';
        return;
      }
      container.innerHTML = keys.map(function(k) {
        return '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-zinc-800 text-zinc-200 border border-zinc-700">' +
          '<span class="text-zinc-400 font-medium">' + k + ':</span>' +
          '<span>' + opt3State[k] + '</span>' +
          '<button onclick="removeOpt3Tag(\'' + k + '\')" class="text-zinc-500 hover:text-white ml-0.5 font-bold">×</button>' +
        '</span>';
      }).join('') + '<button onclick="opt3State={};renderOpt3Tags();" class="text-xs text-zinc-500 hover:underline ml-2">Limpar tudo</button>';
    }

    // ================= PADRÃO 4 (SINGLE TRIGGER) =================
    let opt4Count = 0;
    function setOpt4(cat, val) {
      opt4Count++;
      const badge = document.getElementById('badge-opt4');
      badge.textContent = opt4Count;
      badge.classList.remove('hidden');
      document.getElementById('btn-opt4-main').classList.add('pill-active');
    }
    function clearOpt4All() {
      opt4Count = 0;
      document.getElementById('badge-opt4').classList.add('hidden');
      document.getElementById('btn-opt4-main').classList.remove('pill-active');
      document.querySelectorAll('.dropdown-box').forEach(b => b.classList.add('hidden'));
    }
  </script>

</body>
</html>`;

  fs.writeFileSync('preview.html', html, 'utf-8');
  console.log("preview.html gerado com comparativo interativo dos 4 padrões!");
}

generateAllFilterPatternsComparison();
