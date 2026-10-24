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
  - ❌ **PROIBIDO truncar tags:** Nunca use `truncate` ou `max-w-[...]` que corte o texto de tags/badges (`topics`). Devem sempre quebrar em linha (`flex-wrap`) ou exibir o texto completo.

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

### 3.2. Metadados Oficiais do YouTube (Tolerância Zero a Descrições de IA)
- Nome do canal, foto de avatar e bio/descrição **DEVEM** ser extraídos diretamente e verbatim das fontes oficiais do YouTube (aba "About", metatag oficial, descrição da playlist ou do vídeo).
- ❌ **TERMINANTEMENTE PROIBIDO inventar, resumir ou sintetizar descrições autorais por IA.** Não crie sinopses da sua cabeça.
- Se for uma playlist ou série hospedada no YouTube (ex: *Extra*), extraia a descrição oficial da playlist/vídeo no YouTube ou da emissora produtora original.

### 3.3. Taxonomia Atômica de Tags (Proibição de Termos Duplos & Conectivos)
- ❌ **TERMINANTEMENTE PROIBIDO tags compostas ou com conectivos (`&`, `e`, `/`):**
  - Banido: `"Cultura e Entretenimento"`, `"Gastronomia & Culinária"`, `"Ciência & Astronomia"`, `"Notícias & Atualidades"`, `"Comédia & Humor"`.
  - Tags genéricas de "saco-de-gatos" como `"Cultura e Entretenimento"` ou `"Geral"` são estritamente proibidas.
- ✅ **Tags Atômicas e Conceituais Únicas:**
  - Cada tag deve representar um conceito claro e único: `Gastronomia`, `Ciência`, `Humor`, `Notícias`, `Cinema`, `Vlog`, `Experimentos`, `Streamer`, `League of Legends`.
  - Sinônimos e termos compostos devem ser tratados como **aliases** no dicionário `TAG_ALIASES` (ex: `Culinária` -> `Gastronomia`, `Comédia` -> `Humor`, `LoL` -> `League of Legends`).
  - Reserve tags informativas de alta relevância (ex: `Notícias` somente para jornalismo e veículos jornalísticos reais, nunca para canais de variedades/curiosidades).

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

---

## 6. Fidelidade Irrevogável aos Previews Aprovados (Regra Anti-Invenção)

> ⛔ **CLÁUSULA PÉTREA DE DESIGN:** Uma vez que um preview em HTML na pasta `previews/` é aprovado pelo usuário, ele se torna o **único contrato de verdade visual**.

- ❌ **PROIBIDO "reinventar" na hora de codificar no React:**
  - Se o preview usou um drawer lateral (sheet), é OBRIGATÓRIO codificar um drawer lateral. Zero páginas novas ou modais improvisados.
  - Se o preview não tem divisores nos cards, é TERMINANTEMENTE PROIBIDO enfiar `<hr>`, `border-t` ou linhas divisórias no React.
  - Se o botão de editar é no hover do card, ele DEVE ser no hover do card.
  - Se a tela tem 2 colunas com preview ao vivo à direita (como em `preview-admin-novo.html`), o React DEVE espelhar exatamente essa estrutura.
- ❌ **PROIBIDO adicionar recursos "não solicitados" por iniciativa própria:**
  - Não adicione filtros extras, dropdowns improvisados ou botões que não estavam no preview aprovado.
- ✅ **Portabilidade 1:1 Garantida:**
  - Ao transpor um preview para React, use as exatas classes CSS/Tailwind, estrutura DOM e fluxos interativos do HTML aprovado.
  - Apenas lógica funcional de estado (props, hooks, persistência) é plugada; a anatomia visual permanece intocada.

---

## 7. Checklist Obrigatório Anti-Regressão (Antes de Entregar ao Usuário)

