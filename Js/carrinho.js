// carrinho.js
// OBS: BASE_URL já é declarado em auth.js (carregado antes deste arquivo),
// por isso NÃO redeclaramos "const BASE_URL" aqui.

// ======================================================
// STORAGE DO CARRINHO (usado tanto no cardápio quanto na página do carrinho)
// ======================================================

const CARRINHO_STORAGE_KEY = "carrinho"

function pegarCarrinho() {
    try {
        const dados = localStorage.getItem(CARRINHO_STORAGE_KEY)
        return dados ? JSON.parse(dados) : []
    } catch {
        return []
    }
}

function salvarCarrinho(carrinho) {
    localStorage.setItem(CARRINHO_STORAGE_KEY, JSON.stringify(carrinho))
    atualizarContadorCarrinho()
}

function atualizarContadorCarrinho() {
    const contador = document.getElementById("contadorCarrinho")
    if (!contador) return

    const carrinho = pegarCarrinho()
    const totalItens = carrinho.reduce((soma, produto) => soma + produto.quantidade, 0)

    if (totalItens > 0) {
        contador.textContent = totalItens
        contador.style.display = "flex"
    } else {
        contador.style.display = "none"
    }
}

// Recebe um item do cardápio (titulo, preco, img, id) e adiciona ao carrinho.
// Se o produto já existir, apenas aumenta a quantidade.
function adicionarCarrinho(item, id) {
    const carrinho = pegarCarrinho()
    const idProduto = id ?? item.id ?? item.titulo
    const existente = carrinho.find(produto => produto.id === idProduto)

    if (existente) {
        existente.quantidade += 1
    } else {
        carrinho.push({
            id: idProduto,
            nome: item.titulo,
            preco: item.preco,
            imagem: item.img,
            quantidade: 1
        })
    }

    salvarCarrinho(carrinho)
    return item.titulo
}

function removerCarrinho(id) {
    const carrinho = pegarCarrinho().filter(produto => produto.id !== id)
    salvarCarrinho(carrinho)
}

function aumentarQuantidade(id) {
    const carrinho = pegarCarrinho()
    const produto = carrinho.find(p => p.id === id)
    if (produto) produto.quantidade += 1
    salvarCarrinho(carrinho)
}

function diminuirQuantidade(id) {
    const carrinho = pegarCarrinho()
    const produto = carrinho.find(p => p.id === id)

    if (produto) {
        produto.quantidade -= 1
        if (produto.quantidade <= 0) {
            return removerCarrinho(id)
        }
    }

    salvarCarrinho(carrinho)
}

function limparCarrinho() {
    salvarCarrinho([])
}

function calcularTotal() {
    return pegarCarrinho().reduce((soma, produto) => soma + produto.preco * produto.quantidade, 0)
}

document.addEventListener("DOMContentLoaded", atualizarContadorCarrinho)

