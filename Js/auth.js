const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://coffee-center-2.onrender.com"

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
                window.location.href = "cardapio.html"
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
                    window.location.href = "login.html"
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