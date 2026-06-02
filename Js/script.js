container.innerHTML = ""
 
    lista.forEach(item => {
        const card = document.createElement("div")
        card.className = "item"
        card.innerHTML = `
            <h3>${item.nome}</h3>
            <p>${item.descricao}</p>
            <a href="#" class="btn-item">Ver Detalhes</a>
        `
        container.appendChild(card)
    })

 
const campoBusca = document.getElementById("BuscarCardápio")
if (campoBusca) {
    campoBusca.addEventListener("input", () => {
        const termo = campoBusca.value.toLowerCase()
        const filtrados = cardapio.filter(p =>
            p.nome.toLowerCase().includes(termo) ||
            p.descricao.toLowerCase().includes(termo)
        )
        renderizarCardapio(filtrados)
    })
}
 
renderizarCardapio(cardapio)