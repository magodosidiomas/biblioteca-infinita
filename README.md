# 🧙🏻‍♂️ Biblioteca Infinita

Plataforma de descoberta e curadoria de conteúdo autêntico de imersão para estudantes de idiomas (YouTube, Podcasts, Séries e Sites), parte do ecossistema **Mago dos Idiomas**.

---

## 📚 Documentação do Projeto

Para garantir consistência e evitar retrabalho entre sessões e chats, toda a arquitetura está mapeada nestes arquivos canônicos:

| Arquivo | Descrição |
| :--- | :--- |
| [**`INFRASTRUCTURE.md`**](file:///c:/Users/vitor/Desktop/AI/immersion-library/INFRASTRUCTURE.md) | Contas, GitHub (`magodosidiomas/biblioteca-infinita`), hospedagem (**Cloudflare Pages** `biblioteca-infinita.pages.dev`), comandos de build e deploy. |
| [**`PRODUCT.md`**](file:///c:/Users/vitor/Desktop/AI/immersion-library/PRODUCT.md) | Visão geral do produto, público-alvo, idiomas, formatos de mídia e filosofia anti-slop. |
| [**`DESIGN.md`**](file:///c:/Users/vitor/Desktop/AI/immersion-library/DESIGN.md) | Regras fechadas (Locked Rules) de UI/UX, tokens de cor Dark Mode, grids responsivos (desktop/mobile artcraft), tipografia e comportamento de popovers/bottom sheets. |
| [**`CONTENT_GUIDE.md`**](file:///c:/Users/vitor/Desktop/AI/immersion-library/CONTENT_GUIDE.md) | Guia completo e conciso de como atualizar, adicionar itens nas 5 categorias, auditar e fazer deploy do acervo. |

---

## 🚀 Live & Repositório

- **Produção:** [https://biblioteca-infinita.pages.dev](https://biblioteca-infinita.pages.dev)
- **Repositório GitHub:** [https://github.com/magodosidiomas/biblioteca-infinita](https://github.com/magodosidiomas/biblioteca-infinita)
- **Hospedagem:** Cloudflare Pages (Conta: `languagelaboratory22@gmail.com`)

---

## 🛠️ Comandos de Desenvolvimento

```bash
# Rodar aplicação localmente (SPA React + Vite)
npm --prefix app run dev

# Compilar para produção
npm --prefix app run build

# Deploy direto no Cloudflare Pages
npx wrangler pages deploy app/dist --project-name biblioteca-infinita --commit-dirty=true
```
