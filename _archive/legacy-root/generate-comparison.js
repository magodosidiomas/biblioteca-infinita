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

async function updatePreviewComparingOptions() {
  console.log("Atualizando preview.html com visualização lado a lado: Opção 1 vs Opção 2...");
  
  const existingPreview = fs.readFileSync('preview.html', 'utf-8');
  const avatarMatches = [...existingPreview.matchAll(/img src="([^"]+)"/g)].map(m => m[1]);
  const descMatches = [...existingPreview.matchAll(/line-clamp-2">\s*([\s\S]*?)\s*<\/p>/g)].map(m => m[1]);
  const titleMatches = [...existingPreview.matchAll(/text-base font-bold[^>]*>\s*([\s\S]*?)\s*<\/h2>/g)].map(m => m[1]);

  // Função para renderizar um card em qualquer opção
  function renderCard(c, idx, optionType, totalCount) {
    const avatar = avatarMatches[idx % 9] || 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128';
    const title = titleMatches[idx % 9] || c.name;
    const desc = descMatches[idx % 9] || 'Canal dedicado a conteúdos autênticos para imersão natural no idioma.';
    
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

    // OPÇÃO 1: Botão no Topo Direito (Sempre Visível, Sutil e Sem Flicker)
    if (optionType === 'top') {
      return `
        <div class="group relative p-7 sm:p-8 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between border-b border-zinc-800 md:border-b-0 ${idx < totalCount - (totalCount % 3 || 3) ? 'lg:border-b lg:border-zinc-800' : ''} ${idx % 3 !== 2 ? 'lg:border-r lg:border-zinc-800' : ''} ${idx % 2 === 0 ? 'md:max-lg:border-r md:max-lg:border-zinc-800' : ''} ${idx < totalCount - (totalCount % 2 || 2) ? 'md:max-lg:border-b md:max-lg:border-zinc-800' : ''}">
          <a href="${c.url}" target="_blank" class="absolute inset-0 z-0" aria-label="Abrir canal ${c.name}"></a>

          <div class="space-y-4 relative z-10 pointer-events-none">
            <!-- Topo: Avatar à esquerda, Bookmark fixo e sutil à direita -->
            <div class="flex items-start justify-between gap-4">
              <div class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img src="${avatar}" alt="${c.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=youtube.com&sz=128'">
              </div>

              <!-- Botão permanente sem sumiço/flicker -->
              <button type="button" onclick="event.stopPropagation(); this.classList.toggle('text-rose-500'); this.classList.toggle('text-zinc-500'); this.classList.toggle('border-rose-900/50');" class="pointer-events-auto w-8 h-8 rounded-lg border border-zinc-800/80 bg-zinc-900/60 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:border-zinc-700 transition-colors" title="Salvar canal">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

    // OPÇÃO 2: Botão no Rodapé (Junto às tags, topo 100% limpo)
    if (optionType === 'bottom') {
      return `
        <div class="group relative p-7 sm:p-8 hover:bg-zinc-900/40 transition-colors flex flex-col justify-between border-b border-zinc-800 md:border-b-0 ${idx < totalCount - (totalCount % 3 || 3) ? 'lg:border-b lg:border-zinc-800' : ''} ${idx % 3 !== 2 ? 'lg:border-r lg:border-zinc-800' : ''} ${idx % 2 === 0 ? 'md:max-lg:border-r md:max-lg:border-zinc-800' : ''} ${idx < totalCount - (totalCount % 2 || 2) ? 'md:max-lg:border-b md:max-lg:border-zinc-800' : ''}">
          <a href="${c.url}" target="_blank" class="absolute inset-0 z-0" aria-label="Abrir canal ${c.name}"></a>

          <div class="space-y-4 relative z-10 pointer-events-none">
            <!-- Topo: 100% puro e sem botões concorrentes -->
            <div class="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
              <img src="${avatar}" alt="${c.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://www.google.com/s2/favicons?domain=youtube.com&sz=128'">
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

          <!-- Rodapé: Tags à esquerda, Ação de Salvar integrada à direita na 2ª linha -->
          <div class="pt-6 space-y-2.5 relative z-10 pointer-events-none">
            <div class="flex flex-wrap gap-1.5 items-center min-h-[22px]">
              ${tagBadges}
            </div>
            <div class="flex items-center justify-between gap-2 min-h-[22px]">
              <div class="flex flex-wrap gap-1.5 items-center">
                ${subtitleBadge}
                ${paceBadge}
              </div>

              <!-- Botão sutil de Salvar alinhado à direita no rodapé -->
              <button type="button" onclick="event.stopPropagation(); this.classList.toggle('text-rose-400'); this.classList.toggle('border-rose-900/60');" class="pointer-events-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium tracking-wide bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors" title="Salvar canal">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </div>`;
    }
  }

  // Gera 6 cards da Opção 1 e 6 cards da Opção 2 para comparar lado a lado
  const sixChannels = channels.slice(0, 6);
  const gridOption1 = sixChannels.map((c, i) => renderCard(c, i, 'top', 6)).join('');
  const gridOption2 = sixChannels.map((c, i) => renderCard(c, i, 'bottom', 6)).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biblioteca de Imersão — Comparativo UX (Opção 1 vs Opção 2)</title>
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
<body class="min-h-screen bg-[#09090b] text-zinc-100 p-6 sm:p-10 selection:bg-purple-900 selection:text-white space-y-16">

  <div class="max-w-6xl mx-auto space-y-16">

    <!-- SEÇÃO 1: OPÇÃO 1 -->
    <div class="space-y-6">
      <div class="border-b border-zinc-800 pb-4">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-purple-950/50 border border-purple-800/40 text-purple-300 text-xs font-semibold mb-2">
          Opção 1
        </div>
        <h2 class="text-xl font-bold text-zinc-100">
          Botão Fixo no Topo Direito (Sempre Visível & Sem Flicker)
        </h2>
        <p class="text-sm text-zinc-400 mt-1">
          O botão de favoritar está sempre presente no topo com opacidade discreta. Zero surpresa no hover, zero confusão de clique.
        </p>
      </div>

      <div class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        ${gridOption1}
      </div>
    </div>

    <!-- SEÇÃO 2: OPÇÃO 2 -->
    <div class="space-y-6">
      <div class="border-b border-zinc-800 pb-4">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold mb-2">
          Opção 2
        </div>
        <h2 class="text-xl font-bold text-zinc-100">
          Ação Integrada no Rodapé Direito (Topo 100% Puro)
        </h2>
        <p class="text-sm text-zinc-400 mt-1">
          O topo do card fica totalmente limpo e editorial. A ação de "Salvar" fica ancorada no rodapé como um utilitário junto às tags.
        </p>
      </div>

      <div class="rounded-xl border border-zinc-800 bg-[#09090b] overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        ${gridOption2}
      </div>
    </div>

  </div>

</body>
</html>`;

  fs.writeFileSync('preview.html', html, 'utf-8');
  console.log("preview.html gerado com comparativo Opção 1 vs Opção 2!");
}

updatePreviewComparingOptions();
