// vendedores.js - Gerenciamento de vendedores
(function() {
    'use strict';
    
    let listaVendedores = [];

    // Função para carregar vendedores da API
    async function carregarVendedores() {
        try {
        
            const response = await fetch('http://127.0.0.1:5000/obter_vendedores');
            
            if (!response.ok) {
                throw new Error('Erro ao carregar vendedores');
            }
            
            listaVendedores = await response.json();
            return listaVendedores;
        } catch (error) {
            console.error('Erro ao carregar vendedores:', error);
            // Fallback: usar usuário logado
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser) {
                listaVendedores = [loggedInUser];
            } else {
                listaVendedores = [];
            }
            return listaVendedores;
        }
    }

    // Função para preencher select de vendedores
    function preencherSelectVendedores(selectId, valorPadrao = null) {
        const select = document.getElementById(selectId);
        if (!select) {
            console.warn(`Select não encontrado: ${selectId}`);
            return;
        }

        // Limpa o select
        select.innerHTML = '';

        // Adiciona opção padrão
        const optionPadrao = document.createElement('option');
        optionPadrao.value = '';
        optionPadrao.textContent = 'Selecione um vendedor...';
        optionPadrao.disabled = true;
        optionPadrao.selected = true;
        select.appendChild(optionPadrao);

        // Adiciona os vendedores
        listaVendedores.forEach(vendedor => {
            const option = document.createElement('option');
            option.value = vendedor;
            option.textContent = vendedor;
            
            // Seleciona o valor padrão se especificado
            if (valorPadrao && vendedor === valorPadrao) {
                option.selected = true;
            }
            
            select.appendChild(option);
        });

    
    }

    // Função para inicializar vendedores quando modais abrem
    function inicializarVendedoresModal(modalId, selectId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Quando o modal é aberto, preencher os vendedores
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!modal.classList.contains('hidden')) {
                            // Modal foi aberto - carregar e preencher vendedores
                            console.log(`🔄 Modal ${modalId} aberto - carregando vendedores...`);
                            carregarVendedores().then(() => {
                                preencherSelectVendedores(selectId);
                            });
                        }
                    }
                });
            });

            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }

    // Inicializar quando a página carregar
    document.addEventListener('DOMContentLoaded', function() {
        
        
        // Carregar vendedores uma vez quando a página inicia
        carregarVendedores().then(() => {
            // Inicializar os modais de venda e assistência
            inicializarVendedoresModal('sales-modal', 'vendedor-venda');
            inicializarVendedoresModal('services-modal', 'vendedor-assistencia');
            
            // Também preencher se os modais já estiverem abertos
            setTimeout(() => {
                const modalVendas = document.getElementById('sales-modal');
                const modalAssistencia = document.getElementById('services-modal');
                
                if (modalVendas && !modalVendas.classList.contains('hidden')) {
                    preencherSelectVendedores('vendedor-venda');
                }
                if (modalAssistencia && !modalAssistencia.classList.contains('hidden')) {
                    preencherSelectVendedores('vendedor-assistencia');
                }
            }, 100);
        });

        // Event listeners para os botões (fallback)
        document.getElementById('sales-btn')?.addEventListener('click', function() {
            setTimeout(() => {
                carregarVendedores().then(() => preencherSelectVendedores('vendedor-venda'));
            }, 100);
        });

        document.getElementById('services-btn')?.addEventListener('click', function() {
            setTimeout(() => {
                carregarVendedores().then(() => preencherSelectVendedores('vendedor-assistencia'));
            }, 100);
        });
    });

    // Função para obter o usuário logado como fallback
    function obterUsuarioLogado() {
        return localStorage.getItem('loggedInUser');
    }

    // Exportar para uso em outros arquivos
    window.carregarVendedores = carregarVendedores;
    window.preencherSelectVendedores = preencherSelectVendedores;
    window.inicializarVendedoresModal = inicializarVendedoresModal;
    window.obterUsuarioLogado = obterUsuarioLogado;
})();