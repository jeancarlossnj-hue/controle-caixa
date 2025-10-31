// saidas.js
// ===========================================
// Controle de Saídas com integração Flask
// ===========================================

const API_URL = "http://127.0.0.1:5000/api/saidas";

// Variável para controle de envio
let saidaSendoEnviada = false;

// Função para carregar todas as saídas do backend
function carregarSaidas() {
    fetch(API_URL)
        .then(res => res.json())
        .then(saidas => exibirSaidas(saidas))
        .catch(err => console.error("Erro ao carregar saídas:", err));
}

// Função para exibir saídas na tabela
function exibirSaidas(saidas) {
    const tabela = document.getElementById('saidas-table');
    if (!tabela) return; // se não está na página da tabela

    tabela.innerHTML = '';

    saidas.forEach(saida => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', saida.id);

        const dataFormatada = new Date(saida.data).toLocaleDateString('pt-BR');
        const valorFormatado = saida.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        tr.innerHTML = `
            <td class="px-4 py-3">${saida.motivo}</td>
            <td class="px-4 py-3">${valorFormatado}</td>
            <td class="px-4 py-3">${dataFormatada}</td>
            <td class="px-4 py-3">${saida.funcionario}</td>
            <td class="px-4 py-3 flex space-x-2">
                <button onclick="editarSaida(${saida.id})" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="excluirSaida(${saida.id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tabela.appendChild(tr);
    });
}

// Função para adicionar saída
function adicionarSaida(motivo, valor, data, funcionario, callback) {
    if (saidaSendoEnviada) return;
    saidaSendoEnviada = true;

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo, valor, data, funcionario })
    })
    .then(res => res.json())
    .then(data => {
        if (callback) callback(data);
        carregarSaidas();
        saidaSendoEnviada = false;
    })
    .catch(err => {
        console.error("Erro ao adicionar saída:", err);
        saidaSendoEnviada = false;
    });
}

// Função para buscar uma saída e abrir modal de edição
function editarSaida(id) {
    fetch(API_URL)
        .then(res => res.json())
        .then(saidas => {
            const saida = saidas.find(s => s.id === id);
            if (saida) abrirModalEditarSaida(saida);
        });
}

// Abrir modal de edição
function abrirModalEditarSaida(saida) {
    document.getElementById('edit-expense-id').value = saida.id;
    document.getElementById('edit-expense-reason').value = saida.motivo;
    document.getElementById('edit-expense-value').value = saida.valor;
    document.getElementById('edit-expense-date').value = saida.data;
    document.getElementById('edit-expense-employee').value = saida.funcionario;

    document.getElementById('modal-editar-saida').classList.remove('hidden');
}

// Fechar modal edição
function fecharModalEditarSaida() {
    document.getElementById('modal-editar-saida').classList.add('hidden');
}

// Salvar edição
function salvarEdicaoSaida(event) {
    event.preventDefault();

    const id = document.getElementById('edit-expense-id').value;
    const motivo = document.getElementById('edit-expense-reason').value;
    const valor = parseFloat(document.getElementById('edit-expense-value').value);
    const data = document.getElementById('edit-expense-date').value;
    const funcionario = document.getElementById('edit-expense-employee').value;

    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo, valor, data, funcionario })
    })
    .then(res => res.json())
    .then(() => {
        fecharModalEditarSaida();
        carregarSaidas();
        alert("Saída atualizada com sucesso!");
    });
}

// Excluir saída
function excluirSaida(id) {
    if (confirm("Tem certeza que deseja excluir esta saída?")) {
        fetch(`${API_URL}/${id}`, { method: "DELETE" })
            .then(res => res.json())
            .then(() => {
                carregarSaidas();
                alert("Saída excluída com sucesso!");
            });
    }
}

// Função para carregar funcionários da tabela de login
function carregarFuncionarios() {
    fetch('http://127.0.0.1:5000/obter_logins')
        .then(res => res.json())
        .then(usuarios => {
            const selectFuncionario = document.getElementById('expense-employee');
            if (selectFuncionario) {
                selectFuncionario.innerHTML = '<option value="">Selecione um funcionário</option>';
                
                usuarios.forEach(usuario => {
                    const option = document.createElement('option');
                    option.value = usuario.usuario;
                    option.textContent = usuario.usuario;
                    selectFuncionario.appendChild(option);
                });
            }
        })
        .catch(err => console.error("Erro ao carregar funcionários:", err));
}

// ===========================================
// Integração com formulário do index.html
// ===========================================
document.addEventListener('DOMContentLoaded', function () {
    // Carrega saídas apenas se estiver na página correta
    if (document.getElementById('saidas-table')) {
        carregarSaidas();
    }

    // Carrega funcionários para o select
    if (document.getElementById('expense-employee')) {
        carregarFuncionarios();
    }

    const formSaidas = document.getElementById('expenses-form');
    if (formSaidas) {
        // Remove event listener anterior para evitar duplicação
        const newForm = formSaidas.cloneNode(true);
        formSaidas.parentNode.replaceChild(newForm, formSaidas);
        
        // Adiciona novo event listener
        document.getElementById('expenses-form').addEventListener('submit', function (e) {
            e.preventDefault();

            const motivo = document.getElementById('expense-reason').value;
            const valor = parseFloat(document.getElementById('expense-value').value);
            const data = document.getElementById('expense-date').value;
            const funcionario = document.getElementById('expense-employee').value;

            adicionarSaida(motivo, valor, data, funcionario, function () {
                alert("Saída adicionada com sucesso!");
                this.reset();
                document.getElementById('close-expenses-modal').click();
            }.bind(this));
        });
    }
});