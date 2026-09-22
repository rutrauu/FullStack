const URL = "http://localhost:8001"
const endPointProduto = URL + "/product"
const endPointCategoria = URL + "/category"

const formProduto = document.getElementById("formProduto")
const listaProdutos = document.getElementById("listaProdutos")
const selectCategoria = document.getElementById("categoriaProduto")
const mensagem = document.getElementById("mensagem")
const btnSalvar = document.getElementById("btnSalvar")
const btnCancelar = document.getElementById("btnCancelar")

function mostrarMensagem(texto, tipo = "success") {
    mensagem.textContent = texto
    mensagem.className = `alert alert-${tipo}`
}

function limparFormulario() {
    formProduto.reset()
    document.getElementById("idProduto").value = ""
    btnSalvar.textContent = "Adicionar produto"
    btnCancelar.classList.add("d-none")
}

async function carregarCategorias() {
    const resposta = await fetch(endPointCategoria)
    if (!resposta.ok) throw new Error("Não foi possível carregar as categorias")

    const categorias = await resposta.json()
    categorias.forEach(categoria => {
        const opcao = document.createElement("option")
        opcao.value = categoria.id
        opcao.textContent = categoria.nome
        selectCategoria.appendChild(opcao)
    })
}

async function carregarProdutos() {
    const resposta = await fetch(endPointProduto)
    if (!resposta.ok) throw new Error("Não foi possível carregar os produtos")

    const produtos = await resposta.json()
    listaProdutos.replaceChildren()
    produtos.forEach(produto => {
        const linha = document.createElement("tr")
        linha.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>R$ ${Number(produto.preco).toFixed(2)}</td>
            <td>${produto.cat || "Sem categoria"}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" data-acao="editar" data-id="${produto.id}">Editar</button>
                <button class="btn btn-sm btn-danger" data-acao="excluir" data-id="${produto.id}">Excluir</button>
            </td>
        `
        linha.querySelector('[data-acao="editar"]').produto = produto
        listaProdutos.appendChild(linha)
    })
}

async function salvarProduto(evento) {
    evento.preventDefault()
    const id = document.getElementById("idProduto").value
    const dados = {
        nome: document.getElementById("nomeProduto").value.trim(),
        preco: Number(document.getElementById("precoProduto").value),
        codCategoria: Number(selectCategoria.value)
    }
    const metodo = id ? "PUT" : "POST"
    const endpoint = id ? `${endPointProduto}/${id}` : endPointProduto
    const resposta = await fetch(endpoint, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
    if (!resposta.ok) throw new Error("Não foi possível salvar o produto")

    mostrarMensagem(id ? "Produto editado com sucesso." : "Produto adicionado com sucesso.")
    limparFormulario()
    await carregarProdutos()
}

async function excluirProduto(id) {
    if (!confirm("Deseja excluir este produto?")) return
    const resposta = await fetch(`${endPointProduto}/${id}`, { method: "DELETE" })
    if (!resposta.ok) throw new Error("Não foi possível excluir o produto")
    mostrarMensagem("Produto excluído com sucesso.")
    await carregarProdutos()
}

listaProdutos.addEventListener("click", async evento => {
    const botao = evento.target.closest("button")
    if (!botao) return

    try {
        if (botao.dataset.acao === "excluir") {
            await excluirProduto(botao.dataset.id)
        } else {
            const produto = botao.produto
            document.getElementById("idProduto").value = produto.id
            document.getElementById("nomeProduto").value = produto.nome
            document.getElementById("precoProduto").value = produto.preco
            selectCategoria.value = produto.codCategoria
            btnSalvar.textContent = "Salvar alterações"
            btnCancelar.classList.remove("d-none")
        }
    } catch (erro) {
        mostrarMensagem(erro.message, "danger")
    }
})

formProduto.addEventListener("submit", async evento => {
    try {
        await salvarProduto(evento)
    } catch (erro) {
        mostrarMensagem(erro.message, "danger")
    }
})

btnCancelar.addEventListener("click", limparFormulario)

Promise.all([carregarCategorias(), carregarProdutos()]).catch(erro => {
    mostrarMensagem(erro.message, "danger")
})