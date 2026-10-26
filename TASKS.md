# 📋 TASKS.md — Biblioteca Infinita (Immersion Library)

> **Regra de Manutenção Contínua (Grounded Truth):**
> 1. **Código > Documentação:** Antes de reportar status ou planejar tarefas, SEMPRE verifique o código real em `app/src/` e `scripts/`.
> 2. **Atualização Imediata:** Toda feature entregue ou decisão de produto tomada deve ser atualizada neste arquivo no mesmo turno.
> 3. **Arquivamento de Handoffs:** Documentos temporários de handoff já implementados devem ser movidos para `_archive/` para nunca confundir sessões futuras.

---

## ✅ Entregue & Validado em Código

### Arquitetura & Persistência (Dual-Sync Atômico)
- [x] **Sincronização Atômica (`content.json` ➔ `channels.ts`):**
  - `content.json` é o banco canônico; `channels.ts` é o bundle tipado gerado automaticamente.
  - Sincronização automática em todas as rotas do Admin Dev Plugin ([`app/vite-admin-plugin.ts`](app/vite-admin-plugin.ts): `save-content`, `delete-content`, `refresh-avatar`, `regenerate-metadata`, `bulk-delete`, `bulk-move`) e via CLI ([`scripts/ingest.js`](scripts/ingest.js) e [`scripts/sync-channels.js`](scripts/sync-channels.js)).
- [x] **Quality Gate Automatizado (`validate:catalog`):**
  - [`scripts/validate-catalog.js`](scripts/validate-catalog.js) valida paridade 1:1 entre `content.json` e `channels.ts`, audita descrições contra AI slop e valida todas as tags contra o dicionário canônico ([`app/src/constants/tags.ts`](app/src/constants/tags.ts)). Executado automaticamente antes de `npm run build`.

### Front-end do Aluno (`http://localhost:5173/`)
- [x] **Navegação Horizontal Escalável & Seletor de Idioma:** [`Header.tsx`](app/src/components/Header.tsx) com abas dinâmicas (oculta categorias com 0 itens para o idioma selecionado) e seletor de idiomas ativos à direita.
- [x] **Ocultação Dinâmica de Abas Vazias (`count === 0`):** Abas sem itens cadastrados no idioma ativo (como `Professores` e `Pronúncia` enquanto não povoadas, ou `Podcasts` em Alemão) são ocultadas da barra de navegação sem deixar "cidades fantasma". Se o usuário troca para um idioma que não possui a categoria atual, a navegação redireciona automaticamente para a primeira categoria com itens. Conforme novos itens são cadastrados no Admin, as abas surgem automaticamente.
- [x] **Persistência Canônica de Idiomas (Admin ➔ Disco/`languages.ts`):**
  - Endpoints `/api/save-languages` e `/api/get-languages` criados em [`app/vite-admin-plugin.ts`](app/vite-admin-plugin.ts).
  - Toggles e adições no painel Admin salvam diretamente no arquivo [`app/src/constants/languages.ts`](app/src/constants/languages.ts), eliminando o descompasso entre browsers e garantindo que o build de produção espelhe exatamente o que o admin configurou.
  - Idiomas ativos padronizados no disco para os 4 idiomas com catálogo verificado: **Inglês, Alemão, Francês e Italiano**. Demais idiomas (Espanhol, Japonês, etc.) definidos como `active: false` até o povoamento de canais.
  - Fallback automático: se um idioma for desativado, o front-end migra automaticamente para o primeiro idioma ativo.
