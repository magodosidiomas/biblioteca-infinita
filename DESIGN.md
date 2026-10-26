# DESIGN.md — Sistema de Design & Padrão de Artesanato (Impeccable Craft)

> **Referência Canônica de Interface:** Este documento estabelece os padrões visuais, tipográficos, espaciais e de acessibilidade da Biblioteca Infinita. Nenhuma interface pode ser implementada ou alterada em desacordo com as regras abaixo.

---

## 1. Princípios Fundamentais & Anti-Slop (Padrão Impeccable)

- **Modo de Operação:** `Operate / Experience`. A interface recua para que o criador e o conteúdo autêntico sejam os protagonistas. Zero ornamentação vazia.
- **Contraste & Acessibilidade Estrita (WCAG AA):**
  - Textos de leitura (bios, descrições, labels): Contraste mínimo de **4.5:1** contra a superfície.
  - Títulos e textos grandes: Contraste mínimo de **3:1**.
  - Proibido texto cinza desbotado de baixo contraste (`text-zinc-600` ou similar para leitura é banido).
- **Piso Tipográfico Absoluto (Zero Fontes Ilegíveis):**
  - **Proibido texto menor que 12px em qualquer lugar.**
  - **Controles Interativos, Botões e Filtros:** Mínimo obrigatório de **14px** (`text-sm font-medium`). Proibido `text-xs` (12px) em botões de ação, filtros ou menus.
  - **Inputs de busca e formulários:** Mínimo **14px** (evita zoom no mobile e garante legibilidade imediata).
  - **Bios e descrições:** **13px a 14px** com entrelinha arejada (`leading-relaxed text-zinc-300`).
  - **Títulos:** **15px a 16px bold** com tracking equilibrado (`tracking-[-0.015em]`).
  - **Tags e Badges Informativas:** Mínimo **12px** (`text-xs font-medium`), restrito a tags passivas dentro de cards.
- **Eliminação de Amontoamento de Containers:**
  - Proibido "cards dentro de cards dentro de caixas".
  - A interface deve respirar. Respiro vertical simétrico e generoso.
- **Divisores Decorativos Banidos:**
  - Proibido enfiar `<hr>`, `border-t` ou `border-b` em rodapés de menus, dropdowns ou entre barras de controle e o grid. Se não for estruturalmente indispensável, **não use divisor**.
- **Iconografia Oficial (lucide-react):**
  - Proibido caracteres de texto soltos (`↗`, `+`, `x`). Use sempre ícones SVG oficiais do `lucide-react`.
  - Tamanho padrão `w-4 h-4` (16px) ou `size-[18px]` com `stroke-[1.5]` ou `stroke-[1.75]` e `shrink-0`. Evite `stroke-[2.5]` ou ícones deformados.
- **Isolamento de Overflow (Mobile vs. Desktop):**
  - Nunca coloque `overflow-x-auto` ou `overflow-hidden` em containers pais que abrigam popovers flutuantes ou comboboxes. Scroll horizontal fica restrito ao mobile (`max-md:overflow-x-auto`), com `overflow-visible md:flex-wrap` no desktop.

---

## 2. Paleta de Cores Silenciosa & Acessível

- **Canvas de Fundo:** `#09090b` (preto profundo, sem brilhos neon).
- **Superfície dos Cards:** `#111114` (elevação única e coesa).
- **Superfície Hover:** `#16161a` com transição suave (`transition-colors duration-150`).
- **Bordas Estruturais:** Linhas capilares discretas em `rgba(255, 255, 255, 0.08)` (`#27272a`).
- **Paleta de Badges (Fim do Arco-Íris de IA):**
  - Proibido colorir badges com pastéis neon aleatórios (rosa choque, verde fluorescente, azul bebê).
  - Badges utilizam fundo neutro grafite: `bg-[#18181b] text-zinc-300 border border-zinc-700/50`.
  - Destaque sutil de iniciante: Tom oliva escuro e acessível (`bg-[#152319] text-emerald-300 border border-emerald-800/40`), nunca neon.
- **Acentos Funcionais:**
  - Coração / Favorito ativo: `#f43f5e` (Rose 500) com contraste garantido.
  - Foco de teclado / anéis de seleção: `#8b5cf6` (Purple 500).

---

## 3. Tipografia & UX-Writing

