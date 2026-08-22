// ======================================================
// SCRIPT.JS - RENDERIZAÇÃO DO CARDÁPIO E INTERAÇÃO COM O CARRINHO
// ======================================================
// Este arquivo busca os produtos em data/cardapio.json,
// monta os cards na tela, permite a busca e conecta cada item ao carrinho.

const listacardapio = document.querySelector("#listacardapio");
const buscarcardapio = document.querySelector("#buscarCardapio");

// Guarda a lista completa de produtos para reutilizar na busca.
let cardapio = [];

// Carrega os itens do menu a partir do arquivo JSON.
// Também trata erros caso o servidor não esteja disponível.
async function carregarcardapio() {
    try {
        if (!listacardapio) {
            return;
        }

        let resposta;

        // Se a página estiver aberta com file://, tenta usar o backend local.
        if (window.location.protocol === "file:") {
            try {
                resposta = await fetch("http://localhost:3000/data/cardapio.json", { cache: "no-store" });
            } catch (e) {
                // Fallback para caminho relativo em caso de bloqueio local.
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

        // Converte os dados JSON em array JavaScript.
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

// Renderiza todos os itens do cardápio em tela.
function renderizarcardapio(lista) {
    listacardapio.innerHTML = "";

    lista.forEach((item, index) => {
        const idModal = `detalhes-${index}`;

        // Cria o card clicável que abre o modal de detalhes.
        const card = document.createElement("a");
        card.classList.add("item");
        card.href = `#${idModal}`;

        // Botão que adiciona o item ao carrinho.
        const botaoAdicionar = document.createElement("button");
        botaoAdicionar.type = "button";
        botaoAdicionar.className = "btn-item botao-adicionar";
        botaoAdicionar.textContent = "Adicionar";
        botaoAdicionar.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            adicionarAoCarrinho(item);
        });

        // Texto de detalhes do item.
        const detalhes = document.createElement("span");
        detalhes.className = "btn-item botao-detalhes";
        detalhes.textContent = "Ver detalhes";

        // Agrupa os botões do card em um container.
        const containerAcoes = document.createElement("div");
        containerAcoes.className = "acoes-cardapio";
        containerAcoes.appendChild(detalhes);
        containerAcoes.appendChild(botaoAdicionar);

        // Define atributos de imagem para melhorar performance.
        // A primeira imagem recebe prioridade alta para melhorar LCP.
        const atributosImagem = index === 0
            ? 'fetchpriority="high" loading="eager" decoding="async"'
            : 'loading="lazy" decoding="async"';

        const imagemMobile = item.imgMobile || item.img;
        const imagemDesktop = item.img || item.imgMobile;
        const srcset = item.imgMobile && item.img
            ? `${imagemMobile} 480w, ${imagemDesktop} 800w`
            : `${imagemDesktop}`;

        // Monta o HTML do card com imagem, título, descrição e preço.
        card.innerHTML = `
            <img
                src="${imagemMobile}"
                srcset="${srcset}"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                alt="${item.titulo}"
                width="263"
                height="175"
                ${atributosImagem}
            >
            <h2 style="margin: 8px 0 4px; font-size: 18px; text-align:left;">${item.titulo}</h2>
            <p style="font-size:14px; flex:1;">${item.descricao}</p>
            <p style="font-size:16px; font-weight:bold; color:#c8922a; margin-top:8px;">R$ ${item.preco.toFixed(2)}</p>
        `;

        card.appendChild(containerAcoes);

        // Adiciona o card ao menu e também o modal de detalhes do produto.
        listacardapio.appendChild(card);
        listacardapio.appendChild(criarModal(item, idModal));
    });
}

// Cria o modal de detalhes do produto com descrição e informações extras.
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

// Busca dentro do cardápio em tempo real enquanto o usuário digita.
buscarcardapio.addEventListener("input", function () {
    const texto = buscarcardapio.value.toLowerCase();
    const filtrados = cardapio.filter(item =>
        item.titulo.toLowerCase().includes(texto)
    );
    renderizarcardapio(filtrados);
});

// Função global que adiciona o produto ao carrinho.
// Ela usa a função adicionarCarrinho do carrinho.js e mostra um toast visual.
window.adicionarAoCarrinho = function (item) {
    if (!item) return;

    const nome = adicionarCarrinho(item, item.id ?? item.titulo);
    mostrarToast(`${nome} adicionado ao carrinho!`);
};

// Chama a função de carregamento assim que o script terminar de executar.
carregarcardapio();