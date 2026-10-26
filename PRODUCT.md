# PRODUCT.md — Biblioteca Infinita

## 1. Visão Geral do Produto
- **Nome:** Biblioteca Infinita
- **Ecossistema:** Mago dos Idiomas
- **Propósito:** Plataforma de alta curadoria e descoberta de conteúdo para estudantes de idiomas, substituindo bancos de dados despadronizados por uma experiência de navegação rápida, acessível e focada em imersão real.
- **Público-alvo:** Estudantes poliglotas e alunos do método Mago dos Idiomas que buscam materiais adequados aos seus objetivos, sejam canais nativos ou orientações pedagógicas de professores.

---

## 2. Taxonomia de Conteúdo & Abas Escaláveis
O catálogo separa claramente conteúdos de **imersão nativa autêntica** de conteúdos de **instrução direta (professores)** para que a intenção do estudante nunca seja confundida:

1. **`YouTube` (Imersão Nativa):** Canais em que nativos falam para nativos sobre seus próprios interesses (ciência, tecnologia, história, vlogs, humor, cultura).
2. **`Professores` (Instrução & Dicas):** Canais dedicados ao ensino do idioma (explicações gramaticais, "como usar XYZ", pronúncia guiada, dicas de vocabulário).
3. **`Podcasts`:** Programas de áudio nativos e mesas-redondas para escuta passiva e ativa.
4. **`Séries`:** Produções seriadas em formato pôster vertical (`2:3`), sem sinopse no card, com indicação de onde assistir (`Netflix`, `YouTube`, `Disney+`, `Prime Video`, `Apple TV+`, `Max`), áudio original vs. dublado (`Original em ...`) e `Legendado [CC]`.
5. **`Filmes`:** Longas-metragens separados de `Séries` em aba própria, compartilhando a mesma arquitetura de pôster vertical `2:3`.
6. **`Sites`:** Jornais, leituras graduadas, ferramentas e comunidades.
7. **`Pronúncia`:** Recursos focados em fonética, IPA, entonação e shadowing, divididos em dois blocos visuais: **Vídeos** (com miniatura 16:9 do YouTube, nome do canal e descrição do vídeo) e **Guias & Recursos** (artigos, sites e aplicativos com filtros rápidos `Vídeos`, `Artigos`, `Sites`, `Apps`).

---

## 3. Extração & Autenticidade dos Dados
- **Zero Síntese Artificial:** Proibido inventar descrições genéricas por IA.
- **Automação Oficial do YouTube:** O sistema extrai diretamente da fonte oficial do YouTube:
  - Nome exato do canal.
  - Avatar oficial em alta resolução (`og:image` / `channel avatar`).
  - Bio/descrição autêntica do canal.
- **Campos Adicionados pela Curadoria Mago:**
  - `beginnerFriendly` (booleano: `true` se acessível para iniciantes; desabilitado para a categoria `Professores`).
  - `subtitlesAvailable` (booleano: `true` se possui legendas manuais confiáveis em vídeos).
  - `transcriptUrl` (opcional, exclusivo para `Podcasts`: link clicável para transcrições).
  - `avgDuration` (opcional, exclusivo para `Podcasts`: duração média dos episódios extraída via RSS, ex: `~30 min`).
  - `platform` (exclusivo para `Séries` e `Filmes`: plataforma de streaming inferida automaticamente do link).
  - `originalLanguage` e `originalLanguageLabel` (exclusivos para `Séries` e `Filmes`: detectados automaticamente via APIs públicas TVMaze / iTunes Search + JSON-LD; se diferente do idioma da aba atual, sinaliza automaticamente `Dublado` + `Original em [Idioma]`).
  - `tags` / `topics` (temas atômicos canônicos validados via `app/src/constants/tags.ts`).

---

## 4. Filosofia de UX & Microcopy
- **Operate / Experience:** A interface não compete com o conteúdo. Zero slogans de autoelogio (*"catálogo atualizado"*, *"100% autêntico"*).
- **Acessibilidade Universal:** Contraste mínimo WCAG AA em todos os textos, piso tipográfico de 12px para tags e 14px para inputs de busca e leitura.
- **Ações Diretas:** `Limpar filtros`, `Abrir ↗`, `Favoritar`.

---

## 5. Experiência Mobile & Responsividade
- **Smart Auto-hide no Scroll:** Em viewports mobile (`< 768px`), o conjunto unificado do topo (Header + FilterBar) desliza suavemente para fora (`-translate-y-full`) ao rolar para baixo, liberando 100% da altura da tela para os cards. Qualquer toque de rolagem para cima reexibe o topo imediatamente. Permanece sempre fixo quando o campo de busca estiver focado.
- **Linha Única de Filtros Rápidos:** No mobile, os controles de filtro e ordenação não quebram em múltiplas linhas verticais. Ficam alinhados em uma linha única horizontal com rolagem por toque suave (`overflow-x-auto no-scrollbar`), trazendo o gatilho de **Categorias** na primeiríssima posição.
- **Bottom Sheet de Categorias (Drawer Inferior):** Em telas mobile, o filtro de categorias abre um drawer tátil inferior com busca dedicada, área de tópicos ativos para desmarcar em 1 toque, espaçamento arejado de 4px entre itens, ausência de caixas ou dividers pesados, ação de "Limpar" contextual e botão "Ver resultados". No desktop, o combobox flutuante permanece ativo.