Antes de responder ao usuário dizendo que uma tarefa está pronta, o agente é OBRIGADO a executar e validar internamente:
1. **Verificação de Assets Externos:** Imagens e avatares externos possuem `referrerPolicy="no-referrer"` e fallback visual para evitar telas em branco ou hotlink bloqueado?
2. **Auditoria de Interação:** Todos os elementos clicáveis (`button`, `a`, abas, filtros) possuem `cursor: pointer` explícito e feedback visual no hover?
3. **Sincronização de Estado & Anti-Zumbi:** O estado local (`localStorage` ou cache) não está sobrescrevendo dados recém-adicionados com arrays vazios legados? Itens deletados foram removidos de `content.json` E de `channels.ts` para evitar que ressuscitem?
4. **Verificação de Entrega Real no Servidor:** O assistente testou via requisição HTTP (`fetch('http://localhost:5173/api/get-channels')`) que os novos itens estão sendo de fato servidos pelo Vite antes de avisar o usuário?
5. **Confronto com o Preview:** A tela gerada no React foi comparada diretamente com o arquivo correspondente em `previews/`? Há qualquer desvio estrutural ou estético? Se houver, desfaça imediatamente.
6. **Double Check de Metadados Oficiais (Tolerância Zero a Descrições Criadas por IA):** O assistente conferiu item por item do lote para garantir que NENHUMA descrição foi inventada ou sintetizada por IA? Todas as bios devem ser trechos literais da aba "About" / metadados oficiais do YouTube/plataforma.
7. **Auditoria de Taxonomia Atômica:** Nenhuma tag nova contém conectivos (`&`, `e`), termos duplos ou generalismos vazios (`Cultura e Entretenimento`). Tags compostas foram unificadas em aliases canônicos.

---

## 8. Protocolo Rígido de Sincronização de Conteúdo (Anti-Cache & Anti-Zumbi)

> ⛔ **REGRA DE OURO:** "Salvo no disco" não significa "visível no navegador". O assistente é responsável pela integridade ponta a ponta.

1. **A Fonte da Verdade é Dupla e Inseparável:**
   - [`content.json`](file:///c:/Users/vitor/Desktop/AI/immersion-library/app/src/data/content.json) (banco de dados canônico).
   - [`channels.ts`](file:///c:/Users/vitor/Desktop/AI/immersion-library/app/src/data/channels.ts) (export tipado em TypeScript compilado pelo Vite).
   - **PROIBIDO** atualizar um sem o outro. Toda alteração deve refletir imediatamente em ambos via `syncChannelsTsFromData`.
2. **Eliminação de Itens Fantasma ("Zumbis"):**
   - Se o usuário diz que deletou um item, ele DEVE ser expurgado do `content.json`. Se ficar lá, a próxima sincronização irá ressuscitá-lo.
3. **Invalidação Obrigatória de Cache do Vite:**
   - Modificações feitas via scripts Node de background não disparam HMR do Vite com confiabilidade.
   - Sempre que alterar o catálogo, o assistente deve invalidar o cache (ex: atualizar timestamp de `vite.config.ts` ou checar que a resposta do Vite em `/src/data/channels.ts` reflete as novas adições).
4. **Comunicação de Abas Precisa:**
   - Ao adicionar ou mover itens, SEMPRE informe ao usuário exatamente em qual aba o item está (`YouTube` vs `Professores` vs `Podcasts`), evitando a falsa impressão de que "o admin está vazio".

---

## 9. Protocolo Anti-Alucinação & Verificação de Código Antes de Docs (Grounded Truth)

> ⛔ **PROIBIDO ALUCINAR ESTADO DO PROJETO:** O código-fonte em execução (`app/src/` e `scripts/`) é a única verdade factual sobre o que está construído.

1. **Código Precedente à Documentação:**
   - Jamais responda "o que falta fazer" ou afirme que uma funcionalidade não existe baseando-se apenas em arquivos `.md` antigos ou notas de handoff.
   - Antes de emitir qualquer diagnóstico de status, inspecione o JSX/TSX completo dos componentes em `app/src/components/` e o plugin em `app/vite-admin-plugin.ts`.
2. **Proibição de Leitura Parcial ("Lazy Reading"):**
   - Nunca leia apenas as primeiras 50-100 linhas de um componente (onde ficam apenas os hooks/estados) e assuma como o JSX é renderizado. Leia até o `return (...)` completo do componente antes de afirmar como a UI funciona.
3. **Higiene Síncrona de Documentação e Decisões:**
   - Sempre que uma feature for concluída ou o usuário fechar uma decisão de produto (ex: descartar `accent`, desabilitar `Iniciante` para `Professores`), atualize `TASKS.md` e `PRODUCT.md` imediatamente no mesmo turno.
   - Documentos de handoff ou rascunhos já implementados devem ser movidos imediatamente para `_archive/` para nunca induzir sessões futuras ao erro.


