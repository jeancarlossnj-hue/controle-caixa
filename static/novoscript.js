
// modal-controls.js
document.addEventListener('DOMContentLoaded', function () {
    // Controle do Modal de Vendas
    const salesModal = document.getElementById('sales-modal');
    const openSalesBtn = document.getElementById('sales-btn');
    const closeSalesBtn = document.getElementById('close-sales-modal');
    const cancelSalesBtn = document.getElementById('close-services-modal');

    if (salesModal && openSalesBtn) {
        openSalesBtn.addEventListener('click', () => toggleModal(salesModal, true));
        if (closeSalesBtn) closeSalesBtn.addEventListener('click', () => toggleModal(salesModal, false));
        if (cancelSalesBtn) cancelSalesBtn.addEventListener('click', () => toggleModal(salesModal, false));
        setupModalClickOutside(salesModal);
    }

    // Controle do Modal de Assistência
    const servicesModal = document.getElementById('services-modal');
    const openServicesBtn = document.getElementById('services-btn');
    const closeServicesBtn = document.getElementById('assistencia-modal');
    const cancelServicesBtn = document.getElementById('cancel-service-modal');

    if (servicesModal && openServicesBtn) {
        openServicesBtn.addEventListener('click', () => toggleModal(servicesModal, true));
        if (closeServicesBtn) closeServicesBtn.addEventListener('click', () => toggleModal(servicesModal, false));
        if (cancelServicesBtn) cancelServicesBtn.addEventListener('click', () => toggleModal(servicesModal, false));
        setupModalClickOutside(servicesModal);
    }

    // Controle do Modal de Anotar Saída
    const expensesModal = document.getElementById('expenses-modal');
    const openExpensesBtn = document.getElementById('expenses-btn');
    const closeExpensesBtn = document.getElementById('close-expenses-modal');
    const cancelExpensesBtn = document.getElementById('cancel-expense');

    if (expensesModal && openExpensesBtn) {
        openExpensesBtn.addEventListener('click', () => toggleModal(expensesModal, true));
        if (closeExpensesBtn) closeExpensesBtn.addEventListener('click', () => toggleModal(expensesModal, false));
        if (cancelExpensesBtn) cancelExpensesBtn.addEventListener('click', () => toggleModal(expensesModal, false));
        setupModalClickOutside(expensesModal);
    }

    // Controle do Modal de Cadastro Login
    const cadastroModal = document.getElementById('cadastro-modal');
    const openCadastroBtn = document.getElementById('acesso-btn');
    const openCadastroBtndesktop = document.getElementById('acessos-btn');
    const closeCadastroBtn = document.getElementById('close-cadastro-modal');
    const cancelCadastroBtn = document.getElementById('cancel-cadastro');

    if (cadastroModal && openCadastroBtn) {
        openCadastroBtn.addEventListener('click', () => toggleModal(cadastroModal, true));
        if (closeCadastroBtn) closeCadastroBtn.addEventListener('click', () => toggleModal(cadastroModal, false));
        if (cancelCadastroBtn) cancelCadastroBtn.addEventListener('click', () => toggleModal(cadastroModal, false));
        setupModalClickOutside(cadastroModal);
    }
    if (cadastroModal && openCadastroBtndesktop) {
        openCadastroBtndesktop.addEventListener('click', () => toggleModal(cadastroModal, true));
        if (closeCadastroBtn) closeCadastroBtn.addEventListener('click', () => toggleModal(cadastroModal, false));
        if (cancelCadastroBtn) cancelCadastroBtn.addEventListener('click', () => toggleModal(cadastroModal, false));
        setupModalClickOutside(cadastroModal);
    }

    // Configura o fechamento com a tecla ESC para todos os modais
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal:not(.hidden)');
            openModals.forEach(modal => toggleModal(modal, false));
        }
    });
});

// Funções auxiliares
function toggleModal(modal, show) {
    if (!modal) return;

    if (show) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    } else {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
}

function setupModalClickOutside(modal) {
    modal.addEventListener('click', function (e) {
        if (e.target === modal || e.target.classList.contains('modal-overlay')) {
            toggleModal(modal, false);
        }
    });
}

// Sistema de Notificações
function showNotification(type, message, duration = 5000) {
    const notification = document.getElementById(`${type}-notification`);
    const messageElement = document.getElementById(`${type}-message`);

    if (notification && messageElement) {
        messageElement.textContent = message;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, duration);
    }
}

function hideNotification(id) {
    const notification = document.getElementById(id);
    if (notification) {
        notification.classList.add('hidden');
    }
}






// Pega os elementos do DOM
const paymentMethod = document.getElementById('payment-method');
const paymentComboFields = document.getElementById('payment-combo-fields');
const paymentPart1Label = document.getElementById('payment-part1-label');
const paymentPart2Label = document.getElementById('payment-part2-label');