- [x] **Aba `Pronúncia` (Subheaders `Vídeos` e `Guias & Recursos` + Thumbs 16:9):** [`PronunciaVideoCard.tsx`](app/src/components/PronunciaVideoCard.tsx) + [`App.tsx`](app/src/App.tsx) aprovados via [`previews/preview-pronuncia-recursos.html`](previews/preview-pronuncia-recursos.html) — divide a aba em dois subheaders (`Vídeos` com thumbnail 16:9 do YouTube, nome do canal, título e descrição; `Guias & Recursos` para artigos, sites e aplicativos), com filtros rápidos `Vídeos`, `Artigos`, `Sites`, `Apps` na [`FilterBar.tsx`](app/src/components/FilterBar.tsx) e suporte completo no Admin para salvar vídeos individuais do YouTube sem convertê-los para canal quando a categoria é `Pronúncia`.
- [x] **Smart Auto-Hide Unificado & Bottom Sheet de Categorias no Mobile:**
  - Aprovado via [`previews/preview-mobile-filter-sheet.html`](previews/preview-mobile-filter-sheet.html).
  - **Smart Scroll Auto-Hide:** [`app/src/hooks/useSmartScroll.ts`](app/src/hooks/useSmartScroll.ts) acoplado ao wrapper superior em [`App.tsx`](app/src/App.tsx). Ao rolar para baixo em telas mobile (`< 768px`), todo o conjunto do topo (Header + FilterBar) recolhe suavemente (`-translate-y-full`). Ao rolar para cima (mesmo sutilmente), o topo reaparece instantaneamente. Eliminado o antigo timeout artificial de 450ms que causava tremulação no meio da leitura.
  - **Filtros em Linha Única Horizontal:** Em [`FilterBar.tsx`](app/src/components/FilterBar.tsx), os filtros rápidos ficam organizados em linha única com scroll horizontal suave (`overflow-x-auto no-scrollbar`), com o botão **Categorias** posicionado como primeiríssimo item e "Ordenar" integrado na linha no mobile.
  - **Bottom Sheet de Categorias:** [`CategorySheet.tsx`](app/src/components/CategorySheet.tsx) substitui o popover de desktop em telas mobile, abrindo um drawer nativo inferior com busca dedicada, área de categorias ativas com remoção rápida, espaçamento limpo de 4px entre itens (`space-y-1`), ausência total de dividers inúteis ou cards pesados, ação de "Limpar" contextual e botão "Ver resultados". No desktop, o combobox inline flutuante permanece preservado.
  - **Eliminação de Scroll Horizontal da Página:** Trava estrita de viewport via `html, body { overflow-x: hidden; max-width: 100vw; }` em [`index.css`](app/src/index.css) e contenção de largura com `w-full min-w-0 max-w-full overflow-hidden` nos containers de [`Header.tsx`](app/src/components/Header.tsx) e [`FilterBar.tsx`](app/src/components/FilterBar.tsx).
  - **Language Drawer Mobile (Padrão Imerso), Código ISO no Topo & Sincronização de Idiomas:**
    - [`Header.tsx`](app/src/components/Header.tsx): No mobile (`sm:hidden`), o botão superior de idioma exibe a bandeira + código ISO de 2 letras em uppercase via [`getLanguageCode`](app/src/constants/languages.ts) (`EN`, `PT`, `ES`, `IT`, etc.) em tipografia 12px legível (`text-xs font-semibold`), mantendo o nome completo em telas maiores (`hidden sm:inline`).
    - [`LanguageDrawer.tsx`](app/src/components/LanguageDrawer.tsx) implementado sobre o Vaul para substituir o dropdown flutuante no mobile: sobe um drawer limpo com título "Idioma", lista de idiomas com alvos de toque generosos ($\ge 48\text{px}$), bandeira, nome, checkmark roxo no ativo e link direto "Gerenciar idiomas ↗" no ambiente dev.
    - Sincronização em tempo real de idiomas ativados via Admin: [`AdminLanguages.tsx`](app/src/components/admin/AdminLanguages.tsx) emite evento customizado `immersion_languages_updated` e [`App.tsx`](app/src/App.tsx) sincroniza imediatamente seu estado local (`languages`, `setLanguages`) sem depender de reload manual.
    - Idiomas com catálogo real (Inglês, Italiano, Francês, Espanhol, Alemão, Japonês, Português, Russo) definidos como ativos por padrão em [`languages.ts`](app/src/constants/languages.ts).
- [x] **Barra de Filtros Contextual:** [`FilterBar.tsx`](app/src/components/FilterBar.tsx) + [`CategoryCombobox.tsx`](app/src/components/CategoryCombobox.tsx) com busca, toggle `Para iniciantes` (oculto em Professores), toggle contextual `Legendas` (`YouTube`, `Séries`, `Filmes`) / `Com transcrição` (`Podcasts`), `Favoritos` e ordenação.
- [x] **Card 4A (YouTube, Professores e Podcasts):** [`ChannelCard.tsx`](app/src/components/ChannelCard.tsx) com avatar circular + fallback tipográfico, botão de favoritar, bio em 3 linhas, badges (`Iniciante`, `Legendado`, link clicável `Transcrição` para podcasts), tags atômicas e duração média (`Episódios de ~30 min`).
- [x] **Card de Pôster Vertical 2:3 (`Séries` e `Filmes`):** [`SeriesMovieCard.tsx`](app/src/components/SeriesMovieCard.tsx) aprovado via [`previews/preview-series-filmes.html`](previews/preview-series-filmes.html) — grid de 3 colunas no desktop, sem sinopse no card, pill da plataforma no topo esquerdo, gradiente inferior escuro, subtítulo editorial com gêneros separados por `·` + aviso `Original em [Idioma]` quando dublado, e linha única de badges (`Iniciante`, `Áudio Original` / `Dublado`, `Legendado [CC]`).

