/*
  ==========================================================
  SERVER.JS - BACKEND DA COFFEE CENTER
  ==========================================================

  Este arquivo é o coração do sistema: ele cria o servidor,
  conecta com o banco de dados, gerencia login e carrinho,
  e expõe rotas para o frontend consumir.

  O Express é o framework principal usado para receber
  requisições, responder em JSON e servir os arquivos estáticos.
*/

// Carrega as variáveis de ambiente do arquivo .env.
// Isso permite guardar informações sensíveis, como a secret da sessão,
// sem deixar no código fonte.
require("dotenv").config();

// Importa o framework Express, responsável por montar o servidor web.
const express = require("express");

// Importa o módulo 'path' para manipular caminhos de arquivos.
const path = require("path");

// Importa o CORS para permitir que o frontend acesse o backend
// mesmo em ambientes locais diferentes, como Live Server e localhost:3000.
const cors = require("cors");

// Importa o express-session para criar e controlar sessões do usuário.
const session = require("express-session");

// Importa o bcryptjs para criptografar senhas e comparar hashes.
const bcrypt = require("bcryptjs");

// Importa o pool de conexão com o MySQL.
const pool = require("./db.js");

// Cria a instância do servidor Express.
const app = express();

// Lista das origens permitidas para a aplicação.
// Isso bloqueia requisições vindas de outros domínios que não sejam confiáveis.
const listOrigins = [
    "http://localhost:5501",
    "http://127.0.0.1:5501",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://rickjordan20.github.io"
];

// Ativa o CORS para permitir comunicação entre frontend e backend.
// credentials: true é essencial para que cookies de sessão funcionem.
app.use(cors({
    origin: listOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Permite que o Express leia JSON enviado no corpo das requisições.
app.use(express.json());

// Serve arquivos estáticos da pasta raiz do projeto, como:
// HTML, CSS, JS, imagens, JSON e outros recursos públicos.
app.use(express.static(path.join(__dirname)));

// Configuração da sessão do usuário.
// A sessão guarda dados do usuário logado e identifica a pessoa no navegador.
const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "techeduca.sid",
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60
    }
};

// Verifica se o ambiente é produção para ajustar regras de cookie.
// Em produção, cookies precisam de secure + sameSite none para funcionar em HTTPS.
if (process.env.NODE_ENV == "production") {
    app.set("trust proxy", 1);
    sessionConfig.cookie.sameSite = "none";
    sessionConfig.cookie.secure = true;
} else {
    sessionConfig.cookie.sameSite = "lax";
    sessionConfig.cookie.secure = false;
}

// Faz o Express usar a configuração de sessão configurada acima.
app.use(session(sessionConfig));

/*
  ==========================================================
  ROTAS DO SERVIDOR
  ==========================================================
*/

// Exemplo simples de rota para testar se o servidor está funcionando.
// Em produção real, isso geralmente teria uso menor ou seria removido.
app.post("/mensagem", (req, res) => {
    console.log(req.body);
    res.send("Mensagem recebida com sucesso!");
});

// Rota de cadastro de usuário.
// Recebe nome, email e senha, verifica se o email já existe,
// gera o hash da senha e salva no banco.
app.post("/cadastro", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // Valida se todos os campos obrigatórios vieram preenchidos.
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: "Preencha todos os campos" });
        }

        // Consulta no banco para verificar se esse e-mail já está cadastrado.
        const [rows] = await pool.execute(
            "SELECT id FROM tb_usuarios WHERE email=?",
            [email]
        );

        if (rows.length > 0) {
            return res.status(409).json({ erro: "E-mail já cadastrado" });
        }

        // Criptografa a senha com custo 10 para aumentar a segurança.
        const senhaHash = await bcrypt.hash(senha, 10);

        // Insere o usuário no banco com a senha já protegida.
        await pool.execute(
            "INSERT INTO tb_usuarios(nome,email,senha) VALUES(?,?,?)",
            [nome, email, senhaHash]
        );

        res.status(201).json({ mensagem: "Cadastro realizado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao cadastrar usuário" });
    }
});

// Rota de login.
// Busca o usuário pelo e-mail, compara a senha e cria a sessão.
app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: "Preencha todos os campos" });
        }

        // Busca o usuário pelo email informado.
        const [rows] = await pool.execute(
            "SELECT id, nome, email, senha FROM tb_usuarios WHERE email=?",
            [email]
        );

        if (rows.length == 0) {
            return res.status(401).json({ erro: "Usuário não encontrado" });
        }

        const usuario = rows[0];

        // Compara a senha digitada com o hash salvo no banco.
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({ erro: "Senha inválida" });
        }

        // Armazena dados do usuário na sessão do navegador.
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        res.json({ mensagem: "Login realizado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao fazer login" });
    }
});

// Rota para consultar o estado da sessão.
// O frontend chama essa rota para saber se o usuário está logado.
app.get("/me", (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({ logado: false });
    }

    res.json({
        logado: true,
        usuario: req.session.usuario
    });
});

// Rota de logout.
// Destrói a sessão atual e limpa o cookie do navegador.
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("techeduca.sid");
        res.json({ mensagem: "Logout realizado" });
    });
});

// Rota para registrar um pedido.
// Só permite pedido para usuários autenticados.
app.post("/pedido", async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ erro: "Você precisa estar logado para finalizar o pedido" });
        }

        const { itens } = req.body;

        // Valida se o carrinho existe e tem ao menos um item.
        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ erro: "Carrinho vazio" });
        }

        // Busca o próximo número de chamado para o pedido.
        const [linhas] = await pool.execute(
            "SELECT COALESCE(MAX(numero_chamado), 0) + 1 AS proximo FROM pedidos"
        );

        const numeroChamado = linhas[0].proximo;

        // Salva cada item do carrinho em uma linha da tabela pedidos.
        for (const item of itens) {
            await pool.execute(
                "INSERT INTO pedidos(numero_chamado, nome_pedido, preco, quantidade) VALUES (?,?,?,?)",
                [numeroChamado, item.nome, item.preco, item.quantidade]
            );
        }

        res.status(201).json({
            mensagem: "Pedido realizado com sucesso!",
            numeroPedido: numeroChamado
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao registrar pedido" });
    }
});

// Define a porta onde o servidor vai ouvir.
const PORT = process.env.PORT || 3000;

// Inicia o servidor.
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});