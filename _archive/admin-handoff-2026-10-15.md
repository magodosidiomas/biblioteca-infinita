# Admin YouTube — Handoff

Escopo: só YouTube. Regra: **preview HTML offline aprovado antes de qualquer código React.** Não construir UI antes de o usuário confirmar o entendimento.

## Requisitos fechados
- Tela "Novo conteúdo", tela cheia, mínimo de elementos.
- Primeiro campo: colar o link. Puxa automaticamente ícone, título, descrição (og:*).
- Iniciante e Legendas: chip clicável (liga/desliga).
- Tags: combobox.
- Depois: desenhar a tela de editar conteúdo existente.

## Em aberto
- Como adicionar idioma. Onde fica o sotaque (lista depende do idioma).
- Iniciante para Professores.

## Fatos do código
- `app/vite-admin-plugin.ts`: só dev (`apply: 'serve'`). Endpoints: fetch-meta, save-content, delete-content, refresh-avatar, regenerate-metadata, bulk-delete, bulk-move.
- **Desconexão:** o plugin grava em `app/src/data/content.json` (legado, 638 KB); o app lê `app/src/data/channels.ts`.
- `fetch-meta` raspa og:title/description/image (sem API do YouTube) e detecta idioma (padrão inglês).
- Legado: `_archive/legacy-app/AdminForm.tsx` (2259 linhas): duplicados por URL/handle/nome, undo, drawer, ações em massa.
- Tags: `app/src/constants/tags.ts` (`TAG_CATEGORIES`, `ALL_CANONICAL_TAGS`, `TAG_ALIASES`, `resolveTag`).
- `ChannelItem` (`types/content.ts`) não tem campo de idioma; `accent` é string|null.

## Grill-me Rodada 1 (sem resposta ainda; recomendação entre parênteses)
1. Fonte única `channels.json`, lida pelo app e gravada pelo plugin dev. (Sim)
2. Tela começa só com o campo de link; após colar, aparece o card 4A ao vivo com título/bio editáveis inline; chips e tags abaixo. (Sim)
3. Descrição = og:description literal, editável, sem IA; card corta em 3 linhas, texto completo salvo. (Sim)
4. Chips "Imersão" (padrão) e "Professor" no topo. (Sim)
5. Três chips toggle numa linha: Iniciante, Legendado, Não-nativo. (Sim)
6. Idioma vem do seletor da barra do admin (padrão English); detecção só avisa se divergir. (Sim)
7. Combobox busca vocabulário canônico (aliases via `resolveTag`); Enter cria tag normalizada; máx. 4. (Sim)
8. Duplicado: "Já cadastrado" + botão "Editar este canal". (Sim)
9. Ctrl+Enter salva, reseta, foco volta ao link, toast de desfazer. (Sim)

## Rodada 2 (após respostas)
Sotaque (posição e opções), Iniciante p/ Professor, tela de edição, atalhos.

## Arquivos
- Card aprovado: 4A (`app/src/components/ChannelCard.tsx`).
- `preview-admin.html`: **descartado**, prematuro.
- `admin-planning.md` (artifacts): **superado** por este doc.
