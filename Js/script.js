const listacardapio = document.querySelector("#listacardapio");
const buscarcardapio = document.querySelector("#buscarCardapio");

let cardapio = [];

async function carregarcardapio() {
    try {
        if (!listacardapio) {
            return;
        }

        let resposta;

        if (window.location.protocol === "file:") {
            // Página aberta via file:// — tentar buscar no servidor local (quando disponível)
            try {
                resposta = await fetch("http://localhost:3000/data/cardapio.json", { cache: "no-store" });
            } catch (e) {
                // fallback para tentativa relativa (pode ser bloqueada por CORS/file protocol)
                const urlCardapio = new URL("../data/cardapio.json", window.location.href);
                resposta = await fetch(urlCardapio, { cache: "no-store" });
            }
        } else {
            const urlCardapio = new URL("../data/cardapio.json", window.location.href);
            resposta = await fetch(urlCardapio, { cache: "no-store" });
        }

        if (!resposta || !resposta.ok) {
            throw new Error("Erro ao carregar cardápio");
        }

        cardapio = await resposta.json();
        renderizarcardapio(cardapio);

    } catch (erro) {
        console.error("Erro:", erro);
        if (listacardapio) {
            listacardapio.innerHTML = `
                <p style='text-align:center'>Erro ao carregar o cardápio. Tente novamente.</p>
                <p style='text-align:center; font-size:14px; margin-top:8px;'>Abra a página pelo servidor local: <a href="http://localhost:3000/pages/cardapio.html">http://localhost:3000/pages/cardapio.html</a></p>
                <p style='text-align:center; font-size:13px; margin-top:6px;'>Inicie o servidor no terminal com: <code>node server.js</code></p>
            `;
        }
    }
}

function renderizarcardapio(lista) {
    listacardapio.innerHTML = "";

    lista.forEach((item, index) => {
        const idModal = `detalhes-${index}`;

        const card = document.createElement("a");
        card.classList.add("item");
        card.href = `#${idModal}`;

        card.innerHTML = `
            <img src="${item.img}" alt="${item.titulo}">
            <h3 style="margin: 8px 0 4px;">${item.titulo}</h3>
            <p style="font-size:14px; flex:1;">${item.descricao}</p>
            <p style="font-size:16px; font-weight:bold; color:#c8922a; margin-top:8px;">R$ ${item.preco.toFixed(2)}</p>
            <span class="btn-item">Ver detalhes</span>
        `;

        listacardapio.appendChild(card);
        listacardapio.appendChild(criarModal(item, idModal));
    });
}

function criarModal(item, idModal) {
    const modal = document.createElement("div");
    modal.classList.add("modal-overlay");
    modal.id = idModal;

    modal.innerHTML = `
        <div class="modal-conteudo">
            <a href="#" class="modal-voltar">← Voltar ao Cardápio</a>

            <h2 class="modal-titulo">${item.titulo}</h2>

            <div class="modal-preco-box">
                <span class="modal-preco">R$ ${item.preco.toFixed(2)}</span>
            </div>

            <div class="modal-secao">
                <h3 class="modal-secao-titulo">Descrição</h3>
                <p class="modal-secao-texto">${item.descricaoCompleta || item.descricao}</p>
            </div>

            <div class="modal-secao">
                <h3 class="modal-secao-titulo">Ingredientes</h3>
                <p class="modal-secao-texto">${item.ingredientes || "-"}</p>
            </div>

            <div class="modal-info-grid">
                <div class="modal-info-item">
                    <p class="modal-info-label">Origem</p>
                    <p class="modal-info-valor">${item.origem || "-"}</p>
                </div>
                <div class="modal-info-item">
                    <p class="modal-info-label">Preparo</p>
                    <p class="modal-info-valor">${item.tempoPreparo || "-"}</p>
                </div>
                <div class="modal-info-item">
                    <p class="modal-info-label">Categoria</p>
                    <p class="modal-info-valor">${item.categoria || "-"}</p>
                </div>
                <div class="modal-info-item">
                    <p class="modal-info-label">Nível</p>
                    <p class="modal-info-valor">${item.nivel || "-"}</p>
                </div>
            </div>

            <a href="#" class="modal-voltar-baixo">← Voltar ao Cardápio</a>
        </div>
    `;

    return modal;
}

buscarcardapio.addEventListener("input", function () {
    const texto = buscarcardapio.value.toLowerCase();
    const filtrados = cardapio.filter(item =>
        item.titulo.toLowerCase().includes(texto)
    );
    renderizarcardapio(filtrados);
});

carregarcardapio();