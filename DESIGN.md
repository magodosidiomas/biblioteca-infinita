# DESIGN.md — Sistema de Design & Regras de Interface

> **Documento de Referência Canônica de Design:** Todas as implementações de interface devem seguir estritamente as regras consolidadas abaixo. Nenhuma regra aqui pode ser violada sem alinhamento prévio.

---

## 1. Princípios & Fundamentos Visuais

- **Tema Obrigatório:** Dark Mode exclusivo (`#09090b` de fundo de página).
- **Tipografia:** `Plus Jakarta Sans`, sans-serif limpa e moderna.
  - Títulos: Peso 700 / 600, `tracking-tight`.
  - Corpo / Bios: 13-14px, `leading-relaxed text-zinc-400`.
- **Paleta de Cores:**
  - Base: `#09090b` (canvas), `#121215` (cards/inputs), `#18181b` (contêineres secundários), `#27272a` (bordas/divisórias `border-zinc-800`).
  - Destaque Temático: Roxo ameixa escuro (`bg-[#1e1528] text-purple-300/80 border-purple-900/40`).
  - Destaque Ativo de Filtro: Pílulas ativas em roxo profundo (`bg-[#1a1625] text-purple-200 border-purple-800/60`).
  - Favorito (Coração): Rosa/Rose vivo quando ativo (`fill-rose-500 text-rose-500 border-rose-900/40`).

---

## 2. Regras Fechadas (LOCKED RULES) 🔒

### 2.1. Copy & Texto (Anti-Slop / UX-Writing)
1. **ZERO Textos Fluff / Redundantes:**
   - ❌ NUNCA adicionar textos como *"Catálogo atualizado · Mago dos Idiomas"*, *"· Imersão"*, *"Imersão em Francês"*, *"Explore os canais"*.
   - ✅ A interface contém apenas o que tem utilidade funcional ou é conteúdo do acervo.
2. **Título da Marca na TopNav:**
   - `🧙🏻‍♂️ Biblioteca Infinita` (16–18px bold). Sem subtítulos ao lado.
3. **Microcopy de Ações:**
   - Botão de reset no empty state e filtros: Sempre **`Limpar filtros`** (verbo imperativo + objeto direto). NUNCA usar *"Restaurar canais"* ou variações prolixas.

### 2.2. Card de Canal (Design Aprovado)
1. **Estrutura Visual:**
   - **Avatar:** 44–48px circular, oficial do YouTube via `og:image` com fallback.
   - **Título:** 16px bold (`text-zinc-100`), hover com transição para tom roxo suave + seta diagonal de link externo (`↗`).
   - **Bio:** Limitada a 2 linhas (`line-clamp-2 h-10 overflow-hidden`), 13–14px `text-zinc-400`.
   - **Linha 1 de Tags (Temas):** Pílulas pequenas em ameixa escuro (`bg-[#1e1528] text-purple-300/80 border border-purple-900/40`).
   - **Linha 2 de Tags (Suporte Técnico):** Badges neutras (`bg-[#18181b] text-zinc-400 border border-zinc-800`) para Legendas (`Legendas CC`, `Legendas fixas`, `Legendas bilíngues`, `Sem legendas`) e Velocidade (`Fala pausada`, `Fala natural`, `Fala rápida`).
   - **Botão de Favorito:** Topo direito do card, 32x32px arredondado com ícone de coração SVG. Ao ativar, preenchimento rosa (`fill-rose-500`).

### 2.3. Layout Responsivo & Comportamento dos Cards (Estilo Artcraft)
1. **Desktop ($\ge 1024\text{px}$):**
   - Grade conectada de 3 colunas (`grid-cols-3`) com bordas compartilhadas internas (`border-r` e `border-b` em `#27272a`).
2. **Tablet ($768\text{px} - 1023\text{px}$):**
   - Grade conectada de 2 colunas (`grid-cols-2`).
3. **Mobile ($< 768\text{px}$):**
   - **Estilo Artcraft:** Cada card ocupa 100% da largura (`w-full`), conectado verticalmente.
   - Os cards tocam as bordas do contêiner sem margens soltas ou gaps desajeitados.
   - Divisória única entre cards (`border-b border-zinc-800`). Ao rolar a página no celular, o usuário vê apenas o divider superior/inferior delimitando o canal atual do próximo.

### 2.4. Breakpoints de Menus: Popover vs. Bottom Sheet
- **Desktop ($\ge 640\text{px}$):**
  - **SEMPRE** popovers flutuantes ancorados logo abaixo do botão (`absolute left-0 top-full mt-2 w-48 rounded-xl bg-[#121215] border border-zinc-800 shadow-2xl p-1.5`).
  - ❌ **JAMAIS** abrir ou simular Bottom Sheet gigantesca de tela inteira em viewport desktop.
- **Mobile ($< 640\text{px}$):**
  - **SEMPRE** Bottom Sheet que desliza do rodapé com backdrop blur escuro, alvos de toque generosos ($\ge 44\text{px}$) e botão de fechar.

### 2.5. Divisores Internos & Dropdowns (Padrão Notion/Linear)
1. **Sem linhas desajeitadas:**
   - ❌ NUNCA colocar `<div class="h-px bg-zinc-800"></div>` ou `<hr>` desalinhado dentro dos menus.
   - ❌ NUNCA colocar *"Limpar tema"* em vermelho no topo do menu quando nada está selecionado.
2. **Comportamento de Seleção:**
   - Clicar em um item seleciona-o e exibe ícone de check SVG real (`✓`).
   - Clicar no mesmo item novamente desmarca-o (toggle natural).
   - Quando há seleção ativa, o próprio chip tem o `✕` integrado para reset instantâneo, e o menu tem uma ação limpa no rodapé: *"Limpar seleção"*.

### 2.6. Empty State
- **Sem contêiner:** ❌ NUNCA colocar borda ou caixa cinza (`border bg-[#0d0d10]`) em volta do empty state.
- **Comportamento:** O empty state vive livre e arejado no canvas escuro (`py-20 sm:py-28 text-center max-w-sm mx-auto`), com ícone discreto, título `Nenhum canal encontrado` e botão `Limpar filtros`.

---

## 3. Decisões em Aberto (PENDING / GRILL-ME) ⏳

As seguintes decisões arquiteturais estão em processo de validação com o usuário:

1. **Posição Definitiva do Seletor de Idioma:**
   - *Opção A:* Na TopNav à direita (`[ 🇫🇷 Francês ▾ ]`).
   - *Opção B:* Integrado com as abas de formato na mesma linha (`[ 🇫🇷 Francês ▾ ] | [ YouTube ] [ Podcasts ] ...`).
   - *Opção C:* Como primeiro chip na barra de filtros (`[ 🇫🇷 Francês ▾ ] [ Tema ▾ ] ...`).
2. **Estrutura dos Filtros no Mobile:**
   - *Opção A (Airbnb/Spotify):* Barra de busca com botão agregado `[ Filtros ⚙️ ]` que abre a Bottom Sheet completa + atalhos rápidos de 1 toque.
   - *Opção B (YouTube):* Linha única horizontal deslizante de chips com scroll sem quebra de linha.