### Deploy & Infraestrutura (Cloudflare Pages)
- [x] **Deploy de Produção no Cloudflare Pages:**
  - Build validado com zero erros e publicado no domínio canônico de produção:
    - **URL Produção:** `https://biblioteca-infinita.pages.dev`
    - **Última Versão Imutável:** `https://85e3a849.biblioteca-infinita.pages.dev`
    - **Versão Anterior:** `https://da37ef6f.biblioteca-infinita.pages.dev`
- [x] **Deploy de Staging no Cloudflare Pages:**
  - Publicado na branch `staging`:
    - **URL Staging:** `https://staging.biblioteca-infinita.pages.dev`
    - **Última Versão:** `https://11b27419.biblioteca-infinita.pages.dev`
    - Implementado interceptador de navegação no `Sheet` (`history.pushState` + `popstate`): o botão Voltar (hardware/gesto de sistema no Android) agora fecha exclusivamente o drawer aberto sem navegar para trás no histórico da aba.

### Painel Admin (`http://localhost:5173/admin`)
- [x] **Listagem & Filtros por Aba/Idioma:** [`AdminContentList.tsx`](app/src/components/admin/AdminContentList.tsx) + [`AdminChannelCard.tsx`](app/src/components/admin/AdminChannelCard.tsx) + [`SeriesMovieCard.tsx`](app/src/components/SeriesMovieCard.tsx) (modo Admin com botão `Editar` no hover) com contadores separados para `Séries` e `Filmes`.
- [x] **Tela "Novo Conteúdo" Universal (Layout 2 Colunas + Preview ao Vivo):** [`AdminNewContent.tsx`](app/src/components/admin/AdminNewContent.tsx) aprovado via [`previews/preview-admin-series.html`](previews/preview-admin-series.html) com campo único de `Link` que auto-detecta o formato (`YouTube`, `Professor`, `Podcast`, `Série`, `Filme`, `Site`), busca pôster vertical `2:3`, gêneros e idioma original automaticamente via TVMaze / iTunes Search / JSON-LD em [`app/vite-admin-plugin.ts`](app/vite-admin-plugin.ts), oculta o campo de descrição para `Série`/`Filme`, alterna o preview da direita para o pôster `2:3` e posiciona o dock de simulador no canto inferior esquerdo.
- [x] **Drawer Lateral de Edição:** [`AdminEditDrawer.tsx`](app/src/components/admin/AdminEditDrawer.tsx) com recarregamento de ícone/pôster/metadados, mudança de formato/idioma (incluindo `Série`, `Filme`, `Site`), ocultação automática de descrição para pôsteres e exclusão.
- [x] **Gestão de Idiomas:** [`AdminLanguages.tsx`](app/src/components/admin/AdminLanguages.tsx) para ativar/desativar idiomas visíveis.
- [x] **Isolamento Estrito em Produção (`import.meta.env.DEV` + Dead-Code Elimination):** Em [`main.tsx`](app/src/main.tsx) e [`App.tsx`](app/src/App.tsx), o [`AdminPage.tsx`](app/src/components/admin/AdminPage.tsx) e o endpoint `/api/get-channels` são carregados exclusivamente em ambiente local de desenvolvimento. No build de produção (`npm run build`), todo o código do Admin é fisicamente eliminado do bundle e qualquer acesso a `/admin` redireciona silenciosamente para `/`.

### Catálogo & Ingestão Editorial
- [x] **Ingestão Completa de Séries da Netflix com Metadados Oficiais & Curadoria Anti-Colisão:**
  - Recuperados 62 títulos únicos de séries do catálogo histórico e Notion exports (incluindo *Toon* em holandês, *Friends* e *extr@ English*).
  - Links oficiais diretos da Netflix (`netflix.com/title/...`) mapeados para 100% dos títulos.
  - Desambiguação cirúrgica de pôsteres e idiomas originais: *Avatar: The Last Airbender* (animação 2005 em vez do live-action 2024), *DC Titans* (série da DC 2018 em vez de Titan FC), *Family Business* (série francesa 2019), *Ultraman* (anime 2019), *The Square* (documentário egípcio em árabe), *3Below* e *Wizards: Tales of Arcadia*.
  - Normalização bilíngue de `originalLanguage` (`Inglês` -> `english`), eliminando falsos positivos de séries originais marcadas como dubladas dentro do próprio idioma.
  - Ordenação padrão com **Áudio Original primeiro** seguido dos títulos **Dublados** (em ordem alfabética dentro de cada grupo) + filtro rápido **"Apenas Áudio Original"** na [`FilterBar.tsx`](app/src/components/FilterBar.tsx) (fiel ao `preview-series-filmes.html`).
  - [`AdminEditDrawer.tsx`](app/src/components/admin/AdminEditDrawer.tsx) adaptado ao formato selecionado (*Editar série*, *Pôster vertical (2:3)*, *↻ Recarregar pôster*, *Link da série*, *↻ Buscar metadados*, seletor de *Idioma original da obra* e *Plataforma*, e botão *Excluir série*).
  - 18 idiomas adicionais do catálogo de dublagens registrados em [`languages.ts`](app/src/constants/languages.ts) com `active: false` e sincronizados automaticamente via `mergeWithInitialLangs`.
