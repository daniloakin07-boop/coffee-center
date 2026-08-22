/* 
===============================================
1 PARTE - CONFIGURAR O SERVIDOR
===============================================
*/
// Importar as credenciais do banco
require("dotenv").config();
 
// 1. Importar o Express - ele cria e gerencia o servidor
const express = require("express");
const path = require("path");
 
// 2. Importar o CORS - permite que o navegador "converse" com o servidor
const cors = require("cors");
 
// 3. Importa o session  que permite gerenciar sessões de usuario
const session = require("express-session");
 
// 4. Importa o bcryptjs - para criptografia e compara senhas
const bcrypt = require("bcryptjs");
 
// 5. Importa a conexão com o banco de dados
const pool = require("./db.js");
 
// 6. Cria o servidor (como ligar um pc por ex)
const app = express();
 
// 7. Cria uma lista de instância de conexões
const listOrigins = [
    "http://localhost:5501", // ambiente local (live server)
    "http://127.0.0.1:5501", // variação de localhost
    "http://localhost:5500", // porta padrão do Live Server
    "http://127.0.0.1:5500", // porta padrão do Live Server (variação)
    "https://rickjordan20.github.io" // dominio do frontend em produção
]
 
// 8. Ativa o CORS - libera a comunicação entre front-end e back-end
app.use(cors({
    origin:listOrigins, // só aceita requisições dessas origens
    credentials:true, // permite o envio de cookies entre domínios
    methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'], 
        // métodos permitidos
    allowedHeaders: ["Content-Type","Authorization"] //cabeçalhos aceitos
}));
 
// 9. Ativa o leitor de JSON - permite entender os dados recebidos
// Sem isso, o servidor não consegue ler o que o formulário envia
app.use(express.json());

// 10. Serve os arquivos estáticos do projeto (HTML, CSS, JS, imagens e JSON)
app.use(express.static(path.join(__dirname)));
 
//11. Configuração de Sessão (do navegador)
const sessionConfig = {
    secret: process.env.SESSION_SECRET,     
        // chave secreta para assinar o cookie
    resave: false, 
        // não salva a sessões se não houver mudança
    saveUninitialized: false, 
        // não cria sessão para usuários não logados
    name: "techeduca.sid", 
        // nome personalizado do cookie da sessão
    cookie: {
        httpOnly : true, // bloqueia o acesso via JavaScript
        maxAge: 1000 * 60 * 60 // sessão expira em 1 hora (em mil)
    }
}
 
// 11. Separa o ambiente de teste(localhost) do de produção(Render)
if(process.env.NODE_ENV == "production"){ // ambiente de produção
    app.set("trust proxy",1), // confia no proxy do Render
    sessionConfig.cookie.sameSite = "none", // necessário para os cookies 
    sessionConfig.cookie.secure = true // cookie só trafega em https
} else{ // ambiente de desenvolvimento(teste)
    sessionConfig.cookie.sameSite="lax", // funciona em locahost sem HTTPS
    sessionConfig.cookie.secure = false // permite cookie sem HTTPS local
}
 
app.use(session(sessionConfig)) // configura a sessão no servidor
 
/* 
===============================================
2 PARTE - CRIAR ROTA E INICIAR
===============================================
*/
// 1. Define a rota POST "/mensagem"
app.post("/mensagem", (req,res) => {
    console.log(req.body);
    res.send("Mensagem recebida com sucesso!");
});
 
// 2. Define a rota POST "/cadastro"
app.post("/cadastro", async (req,res) => {
    try{
        const {nome,email,senha} = req.body
 
        if(!nome || !email || !senha ){
            return res.status(400).json({erro:"Preencha todos os campos"});
        }
 
        const [rows] = await pool.execute(
            "SELECT id FROM tb_usuarios WHERE email=?",[email] 
        );
 
        if(rows.length > 0){
            return res.status(409).json({erro: "E-mail já cadastrado"});
        };
        
        const senhaHash = await bcrypt.hash(senha,10);   
 
        await pool.execute(
            "INSERT INTO tb_usuarios(nome,email,senha) VALUES(?,?,?)",
            [nome,email,senhaHash]
        );
 
        res.status(201).json({mensagem:" Cadastro realizado com sucesso!"});
    } catch(error){
        console.error(error);
        res.status(500).json({erro: "Erro ao cadastrar usuário"})
    }
});
 
// 3. Define a rota POST "/login"
app.post("/login", async (req,res) => {
    try{
        const {email,senha} = req.body
 
        if(!email || !senha ){
            return res.status(400).json({erro:"Preencha todos os campos"});
        }
 
        const [rows] = await pool.execute(
            "SELECT id, nome, email, senha FROM tb_usuarios WHERE email=?",[email] 
        );
 
        if(rows.length == 0){
            return res.status(401).json({erro: "Usuário não encontrado"});
        };
 
        const usuario = rows[0]
 
        const senhaCorreta = await bcrypt.compare(senha,usuario.senha)
 
        if(!senhaCorreta){
            return res.status(401).json({erro: "Senha inválida"});
        };
 
        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }
 
        res.json({mensagem:"Login realizado com sucesso!"});
    } catch(error){
        console.error(error);
        res.status(500).json({erro: "Erro ao fazer login"})
    }
})
 
// 4. Define a rota GET "/me" - verificar sessão
app.get("/me", (req, res) => {
    if(!req.session.usuario){
        return res.status(401).json({logado:false});
    }
 
    res.json({
        logado:true,
        usuario: req.session.usuario 
    })
});
 
// 5. Define a rota POST "/logout" - encerrar sessão
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("techeduca.sid")
        res.json({mensagem: "Logout realizado"});
    });
});

// 6. Define a rota POST "/pedido" - registra os itens do carrinho e gera o número de chamada
app.post("/pedido", async (req, res) => {
    try {
        if (!req.session.usuario) {
            return res.status(401).json({ erro: "Você precisa estar logado para finalizar o pedido" });
        }

        const { itens } = req.body;

        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({ erro: "Carrinho vazio" });
        }

        const [linhas] = await pool.execute(
            "SELECT COALESCE(MAX(numero_chamado), 0) + 1 AS proximo FROM pedidos"
        );
        const numeroChamado = linhas[0].proximo;

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
 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});