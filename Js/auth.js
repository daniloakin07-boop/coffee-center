const formLogin = document.getElementById("formLogin")
if (formLogin) {
    formLogin.addEventListener("submit", async function (e) {
        e.preventDefault()

        const email = document.getElementById("emailLogin").value
        const senha = document.getElementById("senhaLogin").value
        const mensagem = document.getElementById("mensagemLogin")

        try {
            const resposta = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, senha })
            })

            if (resposta.ok) {
                mensagem.textContent = "Login realizado com sucesso!"
                window.location.href = "produtos.html"
            } else {
                mensagem.textContent = "E-mail ou senha incorretos."
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
            const resposta = await fetch("http://localhost:3000/cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, senha })
            })

            if (resposta.ok) {
                mensagem.textContent = "Cadastro realizado! Redirecionando..."
                setTimeout(() => {
                    window.location.href = "login.html"
                }, 1500)
            } else {
                mensagem.textContent = "Erro ao realizar cadastro."
            }
        } catch {
            mensagem.textContent = "Erro ao conectar com o servidor."
        }
    })
}