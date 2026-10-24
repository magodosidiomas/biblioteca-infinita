# 📖 Guia de Atualização de Conteúdo — Biblioteca Infinita

Este guia documenta como o conteúdo da Biblioteca Infinita é estruturado, onde ele reside e os métodos oficiais para adicionar, atualizar ou auditar itens no catálogo.

---

## 1. Onde Fica o Conteúdo? (Dual-Sync Inseparável)

O acervo opera com **Sincronização Atômica Dupla**:
1. 📍 [`app/src/data/content.json`](file:///c:/Users/vitor/Desktop/AI/immersion-library/app/src/data/content.json) — Banco de dados canônico dividido por idioma e formato.
2. 📍 [`app/src/data/channels.ts`](file:///c:/Users/vitor/Desktop/AI/immersion-library/app/src/data/channels.ts) — Array plano tipado (`ChannelItem[]`) gerado automaticamente a partir do `content.json`.

Toda alteração via Admin UI (`/admin`), `scripts/ingest.js` ou `npm run sync` atualiza ambos os arquivos automaticamente. O script [`scripts/validate-catalog.js`](file:///c:/Users/vitor/Desktop/AI/immersion-library/scripts/validate-catalog.js) valida a paridade 1:1 antes de cada build.

Estrutura de `content.json` por idioma (`english`, `german`, `french`, `spanish`, `italian`, `russian`, `japanese`, `portuguese`, `polish`, `ukrainian`, `arabic`, `latin`):

```json
{
  "english": {
    "YouTube": [ ... ],
    "Professores": [ ... ],
    "Podcasts": [ ... ],
    "Séries": [ ... ],
    "Recursos": [ ... ]
  }
}
```

---

## 2. As 5 Categorias e Quando Usar Cada Uma

| Categoria (`content.json` ➔ `channels.ts`) | Propósito | Regras Específicas |
| :--- | :--- | :--- |
| **`YouTube` ➔ `youtube`** | **Imersão Nativa Pura.** Canais de nativos falando para nativos (ciência, vlogs, gastronomia, tecnologia, humor). | Suporta `beginnerFriendly` (`Iniciante`) e `subtitlesAvailable` (`Legendado`). Zero canais de aula. |
| **`Professores` ➔ `professores`** | **Instrução & Ensino.** Canais que ensinam o idioma, gramática, pronúncia e dicas de estudo. | Não utiliza a flag `Iniciante` (categoria própria). Suporta `subtitlesAvailable` (`Legendado`). |
| **`Podcasts` ➔ `podcasts`** | **Áudio & Escuta.** Podcasts nativos ou adaptados (Spotify / Apple Podcasts / RSS). | Suporta `beginnerFriendly`, `transcriptUrl` (badge clicável `Transcrição`) e `avgDuration` (`Episódios de ~30 min`). |
| **`Séries` ➔ `series`** | **Séries & Filmes.** Produções audiovisuais para imersão. | Em expansão futura. |
| **`Recursos` ➔ `sites`** | **Sites, Leituras & Ferramentas.** Portais de notícias, leituras graduadas e comunidades. | Em expansão futura. |

---

## 3. Métodos para Adicionar ou Editar Conteúdo

### Método 1: Painel Admin Visual (`http://localhost:5173/admin`)
1. Clique em **`+ Novo conteúdo`** no topo do Admin.
2. Cole o link do canal do YouTube ou podcast do Spotify.
3. O sistema raspa título, descrição oficial verbatim e avatar, audita legendas CC nos últimos 10 vídeos (ou duração média via RSS para podcasts), verifica duplicatas e exibe o **Preview do Card 4A ao vivo** à direita.
4. Ajuste formato (`YouTube`, `Podcast`, `Professor`), opções (`Iniciante`, `Legendado`, `Não-nativo`) e tags canônicas.
5. Pressione `Ctrl + Enter` (ou clique em **Salvar conteúdo**).
6. Para editar um item existente, passe o mouse sobre o card na aba **Conteúdos** e clique em **Editar** para abrir o drawer lateral.

### Método 2: Motor de Ingestão via CLI / Chat (`scripts/ingest.js`)
Para adicionar canais do YouTube individualmente ou em lote pelo terminal/chat:
```bash
node scripts/ingest.js <url1> [url2...] --lang <idioma> [--format YouTube|Professores] [--tags "Tag1,Tag2"] [--beginner]
```
Veja detalhes completos em [HOW_TO_ADD_CHANNELS.md](HOW_TO_ADD_CHANNELS.md).

### Método 3: Sincronização e Validação Manual
Se editar `app/src/data/content.json` via script:
```bash
# 1. Sincronizar channels.ts a partir do content.json
npm run sync

# 2. Validar paridade, taxonomia canônica e anti-slop
npm run validate:catalog
```

---

## 4. Deploy para Produção (Cloudflare Pages)

```bash
# 1. Executar validação + typecheck + build de produção
npm run build

# 2. Publicar no Cloudflare Pages
npx wrangler pages deploy app/dist --project-name biblioteca-infinita --commit-dirty=true
```
