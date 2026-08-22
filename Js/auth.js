const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://coffee-center-2.onrender.com"

function paginaNoServidorLocal() {
    const host = window.location.hostname
    return host === "localhost" || host === "127.0.0.1"
}

function urlPagina(pagina) {
    if (paginaNoServidorLocal() && !window.location.href.includes("http://localhost:3000")) {
        return `http://localhost:3000/pages/${pagina}`
    }

    if (window.location.pathname.includes("/pages/")) {
        return `${window.location.origin}/pages/${pagina}`
    }

    return `${window.location.origin}/${pagina}`
}

function irParaLogin() {
    window.location.assign(urlPagina("login.html"))
}

function irParaCardapio() {
    window.location.assign(urlPagina("cardapio.html"))
}

async function verificarSessao() {
    const estaNaPaginaCardapio = window.location.pathname.includes("cardapio.html")
    if (!estaNaPaginaCardapio) return true

    try {
        const resposta = await fetch(`${BASE_URL}/me`, {
            credentials: "include"
        })

        const dados = await resposta.json().catch(() => ({}))

        if (!resposta.ok || !dados.logado) {
            irParaLogin()
            return false
        }

        return true
    } catch {
        irParaLogin()
        return false
    }
}

if (window.location.pathname.includes("cardapio.html")) {
    verificarSessao()
}

const formLogin = document.getElementById("formLogin")
if (formLogin) {
    formLogin.addEventListener("submit", async function (e) {
        e.preventDefault()

        const email = document.getElementById("emailLogin").value
        const senha = document.getElementById("senhaLogin").value
        const mensagem = document.getElementById("mensagemLogin")

        try {
            const resposta = await fetch(`${BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, senha })
            })

            if (resposta.ok) {
                mensagem.textContent = "Login realizado com sucesso!"
                setTimeout(() => {
                    irParaCardapio()
                }, 300)
            } else {
                const dados = await resposta.json()
                mensagem.textContent = dados.erro || "E-mail ou senha incorretos."
            }
        } catch {
            mensagem.textContent = "Erro ao conectar com o servidor."
        }
    })
}

const formCadastro = document.getElementById("formCadastro")
if (formCadastro) {
    formCadastro.addEventListener("submit", async function (e) {
        e.preventDefault()

        const nome = document.getElementById("nome").value
        const email = document.getElementById("email").value
        const senha = document.getElementById("senha").value
        const confirmasenha = document.getElementById("confirmasenha").value
        const mensagem = document.getElementById("mensagemCadastro")

        if (senha !== confirmasenha) {
            mensagem.textContent = "As senhas não coincidem."
            return
        }

        try {
            const resposta = await fetch(`${BASE_URL}/cadastro`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ nome, email, senha })
            })

            if (resposta.ok) {
                mensagem.textContent = "Cadastro realizado! Redirecionando..."
                setTimeout(() => {
                    irParaLogin()
                }, 1500)
            } else {
                const dados = await resposta.json()
                mensagem.textContent = dados.erro || "Erro ao realizar cadastro."
            }
        } catch {
            mensagem.textContent = "Erro ao conectar com o servidor."
        }
    })
}