# Açaí do Parque - Sistema de Pedidos Online

Sistema completo de pedidos online para a loja **Açaí do Parque** (Canoas - RS), com fluxo estilo app de delivery:

- Cardápio dinâmico com tamanhos e adicionais
- Montagem do pedido com preço em tempo real
- Carrinho com edição de quantidade e remoção
- Persistência do carrinho em `localStorage`
- Checkout com validação de dados
- Finalização automática no WhatsApp (`5551985014767`)
- Backend em Node.js + Express com armazenamento local em JSON

## Tecnologias

- Frontend: HTML + CSS + JavaScript
- Backend: Node.js + Express
- Banco de dados: JSON local (`data/orders.json`)

## Rodar localmente

```bash
npm install
npm run dev
```

Abra no navegador:

```text
http://localhost:3000
```

## Estrutura

```text
.
├─ public/
│  ├─ index.html
│  ├─ styles.css
│  └─ app.js
├─ data/
│  ├─ menu.json
│  └─ orders.json
├─ server.js
└─ package.json
```

## API

- `GET /api/menu`: retorna cardápio completo.
- `POST /api/orders`: valida e grava pedido em `data/orders.json`.
- `GET /healthz`: health check simples.

## Observação

O arquivo `data/menu.json` pode ser editado para alterar preços, tamanhos e adicionais sem mudar o frontend.