// Função para atualizar campos extras do pagamento combinado
function updatePaymentComboFields(method, comboFields, part1Label, part2Label) {
    if (method.includes('_')) {
        comboFields.classList.remove('hidden');  // Exibe os campos extras

        const parts = method.split('_');      // Separa em duas partes

        // Mapeamento para nomes legíveis
        const paymentNames = {
            cash: 'Dinheiro',
            card: 'Cartão',
            pix: 'Pix',
            voucher: 'Vale'
        };

        part1Label.textContent = paymentNames[parts[0]] || 'Outro';
        part2Label.textContent = paymentNames[parts[1]] || 'Outro';
    } else {
        comboFields.classList.add('hidden');  // Esconde os campos extras
    }
}

// Evento ao mudar o método de pagamento
if (paymentMethod) {
    paymentMethod.addEventListener('change', function () {
        updatePaymentComboFields(this.value, paymentComboFields, paymentPart1Label, paymentPart2Label);
    });
    
    // Executar uma vez ao carregar para configurar estado inicial
    updatePaymentComboFields(paymentMethod.value, paymentComboFields, paymentPart1Label, paymentPart2Label);
}

// Adicione esta função para resetar os campos de pagamento quando o modal abrir
document.addEventListener('DOMContentLoaded', function() {
    // Resetar campos de pagamento quando o modal de vendas abrir
    const salesBtn = document.getElementById('sales-btn');
    if (salesBtn) {
        salesBtn.addEventListener('click', function() {
            // Pequeno delay para garantir que o modal está aberto
            setTimeout(() => {
                const paymentMethod = document.getElementById('payment-method');
                const paymentComboFields = document.getElementById('payment-combo-fields');
                
                if (paymentMethod && paymentComboFields) {
                    // Resetar para método padrão e esconder campos combinados
                    paymentMethod.value = '';
                    paymentComboFields.classList.add('hidden');
                    
                    // Limpar valores dos campos de pagamento
                    document.getElementById('payment-part1').value = '';
                    document.getElementById('payment-part2').value = '';
                }
            }, 100);
        });
    }
});
// ============================
//  Atualizar campos combinados (SERVIÇO 2)
// ============================
function updateComboFields(method, comboDiv, label1, label2) {
    const inputs = comboDiv.querySelectorAll('input');

    if (method.includes('_')) {
        // Mostra os campos de valor combinados
        comboDiv.classList.remove('hidden');

        const parts = method.split('_');
        const map = {
            cash: 'Dinheiro',
            card: 'Cartão',
            pix: 'Pix',
            voucher: 'Vale'
        };

        label1.textContent = map[parts[0]] || 'Parte 1';
        label2.textContent = map[parts[1]] || 'Parte 2';

        // Garante que os campos estejam ativos
        inputs.forEach(input => {
            input.disabled = false;
            input.removeAttribute('readonly');
            input.style.opacity = '1';
        });
    } else {
        // Oculta os campos e limpa valores
        comboDiv.classList.add('hidden');
        inputs.forEach(input => {
            input.value = '';
            input.disabled = true;
        });
    }
}


document.getElementById('service2-payment-method').addEventListener('change', function () {
    updateComboFields(
        this.value,
        document.getElementById('service2-payment-combo-fields'),
        document.getElementById('service2-payment-part1-label'),
        document.getElementById('service2-payment-part2-label')
    );
});



// Função para salvar uma nova saída
function salvarSaida(event) {
    event.preventDefault();
    
    const motivo = document.getElementById('expense-reason').value;
    const valor = parseFloat(document.getElementById('expense-value').value);
    const data = document.getElementById('expense-date').value;
    const funcionario = document.getElementById('expense-employee').value;
    
    // Adicionar a saída ao banco de dados
    adicionarSaida(motivo, valor, data, funcionario, function(result) {
        // Fechar o modal
        document.getElementById('expenses-modal').classList.add('hidden');
        
        // Limpar o formulário
        document.getElementById('expenses-form').reset();
        
        // Mostrar mensagem de sucesso
        alert('Saída registrada com sucesso!');
    });
}

// Adicionar event listener ao formulário de saídas
document.getElementById('expenses-form').addEventListener('submit', salvarSaida);

// Carregar nome do usuário quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    const loggedInUser = getLoggedInUser();
    
    if (!loggedInUser && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
        return;
    }
    updateWelcomeMessage();
    
    // Adicionar event listener para o botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});



// Função para mostrar notificações
function showNotification(type, message) {
    // Cria elemento de notificação se não existir
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(notification);
    }
    
    notification.style.backgroundColor = type === 'success' ? '#10B981' : '#EF4444';
    notification.textContent = message;
    notification.style.opacity = '1';
    
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