- **Família:** `Plus Jakarta Sans`, sans-serif humanista moderna.
- **Eliminação Total de Textos Inúteis ("AI Tells"):**
  - ❌ BANIDO: *"100% autênticos e verificados"*, *"Explore os melhores canais"*, *"Catálogo atualizado"*, *"Imersão total"*.
  - A interface não faz propaganda de si mesma. Apenas dados úteis e navegação.
- **Microcopy de Ações:**
  - Verbo Imperativo + Objeto Direto (acompanhado de ícone SVG oficial do `lucide-react`, nunca caractere `↗`): `Limpar filtros`, `Abrir` + `<ExternalLink />`, `Favoritar`.

---

## 4. Arquitetura de Navegação Leve & Escalável

- **Problema do Modelo Anterior:** Segmented controls encapsulados estreitos não escalam quando mais categorias são adicionadas (ficam pesados e quebram no mobile).
- **Novo Padrão:** **Navegação Horizontal Descomplicada (Tabs com Respiro Editorial):**
  - Abas limpas no topo com espaçamento generoso e indicador sutil de estado ativo:
    `YouTube` | `Professores` | `Podcasts` | `Séries` | `Filmes` | `Sites` | `Pronúncia`
  - Escala naturalmente para quantos formatos o catálogo precisar, sem caixas sufocantes.
- **Seletor de Idioma:** TopNav superior direito, independente e claro, com ícone `<ChevronDown />` de `lucide-react`.

---

## 5. Estrutura do Card de Canal (YouTube / Professores / Podcasts)

- **Avatar:** 44px a 48px circular com anel interno delicado (`ring-1 ring-white/10`). Fallback tipográfico caso a imagem falhe.
- **Metadados Oficiais do YouTube:** Nome do canal e descrição puxados automaticamente da API/metadata do YouTube, sem síntese artificial.
- **Respiro Interno:**
  - Espaço de 12px entre o cabeçalho do card e a descrição.
  - Espaço de 16px entre a descrição e a linha de badges.
  - Padding interno do card simétrico: 20px (`p-5`).
- **Linha de Badges:**
  - Badges de 12px com texto legível (`Iniciante`, `Com legendas`, `Cultura`, `Ciência`).
  - Sem emojis infantis soltos como ícones principais.
- **Interação:**
  - Título e avatar abrem o canal no YouTube (`target="_blank"`).
  - Ícone de favorito no canto superior direito com área de toque de 36x36px.

---

## 6. Estrutura do Card de Pôster Vertical (`Séries` & `Filmes`)

- **Proporção & Grid:** Pôster vertical `2:3` (`aspect-[2/3]`) em grid de 3 colunas no desktop (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`).
- **Sem Sinopse no Card:** 75% da arte do pôster permanece livre; a leitura da sinopse fica reservada para a página da plataforma de streaming.
- **Topo sobre o Pôster:**
  - Esquerda: Pill com o nome da plataforma (`Netflix`, `YouTube`, `Disney+`, `Prime Video`, `Apple TV+`, `Max`) em fundo translúcido (`bg-zinc-950/80 backdrop-blur-md`), sem bolinhas coloridas decorativas.
  - Direita: Botão circular de Favorito (catálogo público) ou botão `Editar` no hover (painel Admin).
- **Base sobre Gradiente Escuro (`linear-gradient(to top, #09090b 0%, rgba(9,9,11,0.95) 22%, rgba(9,9,11,0.65) 42%, rgba(9,9,11,0.12) 68%, rgba(9,9,11,0.05) 100%)`):**
  - **Título:** `18px bold` (`text-lg font-bold text-white`) + ícone sutil de link externo.
  - **Linha de Subtítulo Editorial:** Até 2 gêneros separados por ponto médio `·` (`Sitcom · Cotidiano`). Quando a obra é assistida dublada (`originalLanguage !== language`), exibe na mesma linha ` · Original em [Idioma]` em âmbar (`text-amber-300 whitespace-nowrap`).
  - **Linha Única de Badges Pedagógicas:** `Iniciante` (quando aplicável), `Áudio Original` (esmeralda) vs. `Dublado` (âmbar) e `Legendado [CC]` (com colchetes `[CC]`). Sem classificação indicativa (`12+`, `Livre`).