- [x] **Ingestão Curada do Catálogo de Italiano (24 Canais no YouTube + 1 Podcast):**
  - **Imersão Iniciante (4 canais + 1 podcast):**
    - *Podcast Italiano* (Davide Gemello) cadastrado em `YouTube` (com transcrição via `podcastitaliano.com` e `beginnerFriendly: true`) e em `Podcasts` (via Spotify oficial).
    - *Learn Italian with Lucrezia* (`beginnerFriendly: true`, legendas CC detectadas).
    - *Easy Italian* (`beginnerFriendly: true`, legendas bilíngues fixas).
    - *Ilenia Vitolo* (`beginnerFriendly: true`, vlogs e aulas de imersão).
  - **Imersão Nativa (20 canais):**
    - *Ciência & Divulgação:* Geopop, La Fisica Che Ci Piace, Barbascura X.
    - *História & Geopolítica:* Nova Lectio.
    - *Gastronomia:* Italia Squisita, Cucina Botanica.
    - *Viagens & Cotidiano:* Human Safari, Le Stelle Marine.
    - *Cinema & Audiovisual:* Slim Dogs, 151eg, yotobi, Claudio Di Biagio, WatchMojo Italia.
    - *Tecnologia:* HDblog, TechDale.
    - *Desenvolvimento Pessoal & Produtividade:* Antonio Martone, Daniela Ballarini, Giuseppe Castagna.
    - *Negócios & Marketing:* MiK Cosentino.
    - *Jornalismo & Entrevistas:* Mia Ceran.
  - Metadados oficiais verbatim extraídos do YouTube (zero AI slop nas descrições), avatares em alta resolução, detecção real de legendas CC e taxonomia 100% atômica sem conectivos. Sincronização ponta a ponta em `content.json`, `channels.ts` e `channels.json`.

---

## 🔒 Decisões de Produto Fechadas (Não Reabrir sem Solicitação)
1. **Sem Campo de Sotaque (`accent`):** Descartado para evitar overhead de manutenção.
2. **Sem Tag "Iniciante" para Professores:** Professores é uma categoria separada; o toggle `Iniciante` fica desabilitado quando o formato é `Professor`.
3. **Pôster 2:3 para `Séries` e `Filmes` (Sem Sinopse e Sem Classificação Indicativa `12+`):** Abas separadas (`Séries` | `Filmes`), sinopse reservada ao site externo, gêneros como subtítulo separado por `·`, detecção automática de áudio original vs. dublado (`Original em ...`) e badge `Legendado [CC]`.
4. **Migração de Conteúdo Legado sob Demanda:** Os conteúdos antigos arquivados em `content.full_multilingual_backup.json` serão convertidos/importados para o modelo novo apenas quando solicitado por idioma/categoria no lançamento.
5. **Ocultação de Abas Sem Itens (`count === 0`):** Abas sem conteúdos disponíveis para o idioma selecionado não são exibidas na barra do aluno. Meta editorial individual de $\ge 5$ itens por categoria para expansão, mas o software libera qualquer categoria com $\ge 1$ item.
6. **Fonte da Verdade de Idiomas no Disco:** O painel Admin persiste o estado ativo dos idiomas em `languages.ts` via endpoint dedicado; browsers de alunos e builds de produção não utilizam `localStorage` para sobrescrever idiomas ativos do catálogo.

---

## 🚦 Próximos Passos (Em Aberto)

### 🔴 P0 — Ajustes Finais de Interface
- [ ] **Adaptações Mobile & Responsividade:** Revisão fina da experiência no celular (toque, padding dos pôsteres 2:3, gaveta de edição, sticky nav e filtros sem quebra de layout em telas pequenas). Após fechar isso, o front-end fica 100% concluído e o projeto entra em modo puro de povoamento ("adding stuff").

### 🟠 P1 — Curadoria & Povoamento de Conteúdo (Alimentação Contínua)
- [ ] **Povoamento por Idioma:** Adicionar novos canais, séries, podcasts e sites sob demanda diretamente pelo Admin local (`localhost:5173/admin`). Catálogo atual conta com 122 itens ativos sincronizados.

### 🟡 P2 — Deploy & Produção
- [ ] **Deploy Cloudflare Pages:** Executar `npm run build` e publicar `app/dist` no Cloudflare Pages (`biblioteca-infinita.pages.dev`) após fechar o lote inicial de lançamento.