// Aviso discreto no canto da tela, no lugar do alert() padrão do navegador.
// Usado tanto no cardápio (ao adicionar item) quanto em outras páginas.
function mostrarToast(mensagem) {
    const existente = document.getElementById("toastCarrinho")
    if (existente) existente.remove()

    const toast = document.createElement("div")
    toast.id = "toastCarrinho"
    toast.textContent = mensagem
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #2e1a0e;
        color: #f0e6d0;
        border: 2px solid #c8922a;
        border-radius: 10px;
        padding: 14px 22px;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 8px 24px rgba(0,0,0,.4);
        z-index: 1000;
        opacity: 0;
        transform: translateY(10px);
        transition: opacity .25s ease, transform .25s ease;
    `

    document.body.appendChild(toast)

    requestAnimationFrame(() => {
        toast.style.opacity = "1"
        toast.style.transform = "translateY(0)"
    })

    setTimeout(() => {
        toast.style.opacity = "0"
        toast.style.transform = "translateY(10px)"
        setTimeout(() => toast.remove(), 250)
    }, 2200)
}

// ======================================================
// LÓGICA DA PÁGINA DO CARRINHO (carrinho.html)
// As linhas abaixo só têm efeito se os elementos existirem na página,
// então é seguro carregar este arquivo também no cardápio.html.
// ======================================================

const lista = document.getElementById("listaCarrinho");
const totalEl = document.getElementById("valorTotalFinal");
const subtotalEl = document.getElementById("valorSubtotal");

function renderizarCarrinho() {
    if (!lista) return;

    const carrinho = pegarCarrinho();

    lista.innerHTML = "";

    if (carrinho.length === 0) {
        lista.innerHTML = "<div class='carrinho-vazio'><h3>Seu carrinho está vazio.</h3></div>";
        totalEl.innerHTML = "R$ 0,00";
        subtotalEl.innerHTML = "R$ 0,00";
        return;
    }

    carrinho.forEach(produto => {
        const subtotal = (produto.preco * produto.quantidade).toFixed(2);

        lista.innerHTML += `
            <div class="produtoCarrinho">
                <img src="${produto.imagem}" alt="${produto.nome}">
                <div class="informacoes">
                    <h3>${produto.nome}</h3>
                    <p>R$ ${produto.preco.toFixed(2)}</p>
                    <div class="quantidade">
                        <button onclick="diminuir('${produto.id}')">-</button>
                        <span>${produto.quantidade}</span>
                        <button onclick="aumentar('${produto.id}')">+</button>
                    </div>
                    <p class="subtotal">Subtotal: R$ ${subtotal}</p>
                    <button class="remover" onclick="remover('${produto.id}')">
                        Remover
                    </button>
                </div>
            </div>
        `;
    });

    const totalFormatado = calcularTotal().toFixed(2);
    totalEl.innerHTML = `R$ ${totalFormatado}`;
    subtotalEl.innerHTML = `R$ ${totalFormatado}`;
}

window.aumentar = (id) => {
    aumentarQuantidade(id);
    renderizarCarrinho();
};

window.diminuir = (id) => {
    diminuirQuantidade(id);
    renderizarCarrinho();
};

window.remover = (id) => {
    removerCarrinho(id);
    renderizarCarrinho();
};

const btnLimpar = document.getElementById("btnLimpar");
if (btnLimpar) {
    btnLimpar.onclick = () => {
        if (confirm("Deseja limpar o carrinho?")) {
            limparCarrinho();
            renderizarCarrinho();
        }
    };
}

const btnFinalizar = document.getElementById("btnFinalizar");
if (btnFinalizar) {
    btnFinalizar.onclick = async () => {
        const carrinho = pegarCarrinho();

        if (carrinho.length === 0) {
            alert("Seu carrinho está vazio.");
            return;
        }

        try {
            const resposta = await fetch(`${BASE_URL}/pedido`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    itens: carrinho,
                    total: calcularTotal()
                })
            });

            if (resposta.status === 401) {
                alert("Você precisa estar logado para finalizar o pedido.");
                window.location.href = "login.html";
                return;
            }

            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                const mensagem = dados.erro || "Erro ao finalizar o pedido.";
                alert(mensagem.includes("Servidor") || mensagem.includes("connect")
                    ? "O servidor não está respondendo no momento. Tente novamente mais tarde."
                    : mensagem);
                return;
            }

            limparCarrinho();
            renderizarCarrinho();
            mostrarConfirmacaoPedido(dados.numeroPedido);
        } catch (erro) {
            console.error("Erro ao enviar pedido:", erro);
            alert("Não foi possível conectar ao servidor. Verifique se ele está rodando (node server.js) e tente novamente.");
        }
    };
}

function mostrarConfirmacaoPedido(numero) {
    const modal = document.getElementById("modalPedido");
    if (!modal) return;
    document.getElementById("numeroPedidoTexto").textContent = numero;
    modal.style.display = "flex";
}

const btnFecharPedido = document.getElementById("btnFecharPedido");
if (btnFecharPedido) {
    btnFecharPedido.onclick = () => {
        document.getElementById("modalPedido").style.display = "none";
        window.location.href = "cardapio.html";
    };
}

renderizarCarrinho();