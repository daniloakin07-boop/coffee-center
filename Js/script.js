const listacardapio = document.querySelector("#listacardapio");
const buscarcardapio = document.querySelector("#buscarCardapio");

let cardapio = [];

async function carregarcardapio() {
    try {
        const resposta = await fetch("/data/cardapio.json");

        if (!resposta.ok) {
            throw new Error("Erro ao carregar cardápio");
        }

        cardapio = await resposta.json();
        renderizarcardapio(cardapio);

    } catch (erro) {
        console.error("Erro:", erro);
        listacardapio.innerHTML = "<p style='text-align:center'>Erro ao carregar o cardápio. Tente novamente.</p>";
    }
}

function renderizarcardapio(lista) {
    listacardapio.innerHTML = "";

    lista.forEach(item => {
        const card = document.createElement("a");
        card.classList.add("item");
        card.href = item.url;

        card.innerHTML = `
            <img src="${item.img}" alt="${item.titulo}">
            <h3 style="margin: 8px 0 4px;">${item.titulo}</h3>
            <p style="font-size:14px; flex:1;">${item.descricao}</p>
            <p style="font-size:16px; font-weight:bold; color:#c8922a; margin-top:8px;">R$ ${item.preco.toFixed(2)}</p>
            <span class="btn-item">Ver detalhes</span>
        `;

        listacardapio.appendChild(card);
    });
}

buscarcardapio.addEventListener("input", function () {
    const texto = buscarcardapio.value.toLowerCase();
    const filtrados = cardapio.filter(item =>
        item.titulo.toLowerCase().includes(texto)
    );
    renderizarcardapio(filtrados);
});

carregarcardapio();