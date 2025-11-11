// ===========================================
// 💸 Controle de Saídas com integração Flask
// ===========================================

// URL base da API em produção (Railway)
const API_SAIDAS = 'https://controle-caixa-production-b94c.up.railway.app';

// Variável para evitar envio duplo
let saidaSendoEnviada = false;

// ===============================
// 🔹 CARREGAR SAÍDAS
// ===============================
function carregarSaidas() {
    fetch(`${API_SAIDAS}/obter_saidas`)
        .then(res => res.json())
        .then(saidas => exibirSaidas(saidas))
        .catch(err => console.error("Erro ao carregar saídas:", err));
}

// ===============================
// 🔹 EXIBIR SAÍDAS NA TABELA
// ===============================
function exibirSaidas(saidas) {
    const tabela = document.getElementById('saidas-table');
    if (!tabela) return;

    tabela.innerHTML = '';

    saidas.forEach(saida => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', saida.id);

        const dataFormatada = new Date(saida.data_saida).toLocaleDateString('pt-BR');
        const valorFormatado = saida.valor_saida.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        tr.innerHTML = `
            <td class="px-4 py-3">${saida.descricao_saida}</td>
            <td class="px-4 py-3">${valorFormatado}</td>
            <td class="px-4 py-3">${dataFormatada}</td>
            <td class="px-4 py-3">${saida.nome_vendedor || '-'}</td>
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

// ===============================
// 🔹 ADICIONAR NOVA SAÍDA
// ===============================
function adicionarSaida(motivo, valor, data, funcionario, callback) {
    if (saidaSendoEnviada) return;
    saidaSendoEnviada = true;

    fetch(`${API_SAIDAS}/registrar_saida`, {
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

// ===============================
// 🔹 CARREGAR FUNCIONÁRIOS (VENDEDORES)
// ===============================
function carregarFuncionarios() {
    fetch(`${API_SAIDAS}/obter_logins`)
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

// ===============================
// 🔹 EVENTOS DO FORMULÁRIO
// ===============================
document.addEventListener('DOMContentLoaded', function () {

    // Carregar saídas se houver tabela
    if (document.getElementById('saidas-table')) {
        carregarSaidas();
    }

    // Carregar funcionários
    if (document.getElementById('expense-employee')) {
        carregarFuncionarios();
    }

    // Salvar nova saída
    const formSaidas = document.getElementById('expenses-form');
    if (formSaidas) {
        formSaidas.addEventListener('submit', function (e) {
            e.preventDefault();

            const motivo = document.getElementById('expense-reason').value;
            const valor = parseFloat(document.getElementById('expense-value').value);
            const data = document.getElementById('expense-date').value;
            const funcionario = document.getElementById('expense-employee').value;

            adicionarSaida(motivo, valor, data, funcionario, function () {
                alert("✅ Saída adicionada com sucesso!");
                formSaidas.reset();
                const modalClose = document.getElementById('close-expenses-modal');
                if (modalClose) modalClose.click();
            });
        });
    }

    // Cancelar e limpar formulário
    const btnCancelar = document.getElementById('cancel-expense');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function () {
            const form = document.getElementById('expenses-form');
            if (form) form.reset();
            const modal = document.getElementById('close-expenses-modal');
            if (modal) modal.click();
        });
    }
});
