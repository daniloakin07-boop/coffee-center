# Café Central — Web 

Aplicação web full-stack de gestão para cafeteria, desenvolvida como projeto integrador da Unidade Curricular UC8 – Desenvolver Aplicações Mobile (Senac-DF). Composta por uma API back-end e um front-end web.

> Para a versão mobile do projeto, veja o [README-mobile.md](./README-mobile.md).

## Objetivo do Projeto

Oferecer uma plataforma web para gerenciamento das operações de uma cafeteria (cardápio, pedidos, usuários e demais funcionalidades do domínio), aplicando na prática os conceitos de desenvolvimento full-stack e integração com banco de dados em nuvem.

## Tecnologias Utilizadas

**Back-end**
- Node.js + Express
- MySQL (hospedado na Aiven)
- CORS (`cors`) para liberação de acesso entre origens
- Deploy: Render

**Front-end**
- HTML, CSS e JavaScript puro
- Deploy: GitHub Pages

## Integrantes da Equipe

- [Nome completo] – [função/responsabilidade]
- [Nome completo] – [função/responsabilidade]
- [Nome completo] – [função/responsabilidade]

> Preencher com os integrantes reais da equipe antes da entrega.

## Requisitos para Execução

- [Node.js](https://nodejs.org/) v18 ou superior
- npm (instalado junto com o Node.js)
- Acesso a um banco de dados MySQL (local ou credenciais da instância Aiven do projeto)
- Git

## Passo a Passo para Instalar e Executar

### 1. Clonar o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd cafe-central
```

### 2. Back-end (API)
```bash
cd backend
npm install
```
Crie um arquivo `.env` na pasta `backend` com as variáveis de conexão do banco (não versionar este arquivo):
```
DB_HOST=<host_aiven>
DB_PORT=<porta>
DB_USER=<usuario>
DB_PASSWORD=<senha>
DB_NAME=<nome_do_banco>
PORT=3000
```
Inicie o servidor:
```bash
npm start
```
A API ficará disponível em `http://localhost:3000` (ou na porta configurada).

### 3. Front-end Web
```bash
cd frontend
```
Abra o `index.html` diretamente no navegador ou sirva a pasta com uma extensão como Live Server. Ajuste a URL da API consumida no arquivo de configuração do front, caso necessário.

## Organização do Projeto (parte Web)

```
cafe-central/
├── backend/          # API Node.js + Express (conexão com MySQL na Aiven)
├── frontend/         # Aplicação web (HTML/CSS/JS)
├── mobile/           # Aplicativo mobile (ver README-mobile.md)
├── README-web.md
├── README-mobile.md
└── CHANGELOG.md
```

## Documentação Complementar

Consulte o `CHANGELOG.md` para o histórico de versões, correções e melhorias implementadas ao longo do projeto e da manutenção pós-entrega.