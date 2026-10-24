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
- [x] **Navegação Horizontal Escalável & Seletor de Idioma:** [`Header.tsx`](app/src/components/Header.tsx) com abas separadas (`YouTube`, `Professores`, `Podcasts`, `Séries`, `Filmes`, `Sites`) e seletor de idiomas ativos à direita.
- [x] **Barra de Filtros Contextual:** [`FilterBar.tsx`](app/src/components/FilterBar.tsx) + [`CategoryCombobox.tsx`](app/src/components/CategoryCombobox.tsx) com busca, toggle `Para iniciantes` (oculto em Professores), toggle contextual `Legendas` (`YouTube`, `Séries`, `Filmes`) / `Com transcrição` (`Podcasts`), `Favoritos` e ordenação.
- [x] **Card 4A (YouTube, Professores e Podcasts):** [`ChannelCard.tsx`](app/src/components/ChannelCard.tsx) com avatar circular + fallback tipográfico, botão de favoritar, bio em 3 linhas, badges (`Iniciante`, `Legendado`, link clicável `Transcrição` para podcasts), tags atômicas e duração média (`Episódios de ~30 min`).
- [x] **Card de Pôster Vertical 2:3 (`Séries` e `Filmes`):** [`SeriesMovieCard.tsx`](app/src/components/SeriesMovieCard.tsx) aprovado via [`previews/preview-series-filmes.html`](previews/preview-series-filmes.html) — grid de 3 colunas no desktop, sem sinopse no card, pill da plataforma no topo esquerdo, gradiente inferior escuro, subtítulo editorial com gêneros separados por `·` + aviso `Original em [Idioma]` quando dublado, e linha única de badges (`Iniciante`, `Áudio Original` / `Dublado`, `Legendado [CC]`).

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

---

## 🚦 Próximos Passos (Em Aberto)

### 🟠 P1 — Curadoria & Conteúdo para Lançamento
- [ ] **Catálogo Atual:** 122 itens ativos (110 em `YouTube`, 2 em `Podcasts`, 6 em `Séries`, 4 em `Filmes`). `Professores` e `Sites` seguem aguardando curadoria/migração sob demanda.
- [ ] **Ingestão / Conversão de Lotes:** Converter ou ingerir canais de `YouTube`, `Professores` e `Podcasts` por idioma conforme solicitado pelo Vitor.

### 🟡 P2 — Deploy & Produção
- [ ] **Deploy Cloudflare Pages:** Executar `npm run build` e publicar `app/dist` no Cloudflare Pages (`biblioteca-infinita.pages.dev`) após fechar o lote inicial de lançamento.
