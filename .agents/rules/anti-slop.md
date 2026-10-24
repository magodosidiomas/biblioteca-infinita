# GEMINI.md — Regras de Projeto: Anti-Slop, Acessibilidade & Impeccable Craft

> **Diretriz Suprema:** Este projeto prioriza acabamento artesanal de nível mundial (padrão Impeccable / Raycast / Imerso), contraste estrito, piso de acessibilidade tipográfica, consumo cirúrgico de tokens e tolerância ZERO a clichês de IA ("AI slop").

---

## 1. Regras Anti-Slop de Interface & Acessibilidade (Padrão Impeccable)

### 1.1. Tipografia & Legibilidade (Piso Rígido)
- ❌ **PROIBIDO fontes minúsculas abaixo de 12px:**
  - Zero `text-[9px]`, `text-[10px]` ou `text-[11px]` em textos informativos ou funcionais.
  - Tags/Badges: Mínimo absoluto de **12px** (`text-xs font-medium`).
  - Inputs de busca e formulários: Mínimo de **14px** (`text-sm`) para evitar zoom indesejado no mobile e garantir legibilidade rápida.
  - Bios e descrições: **13px a 14px** com entrelinha arejada (`leading-relaxed text-zinc-300`).
  - Títulos: **15px a 16px bold** (`text-zinc-100`).

### 1.2. Contraste & Paleta Silenciosa (WCAG AA)
- ❌ **PROIBIDO texto cinza desbotado ou ilegível contra fundo escuro:**
  - Textos de leitura e placeholders devem ter contraste $\ge$ 4.5:1.
  - Superfície dos cards: `#111114` sobre canvas `#09090b`.
- ❌ **PROIBIDO "Arco-Íris de Badges" & Emojis em Tags:**
  - Sem badges rosa, verde-limão e roxo competindo no mesmo card.
  - Badges utilizam fundo grafite neutro (`bg-[#18181b] text-zinc-300 border border-zinc-700/50`).
  - Sem emojis infantis soltos em tags (`🌱`, `💬`, `⚡`). Use texto refinado ou pequenos pontos geométricos.

### 1.3. Geometria, Dividers & Respiro Espacial
- ❌ **PROIBIDO amontoamento de containers:**
  - Sem caixas aninhadas sem propósito ("cards dentro de cards dentro de boxes").
  - O respiro vertical entre título, bio e tags deve ser simétrico e perceptível (espaçamento de 12px a 16px).
- ❌ **PROIBIDO dividers colados ou assimétricos:**
  - Qualquer divisor (`border-t`, `<hr>`) deve ter padding rigorosamente igual acima e abaixo. Se não for perfeito, não use divisor.

---

## 2. Navegação Escalável & Sem Peso Excessivo

- ❌ **PROIBIDO segmented controls estreitos estilo Linear:**
  - Abas encapsuladas não escalam quando mais categorias são criadas e quebram no mobile.
- ✅ **Navegação Horizontal Descomplicada (Tabs com Respiro Editorial):**
  - Abas limpas no topo com espaçamento generoso e indicador sutil:
    `YouTube` | `Professores` | `Podcasts` | `Séries & Filmes` | `Sites`
  - Seletor de idioma fica no TopNav à direita (`🇬🇧 English ▾`).

---

## 3. Regras de Conteúdo & Automação

### 3.1. Separação de Conteúdo (Imersão vs. Professores)
- Canais de **"Professores"** (que ensinam regras gramaticais, vocabulário pontual, dicas de estudo) não se misturam com canais de **"YouTube (Imersão Nativa)"**.
- Professores pertencem à sua própria aba dedicada.

### 3.2. Metadados Oficiais do YouTube
- Nome do canal, foto de avatar e bio devem ser extraídos diretamente das fontes oficiais do YouTube.
- ❌ **PROIBIDO inventar descrições sintéticas por IA.**

---

## 4. Eliminação Total de Textos Inúteis ("AI Tells")

- ❌ **PROIBIDO qualquer slogan promocional ou de autoelogio:**
  - Banido: *"100% autênticos e verificados"*, *"Explore nossa vasta biblioteca"*, *"Catálogo atualizado diariamente"*, *"Imersão garantida"*.
- ✅ **Ações Diretas em Verbo Imperativo + Objeto Direto:**
  - `Limpar filtros`, `Abrir ↗`, `Favoritar`.

---

## 5. Limites de Arquitetura de Código & Tokens

- **Limite de Tamanho:** Nenhum componente pode exceder **200 linhas de código**. Decomponha imediatamente em subcomponentes ou hooks.
- **Edições Cirúrgicas:** Use `replace_file_content` para alterações cirúrgicas. Nunca reescreva arquivos inteiros para mudar poucas linhas.
- **Visual Preview First:** Toda proposta visual precisa de aprovação prévia em HTML interativo leve antes de ser codificada no React.
