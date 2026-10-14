# INFRASTRUCTURE.md — Arquitetura de Hospedagem & Deploy

> **Documento Canônico de Infraestrutura:** Define contas, repositórios, credenciais e pipelines de build/deploy da **Biblioteca Infinita**. Consulte este arquivo antes de alterar qualquer configuração de ambiente ou deploy.

---

## 1. Contas & Provedores

- **Organização / Identidade:** `Mago dos Idiomas`
- **Email / Proprietário:** `languagelaboratory22@gmail.com`
- **Hospedagem Frontend:** **Cloudflare Pages** (mesma conta usada no `imerso`)
- **Controle de Versão:** **GitHub** (usuário `magodosidiomas`)

---

## 2. Repositório GitHub

- **URL do Repositório:** [https://github.com/magodosidiomas/biblioteca-infinita](https://github.com/magodosidiomas/biblioteca-infinita)
- **Nome:** `biblioteca-infinita`
- **Branch Principal:** `main`
- **Visibilidade:** Pública
- **Remoto Git Local:** `origin -> https://github.com/magodosidiomas/biblioteca-infinita.git`

---

## 3. Hospedagem Cloudflare Pages

- **Nome do Projeto Pages:** `biblioteca-infinita`
- **Account Name:** `Languagelaboratory22@gmail.com's Account`
- **Account ID:** `bd8d27b8235a4e99bfbfdadec70bfa7e`
- **Production Branch:** `main`
- **URL Canônica de Produção:** [https://biblioteca-infinita.pages.dev](https://biblioteca-infinita.pages.dev)
- **Framework / Runtime:** SPA React + Vite + Tailwind CSS (estático compilado em `app/dist`)

---

## 4. Pipeline de Build & Deploy Local

Sempre que forem feitas mudanças no frontend ou dados:

```bash
# 1. Build da aplicação React
npm --prefix app run build

# 2. Deploy para Cloudflare Pages
npx wrangler pages deploy app/dist --project-name biblioteca-infinita --commit-dirty=true

# 3. Commit e push para o GitHub
git add -A
git commit -m "feat/fix: <descrição>"
git push origin main
```

---

## 5. Histórico de Decisões de Infraestrutura

- **14/10/2026:**
  - Repositório inicializado e vinculado a `magodosidiomas/biblioteca-infinita`.
  - Projeto criado no Cloudflare Pages sob o nome `biblioteca-infinita`.
  - Configurado `.gitignore` estrito para manter fora caches (`.wrangler/`), `node_modules` e zips pesados brutos (`Notion exports/*.zip`).
