const formContato = document.getElementById("formContato")
const listaMensagens = document.getElementById("listaMensagens")

if (formContato) {
    formContato.addEventListener("submit", function (e) {
        e.preventDefault()

        const nome = document.getElementById("nome").value
        const email = document.getElementById("email").value
        const mensagem = document.getElementById("mensagem").value

        const item = document.createElement("div")
        item.innerHTML = `<p><strong>${nome}</strong> (${email}): ${mensagem}</p>`
        listaMensagens.appendChild(item)

        formContato.reset()
    })
}