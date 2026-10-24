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
