
const API = 'https://controle-caixa-production-b94c.up.railway.app';

// ============================
//  VARIÁVEIS GLOBAIS - FILTROS
// ============================
let todasAssistencias = [];
let filtrosAtivosAssistencias = {
    data: '',
    nome: '',
    vendedor: '',
    status: ''
};
// Função para aplicar filtros nas assistências
function aplicarFiltrosAssistencias() {
    console.log("Aplicando filtros de assistências...");

    const filtroData = document.getElementById('filtro-data-assistencias').value;
    const filtroNome = document.getElementById('filtro-nome-assistencias').value.toLowerCase();
    const filtroVendedor = document.getElementById('filtro-vendedor-assistencias').value;
    const filtroStatus = document.getElementById('filtro-status-assistencias').value;

    filtrosAtivosAssistencias = {
        data: filtroData,
        nome: filtroNome,
        vendedor: filtroVendedor,
        status: filtroStatus
    };

    console.log("Filtros ativos assistências:", filtrosAtivosAssistencias);
    filtrarETableAssistencias();
}

// ============================
//  FILTRAR E ATUALIZAR TABELA ASSISTÊNCIAS
// ============================
function filtrarETableAssistencias() {
    console.log("Filtrando tabela de assistências...");
    console.log("todasAssistencias length:", todasAssistencias.length);

    if (!todasAssistencias || todasAssistencias.length === 0) {
        console.log("Nenhuma assistência carregada ainda. Carregando assistências...");
        carregarAssistencias();
        return;
    }

    const assistenciasFiltradas = todasAssistencias.filter(assistencia => {
        // Filtro por data
        if (filtrosAtivosAssistencias.data) {
            const dataAssistencia = assistencia.data_cadastro ? assistencia.data_cadastro.split(' ')[0] : '';
            if (dataAssistencia !== filtrosAtivosAssistencias.data) {
                return false;
            }
        }

        // Filtro por nome do cliente
        if (filtrosAtivosAssistencias.nome) {
            const nomeCliente = assistencia.nome_cliente ? assistencia.nome_cliente.toLowerCase() : '';
            if (!nomeCliente.includes(filtrosAtivosAssistencias.nome)) {
                return false;
            }
        }

        // Filtro por vendedor/técnico
        if (filtrosAtivosAssistencias.vendedor) {
            const vendedor = assistencia.nome_vendedor || '';
            if (vendedor !== filtrosAtivosAssistencias.vendedor) {
                return false;
            }
        }

        // Filtro por status (pendente/concluído)
        if (filtrosAtivosAssistencias.status) {
            const isPendente = assistencia.custo_servico === '-' || assistencia.custo_servico === null || assistencia.custo_servico === '' || assistencia.status === 'pendente';

            if (filtrosAtivosAssistencias.status === 'pendente' && !isPendente) {
                return false;
            }
            if (filtrosAtivosAssistencias.status === 'concluido' && isPendente) {
                return false;
            }
        }

        return true;
    });

    console.log("Assistências filtradas:", assistenciasFiltradas.length);

    // CHAMANDO A FUNÇÃO CORRETA QUE MANTÉM A ESTRUTURA ORIGINAL
    atualizarTabelaAssistencias(assistenciasFiltradas);
    atualizarFiltrosAtivosUI('assistencias');
}

// Função para limpar filtros de assistências
function limparFiltrosAssistencias() {
    document.getElementById('filtro-data-assistencias').value = '';
    document.getElementById('filtro-nome-assistencias').value = '';
    document.getElementById('filtro-vendedor-assistencias').value = '';
    document.getElementById('filtro-status-assistencias').value = '';

    filtrosAtivosAssistencias = {
        data: '',
        nome: '',
        vendedor: '',
        status: ''
    };

    filtrarETableAssistencias();
}

// Função para preencher select de vendedores nos filtros de assistências
function preencherFiltroVendedoresAssistencias() {
    const select = document.getElementById('filtro-vendedor-assistencias');
    if (!select) return;

    // Limpar opções existentes (mantendo a primeira)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Adicionar vendedores únicos
    const vendedoresUnicos = [...new Set(todasAssistencias.map(a => a.nome_vendedor).filter(v => v && v !== '-' && v !== ''))];

    vendedoresUnicos.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor;
        option.textContent = vendedor;
        select.appendChild(option);
    });
}

// Função auxiliar para filtrar uma assistência
function filtrarAssistencia(assistencia, filtros) {
    if (filtros.data) {
        const dataAssistencia = assistencia.data_cadastro ? assistencia.data_cadastro.split(' ')[0] : '';
        if (dataAssistencia !== filtros.data) return false;
    }

    if (filtros.nome) {
        const nomeCliente = assistencia.nome_cliente ? assistencia.nome_cliente.toLowerCase() : '';
        if (!nomeCliente.includes(filtros.nome)) return false;
    }

    if (filtros.vendedor) {
        const vendedor = assistencia.nome_vendedor || '';
        if (vendedor !== filtros.vendedor) return false;
    }

    if (filtros.status) {
        const isPendente = assistencia.custo_servico === '-' || assistencia.custo_servico === null || assistencia.custo_servico === '' || assistencia.status === 'pendente';
        if (filtros.status === 'pendente' && !isPendente) return false;
        if (filtros.status === 'concluido' && isPendente) return false;
    }

    return true;
}

// ============================
//  REGISTRAR ASSISTÊNCIA - COMPLETA E ATUALIZADA
// ============================
const servicesForm = document.getElementById('services-form');

if (servicesForm) {
    servicesForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        console.log("🟡 Iniciando cadastro de assistência...");

        // ============================
        // 1️⃣ CAPTURAR VENDEDOR
        // ============================
        const nomeVendedor = document.getElementById('vendedor-assistencia').value;
        if (!nomeVendedor) {
            alert("⚠️ Selecione o vendedor responsável pela assistência.");
            return;
        }

        // ============================
        // 2️⃣ CAPTURAR GARANTIA
        // ============================
        const garantiaRadio = document.querySelector('input[name="service-warranty"]:checked');
        const garantia = garantiaRadio ? garantiaRadio.value : '30';

        // ============================
        // 3️⃣ CAPTURAR CHECKLIST (VISUAL)
        // ============================
        const checklist = {
            aparelho_liga: document.querySelector('input[name="liga"]:checked')?.value || 'nao',
            tela_quebrada: document.querySelector('input[name="tela"]:checked')?.value || 'nao',
            exibe_imagem: document.querySelector('input[name="imagen"]:checked')?.value || 'nao',
            camera_funciona: document.querySelector('input[name="camera"]:checked')?.value || 'nao',
            wifi_bluetooth: document.querySelector('input[name="wifi"]:checked')?.value || 'nao',
            som_funciona: document.querySelector('input[name="som"]:checked')?.value || 'nao',
            botoes_funcionam: document.querySelector('input[name="botoes"]:checked')?.value || 'nao',
            dano_liquido: document.querySelector('input[name="oxidacao"]:checked')?.value || 'nao',
            outra_assistencia: document.querySelector('input[name="outra_assistencia"]:checked')?.value || 'nao',
            gaveta_sim: document.querySelector('input[name="gaveta_chip"]:checked')?.value || 'nao',
            com_capinha: document.querySelector('input[name="capinha"]:checked')?.value || 'nao'
        };
        console.log("🔍 Checklist capturado:", checklist);

        // ============================
        // 4️⃣ MONTAR OBJETO PRINCIPAL
        // ============================
        const dadosAssistencia = {
            nome_cliente: document.getElementById('service-customer-name').value.trim(),
            telefone_cliente: document.getElementById('service-customer-phone').value.trim(),
            marca_aparelho: document.getElementById('device-model').value,
            modelo_aparelho: document.getElementById('device-brand').value.trim(),
            descricao_defeito: document.getElementById('defect-description').value.trim(),
            servico_realizado: document.getElementById('service-description').value.trim(),
            valor_servico: parseFloat(document.getElementById('service-value').value) || 0,
            forma_pagamento: document.getElementById('service2-payment-method').value,
            garantia: garantia,
            nome_vendedor: nomeVendedor
        };

        // ============================
        // 5️⃣ VALIDAÇÕES DE CAMPOS
        // ============================
        if (!dadosAssistencia.nome_cliente) {
            alert("⚠️ Informe o nome do cliente.");
            return;
        }
        if (!dadosAssistencia.forma_pagamento) {
            alert("⚠️ Selecione a forma de pagamento.");
            return;
        }
        if (!dadosAssistencia.valor_servico || isNaN(dadosAssistencia.valor_servico)) {
            alert("⚠️ Informe um valor válido para o serviço.");
            return;
        }

        // ============================
        // 6️⃣ TRATAR PAGAMENTO COMBINADO
        // ============================
        const formaPagamentoValue = dadosAssistencia.forma_pagamento;

        if (formaPagamentoValue.includes('_')) {
            dadosAssistencia.valor_dinheiro = parseFloat(document.getElementById('service2-payment-part1').value) || 0;

            if (formaPagamentoValue === 'cash_card') {
                dadosAssistencia.valor_cartao = parseFloat(document.getElementById('service2-payment-part2').value) || 0;
            } else if (formaPagamentoValue === 'cash_pix' || formaPagamentoValue === 'card_pix') {
                dadosAssistencia.valor_pix = parseFloat(document.getElementById('service2-payment-part2').value) || 0;
            }

            console.log("💰 Pagamento combinado detectado:", {
                dinheiro: dadosAssistencia.valor_dinheiro,
                cartao: dadosAssistencia.valor_cartao,
                pix: dadosAssistencia.valor_pix
            });
        }

        console.log("📄 Dados completos prontos para envio/PDF:", dadosAssistencia);

        // ============================
        // 7️⃣ GERAR PDF E SALVAR NO BANCO
        // ============================
        try {
            if (window.pdfGenerator && window.pdfGenerator.abrirModalAssistencia) {
                console.log("🎬 Gerando PDF...");
                document.getElementById('services-modal').classList.add('hidden');

                // Gera o PDF e só depois salva no banco
                window.pdfGenerator.abrirModalAssistencia(dadosAssistencia, async (resultado) => {
                    console.log("📄 PDF finalizado. Resultado:", resultado);

                    if (resultado !== 'fechar' && resultado !== 'erro') {
                        console.log("💾 Salvando assistência no banco de dados...");
                        await salvarAssistenciaNoBanco(dadosAssistencia);
                    } else {
                        console.warn("❌ PDF cancelado, não salvando no banco.");
                        document.getElementById('services-modal').classList.remove('hidden');
                    }
                });
            } else {
                console.warn("⚠️ PDF Generator não disponível — salvando direto no banco.");
                await salvarAssistenciaNoBanco(dadosAssistencia);
            }
        } catch (err) {
            console.error("❌ Erro inesperado ao gerar PDF:", err);
            alert("❌ Ocorreu um erro ao gerar o PDF ou salvar a assistência.");
        }
    });
}



// ============================
//  FUNÇÃO PARA SALVAR NO BANCO (ATUALIZADA)
// ============================
async function salvarAssistenciaNoBanco(dadosAssistencia) {
    try {
        console.log("📤 Enviando dados COMPLETOS para API...", dadosAssistencia);

        const response = await fetch(`${API}/registrar/assistencias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosAssistencia)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("📥 Resposta completa da API:", data);

        if (data.sucesso) {
            console.log("✅ Assistência salva no banco com todos os campos!");

            // Limpar formulário apenas se salvou com sucesso
            servicesForm.reset();
            resetarChecklistAssistencia();

            // Mostrar mensagem de sucesso
            alert('✅ Assistência cadastrada com sucesso!\n' +
                `Cliente: ${dadosAssistencia.nome_cliente}\n` +
                `Serviço: ${dadosAssistencia.servico_realizar}\n` +
                `Valor: R$ ${dadosAssistencia.valor_servico.toFixed(2)}`);

        } else {
            alert('❌ Erro ao salvar: ' + (data.mensagem || 'Erro desconhecido'));
        }

    } catch (error) {
        console.error('❌ Erro completo ao salvar assistência:', error);
        alert('❌ Erro ao salvar assistência: ' + error.message);
    }
}

// ============================
//  FUNÇÃO PARA RESETAR CHECKLIST
// ============================
function resetarChecklistAssistencia() {
    console.log("🔄 Resetando checklist...");

    // Resetar todos os radios
    const radios = document.querySelectorAll('#services-form input[type="radio"]');
    radios.forEach(radio => {
        radio.checked = false;
    });

    // Marcar 'não' como padrão
    const radiosNao = document.querySelectorAll('#services-form input[type="radio"][value="nao"]');
    radiosNao.forEach(radio => {
        radio.checked = true;
    });

    // Garantia padrão 30 dias
    const garantia30 = document.querySelector('input[name="service-warranty"][value="30"]');
    if (garantia30) garantia30.checked = true;

    console.log("✅ Checklist resetado");
}

// ============================
//  FUNÇÃO PARA GERAR PDF DA ASSISTÊNCIA - COM DEBUG
// ============================
async function gerarPDFAssistencia(dados) {
    console.log("🎬 Iniciando geração de PDF...", dados);

    try {
        console.log("1. Verificando bibliotecas...");
        console.log(" - jspdf:", typeof jspdf);
        console.log(" - html2canvas:", typeof html2canvas);
        console.log(" - pdfGenerator:", window.pdfGenerator);
        console.log(" - abrirModalAssistencia:", typeof window.pdfGenerator.abrirModalAssistencia);

        // Pequena pausa para garantir que tudo está pronto
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log("2. Chamando pdfGenerator.abrirModalAssistencia...");

        // Chamar a função de PDF com tratamento de callback
        window.pdfGenerator.abrirModalAssistencia(dados, function (resultado) {
            console.log("3. Callback do PDF executado! Resultado:", resultado);
            console.log("✅ PDF gerado com sucesso!");
        });

        console.log("4. Função abrirModalAssistencia chamada - aguardando callback...");

    } catch (err) {
        console.error("❌ Erro completo na geração do PDF:", err);
        console.error("Stack trace:", err.stack);
        alert("✅ Assistência salva! ⚠️ Erro ao gerar PDF: " + err.message);
    }
}



// ============================
//  VARIÁVEIS GLOBAIS
// ============================
let assistenciaIdEditando = null;
let assistenciaIdAtual = null;
document.addEventListener('DOMContentLoaded', function () {
    // Usar as funções do vendedores.js
    if (typeof inicializarVendedoresModal === 'function') {
        inicializarVendedoresModal('services-modal', 'vendedor-assistencia');
    }

    // Ou carregar diretamente quando necessário
    if (typeof carregarVendedores === 'function') {
        carregarVendedores().then(() => {
            if (typeof preencherSelectVendedores === 'function') {
                preencherSelectVendedores('vendedor-assistencia');
            }
        });
    }
});
// ============================
//  CARREGAR ASSISTÊNCIAS - ATUALIZADA
// ============================
function carregarAssistencias() {
    fetch(`${API}/obter_assistencias`)
        .then(response => response.json())
        .then(assistencias => {
            // ATUALIZAÇÃO: Preencher a variável global para os filtros
            todasAssistencias = assistencias;

            const tabela = document.getElementById('assistencias-table');
            if (!tabela) {
                console.error("Tabela de assistências não encontrada!");
                return;
            }

            tabela.innerHTML = '';



            assistencias.forEach(assistencia => {
                // Debug

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-4 py-3 whitespace-nowrap">${assistencia.nome_cliente}</td>
                    <td class="px-4 py-3 whitespace-nowrap">${assistencia.telefone_cliente}</td>
                    <td class="px-4 py-3 whitespace-nowrap">${assistencia.marca_aparelho}</td>
                    <td class="px-4 py-3 whitespace-nowrap">${assistencia.modelo_aparelho}</td>
                    <td class="px-4 py-3 whitespace-nowrap">${traduzirPagamento(assistencia.forma_pagamento)}</td>
                    <td class="px-4 py-3 whitespace-nowrap">R$ ${parseFloat(assistencia.valor_servico).toFixed(2)}</td>
                    <td class="px-4 py-3 whitespace-nowrap">${assistencia.custo_servico === '-' ? '-' : `R$ ${parseFloat(assistencia.custo_servico).toFixed(2)}`}</td>
                    <td class="px-4 py-3 whitespace-nowrap">${assistencia.nome_vendedor || '-'}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        ${assistencia.custo_servico === '-' || assistencia.status === 'pendente'
                        ? `<button onclick="abrirModalCustoAssistencia(this, ${assistencia.id})" class="bg-yellow-200 text-yellow-800 border border-yellow-400 px-3 py-1 rounded font-semibold hover:bg-yellow-300 transition">Pendente</button>`
                        : `<span class="bg-green-200 text-green-800 px-3 py-1 rounded font-semibold">Concluído</span>`}
                    </td>
                    <td class="px-4 py-3 space-x-2 whitespace-nowrap"
                        data-telefone="${assistencia.telefone_cliente || ''}"
                        data-pagamento="${assistencia.forma_pagamento || ''}"
                        data-custo="${assistencia.custo_servico || ''}"
                        data-garantia="${assistencia.periodo_garantia || ''}"
                        data-vendedor="${assistencia.nome_vendedor || ''}"
                        data-data-cadastro="${assistencia.data_cadastro || ''}">
                        <button onclick="abrirModalDetalhesAssistencia(this)" class="px-3 py-1 rounded border border-green-700 bg-green-500 text-white font-semibold hover:bg-green-600 transition">Ver Detalhes</button>
                        <button onclick="abrirModalEditarAssistencia(this, ${assistencia.id})" class="px-3 py-1 rounded border border-blue-500 bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition">Editar</button>
                        <button onclick="confirmarExclusaoAssistencia(this, ${assistencia.id})" class="px-3 py-1 rounded border border-red-500 bg-red-100 text-red-800 font-semibold hover:bg-red-200 transition">Excluir</button>
                    </td>
                `;
                tabela.appendChild(tr);
            });

            // ATUALIZAÇÃO: Preencher o select de vendedores após carregar
            preencherFiltroVendedoresAssistencias();

        })
        .catch(error => {
            console.error('Erro ao carregar assistências:', error);
        });
}

// ============================
//  PREENCHER FILTRO DE VENDEDORES - ASSISTÊNCIAS
// ============================
function preencherFiltroVendedoresAssistencias() {
    const select = document.getElementById('filtro-vendedor-assistencias');
    if (!select) return;

    // Limpar opções existentes (mantendo a primeira)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Adicionar vendedores únicos
    const vendedoresUnicos = [...new Set(todasAssistencias.map(a => a.nome_vendedor).filter(v => v && v !== '-' && v !== ''))];

    vendedoresUnicos.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor;
        option.textContent = vendedor;
        select.appendChild(option);
    });


}

// ============================
//  ATUALIZAR UI FILTROS ATIVOS - ASSISTÊNCIAS
// ============================
function atualizarFiltrosAtivosUI(tipo) {
    if (tipo !== 'assistencias') return;

    const container = document.getElementById('filtros-ativos-assistencias');
    const tagsContainer = document.getElementById('tags-filtros-assistencias');
    const textoContador = document.getElementById('texto-contador-assistencias');
    const contador = document.getElementById('contador-assistencias');

    if (!container || !tagsContainer || !textoContador || !contador) return;

    // Limpar tags existentes
    tagsContainer.innerHTML = '';

    // Criar tags para filtros ativos
    let filtrosCount = 0;

    if (filtrosAtivosAssistencias.data) {
        criarTagFiltro(tagsContainer, `Data: ${formatarData(filtrosAtivosAssistencias.data)}`, 'assistencias');
        filtrosCount++;
    }

    if (filtrosAtivosAssistencias.nome) {
        criarTagFiltro(tagsContainer, `Nome: "${filtrosAtivosAssistencias.nome}"`, 'assistencias');
        filtrosCount++;
    }

    if (filtrosAtivosAssistencias.vendedor) {
        criarTagFiltro(tagsContainer, `Vendedor: ${filtrosAtivosAssistencias.vendedor}`, 'assistencias');
        filtrosCount++;
    }

    if (filtrosAtivosAssistencias.status) {
        const statusText = filtrosAtivosAssistencias.status === 'pendente' ? 'Pendentes' : 'Concluídos';
        criarTagFiltro(tagsContainer, `Status: ${statusText}`, 'assistencias');
        filtrosCount++;
    }

    // Mostrar/ocultar container de filtros ativos
    if (filtrosCount > 0) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }

    // Atualizar contador
    const assistenciasFiltradas = todasAssistencias.filter(a => filtrarAssistencia(a, filtrosAtivosAssistencias));
    const total = todasAssistencias.length;
    const filtradas = assistenciasFiltradas.length;

    contador.textContent = filtradas;

    if (filtrosCount > 0) {
        textoContador.textContent = `${filtradas} de ${total} assistências encontradas`;
        textoContador.className = 'text-sm text-orange-600 font-medium';
        contador.className = 'bg-orange-500 text-white px-2 py-1 rounded text-sm font-medium';
    } else {
        textoContador.textContent = `${total} assistências no total`;
        textoContador.className = 'text-sm text-gray-600';
        contador.className = 'bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm';
    }
}

// ============================
//  FUNÇÕES AUXILIARES
// ============================
function criarTagFiltro(container, texto, tipo) {
    const tag = document.createElement('div');
    tag.className = `bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium flex items-center`;

    tag.innerHTML = `
        ${texto}
        <button onclick="removerFiltroAssistencia('${texto.split(':')[0].toLowerCase().trim()}')" 
                class="ml-1 text-orange-600 hover:text-orange-800">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    container.appendChild(tag);
}

function removerFiltroAssistencia(tipoFiltro) {
    switch (tipoFiltro) {
        case 'data':
            document.getElementById('filtro-data-assistencias').value = '';
            filtrosAtivosAssistencias.data = '';
            break;
        case 'nome':
            document.getElementById('filtro-nome-assistencias').value = '';
            filtrosAtivosAssistencias.nome = '';
            break;
        case 'vendedor':
            document.getElementById('filtro-vendedor-assistencias').value = '';
            filtrosAtivosAssistencias.vendedor = '';
            break;
        case 'status':
            document.getElementById('filtro-status-assistencias').value = '';
            filtrosAtivosAssistencias.status = '';
            break;
    }

    filtrarETableAssistencias();
}

function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
}

// ============================
//  MODAL DETALHES ASSISTÊNCIA - ATUALIZADO COM BOTÃO IMPRIMIR
// ============================
function abrirModalDetalhesAssistencia(botao) {
    const linha = botao.closest("tr");
    const celulaAcoes = linha.querySelector("td:last-child");

    console.log("=== DEBUG MODAL DETALHES ASSISTÊNCIA ===");
    console.log("Celula Acoes:", celulaAcoes);
    console.log("Data do cadastro:", celulaAcoes.getAttribute("data-data-cadastro"));
    console.log("Garantia:", celulaAcoes.getAttribute("data-garantia"));
    console.log("Vendedor:", celulaAcoes.getAttribute("data-vendedor"));
    console.log("Telefone:", celulaAcoes.getAttribute("data-telefone"));
    console.log("========================");

    const nome = linha.children[0].textContent;
    const telefone = linha.children[1].textContent;
    const marca = linha.children[2].textContent;
    const modelo = linha.children[3].textContent;
    const pagamento = linha.children[4].textContent;
    const valor = linha.children[5].textContent;
    const custo = linha.children[6].textContent;
    const vendedor = linha.children[7].textContent;
    const status = linha.children[8].textContent.trim();

    const telefoneData = celulaAcoes.getAttribute("data-telefone");
    const formaPagamento = celulaAcoes.getAttribute("data-pagamento");
    const garantiaDias = celulaAcoes.getAttribute("data-garantia");
    const vendedorData = celulaAcoes.getAttribute("data-vendedor");
    const dataCadastro = celulaAcoes.getAttribute("data-data-cadastro");

    // ... (código existente de formatação de data e garantia)

    // Formatar data e hora do cadastro
    let dataCadastroFormatada = 'Não informada';
    let horaCadastroFormatada = 'Não informada';
    let dataValidadeGarantia = 'Não calculável';

    if (dataCadastro && dataCadastro !== 'null' && dataCadastro !== 'undefined' && dataCadastro !== '' && dataCadastro !== '-') {
        console.log("Processando data:", dataCadastro);
        try {
            const data = new Date(dataCadastro);
            console.log("Data convertida:", data);

            if (!isNaN(data.getTime())) {
                dataCadastroFormatada = data.toLocaleDateString('pt-BR');
                horaCadastroFormatada = data.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                console.log("Data formatada:", dataCadastroFormatada);
                console.log("Hora formatada:", horaCadastroFormatada);

                // Calcular validade da garantia
                if (garantiaDias && garantiaDias !== 'null' && garantiaDias !== 'undefined' && garantiaDias !== '') {
                    const dias = parseInt(garantiaDias);
                    console.log("Dias de garantia:", dias);

                    if (!isNaN(dias) && dias > 0) {
                        const dataValidade = new Date(data);
                        dataValidade.setDate(dataValidade.getDate() + dias);
                        dataValidadeGarantia = dataValidade.toLocaleDateString('pt-BR');
                        console.log("Validade garantia:", dataValidadeGarantia);
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao processar data:", error);
        }
    }

    // Garantia
    let garantiaTexto = 'Não informada';
    if (garantiaDias && garantiaDias !== 'null' && garantiaDias !== 'undefined' && garantiaDias !== '') {
        const dias = parseInt(garantiaDias);
        if (!isNaN(dias) && dias > 0) {
            garantiaTexto = `${dias} dias${dataValidadeGarantia !== 'Não calculável' ? ` (Válida até: ${dataValidadeGarantia})` : ''}`;
        }
    }

    // Lucro
    let lucroHTML = '';
    if (custo !== '-' && custo !== '' && custo !== 'R$ -') {
        const valorLimpo = valor.replace('R$', '').replace(/\s/g, '').trim();
        const custoLimpo = custo.replace('R$', '').replace(/\s/g, '').trim();

        const valorNumerico = parseFloat(valorLimpo) || 0;
        const custoNumerico = parseFloat(custoLimpo) || 0;

        const lucro = valorNumerico - custoNumerico;
        const margem = valorNumerico > 0 ? ((lucro / valorNumerico) * 100).toFixed(1) : '0.0';

        const lucroFormatado = lucro.toFixed(2);

        lucroHTML = `
            <div class="text-center p-3 bg-green-50 rounded">
                <div class="font-semibold text-green-800">Lucro Total</div>
                <div class="text-lg font-bold">R$ ${lucroFormatado}</div>
                <div class="text-sm text-green-600">Margem: ${margem}%</div>
            </div>
        `;
    }

    const detalhesDiv = document.getElementById("detalhes-assistencia-content");
    if (!detalhesDiv) {
        console.error("Elemento detalhes-assistencia-content não encontrado!");
        return;
    }

    detalhesDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Coluna 1 -->
            <div class="space-y-3">
                <div class="border-b pb-2">
                    <h3 class="font-semibold text-gray-800 text-lg">Informações do Cliente</h3>
                </div>
                <div class="flex justify-between"><span class="font-medium">Nome:</span><span>${nome}</span></div>
                <div class="flex justify-between"><span class="font-medium">Telefone:</span><span>${telefoneData || telefone || 'Não informado'}</span></div>
                <div class="flex justify-between"><span class="font-medium">Vendedor:</span><span>${vendedorData || vendedor || '-'}</span></div>
                <div class="flex justify-between"><span class="font-medium">Data do Cadastro:</span><span>${dataCadastroFormatada}</span></div>
                <div class="flex justify-between"><span class="font-medium">Hora do Cadastro:</span><span>${horaCadastroFormatada}</span></div>
                <div class="flex justify-between">
                    <span class="font-medium">Status:</span>
                    <span class="px-3 py-1 rounded text-xs font-medium ${custo === '-' || custo === 'R$ -' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">
                        ${custo === '-' || custo === 'R$ -' ? '⚠️ Pendente' : '✅ Concluído'}
                    </span>
                </div>
            </div>
            
            <!-- Coluna 2 -->
            <div class="space-y-3">
                <div class="border-b pb-2">
                    <h3 class="font-semibold text-gray-800 text-lg">Informações do Aparelho</h3>
                </div>
                <div class="flex justify-between"><span class="font-medium">Marca:</span><span>${marca}</span></div>
                <div class="flex justify-between"><span class="font-medium">Modelo:</span><span>${modelo}</span></div>
                <div class="flex justify-between"><span class="font-medium">Forma de Pagamento:</span><span>${pagamento}</span></div>
                <div class="flex justify-between"><span class="font-medium">Garantia:</span><span>${garantiaTexto}</span></div>
            </div>
        </div>
        
        <!-- Financeiro -->
        <div class="border-t pt-4 mb-6">
            <h3 class="font-semibold text-gray-800 text-lg mb-3">Informações Financeiras</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="text-center p-3 bg-blue-50 rounded">
                    <div class="font-semibold text-blue-800">Valor do Serviço</div>
                    <div class="text-lg font-bold">${valor}</div>
                </div>
                <div class="text-center p-3 bg-purple-50 rounded">
                    <div class="font-semibold text-purple-800">Custo</div>
                    <div class="text-lg font-bold">${custo}</div>
                </div>
                ${lucroHTML || `
                    <div class="text-center p-3 bg-gray-50 rounded">
                        <div class="font-semibold text-gray-800">Lucro</div>
                        <div class="text-sm text-gray-600">Custo pendente</div>
                    </div>
                `}
            </div>
        </div>
        
        <!-- Pagamento -->
        <div class="border-t pt-4">
            <h3 class="font-semibold text-gray-800 text-lg mb-3">Detalhes do Pagamento</h3>
            <div class="bg-gray-50 p-4 rounded">
                <div class="flex justify-between items-center">
                    <span class="font-medium">Método:</span>
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">${pagamento}</span>
                </div>
                ${formaPagamento && formaPagamento.includes('_') ? `
                    <div class="mt-2 text-sm text-gray-600">
                        <p>Pagamento dividido em duas formas</p>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Botão Imprimir Cupom -->
        <div class="border-t pt-4 mt-6">
            <div class="flex justify-center">
                <button onclick="imprimirCupomAssistencia(this)" 
                        class="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
                    <i class="fas fa-print"></i>
                    Imprimir Cupom
                </button>
            </div>
        </div>
    `;

    // Armazenar dados para uso no PDF
    detalhesDiv.setAttribute('data-assistencia-detalhes', JSON.stringify({
        nome_cliente: nome,
        telefone_cliente: telefoneData || telefone || '',
        marca_aparelho: marca,
        modelo_aparelho: modelo,
        valor_servico: valor.replace('R$ ', ''),
        forma_pagamento: formaPagamento || 'cash',
        periodo_garantia: garantiaDias || '30',
        nome_vendedor: vendedorData || vendedor || '',
        data_cadastro: dataCadastro
    }));

    document.getElementById("modal-detalhes-assistencia").classList.remove("hidden");
}


// ============================
//  IMPRIMIR CUPOM ASSISTÊNCIA - DETALHES
// ============================
function imprimirCupomAssistencia(botao) {
    const detalhesDiv = document.getElementById("detalhes-assistencia-content");
    const dadosString = detalhesDiv.getAttribute('data-assistencia-detalhes');

    if (!dadosString) {
        alert('Erro: Dados da assistência não encontrados.');
        return;
    }

    try {
        const dadosAssistencia = JSON.parse(dadosString);

        // Converter valor para número
        dadosAssistencia.valor_servico = parseFloat(dadosAssistencia.valor_servico.replace('R$', '').replace(/\s/g, '').trim());

        console.log("🎬 Gerando PDF dos detalhes da assistência:", dadosAssistencia);

        if (window.pdfGenerator && window.pdfGenerator.abrirModalAssistencia) {
            // Gera o PDF sem custo/lucro (apenas dados básicos)
            window.pdfGenerator.abrirModalAssistencia(dadosAssistencia, (resultado) => {
                console.log("📄 PDF finalizado. Resultado:", resultado);
            });
        } else {
            alert('Erro: Gerador de PDF não disponível.');
        }
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar cupom: ' + error.message);
    }
}

// ============================
//  MODAL CUSTO ASSISTÊNCIA
// ============================
function abrirModalCustoAssistencia(botao, idAssistencia) {
    assistenciaIdAtual = idAssistencia;
    document.getElementById("input-custo-assistencia").value = "";
    document.getElementById("modal-custo-assistencia").classList.remove("hidden");
}

function salvarCustoAssistencia() {
    const custo = document.getElementById("input-custo-assistencia").value;

    if (custo === "" || parseFloat(custo) <= 0) {
        alert("Por favor, informe um valor de custo válido.");
        return;
    }

    fetch(`${API}/atualizar_custo_assistencia/${assistenciaIdAtual}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            custo_servico: parseFloat(custo),
            status: 'concluido'
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.mensagem || `Erro HTTP ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            alert(data.mensagem);
            fecharModalCustoAssistencia();
            carregarAssistencias();
        })
        .catch(err => {
            console.error('Erro ao atualizar custo:', err);
            alert('Erro ao salvar custo: ' + err.message);
        });
}

function fecharModalCustoAssistencia() {
    document.getElementById("modal-custo-assistencia").classList.add("hidden");
}


// ============================
//  ABRIR MODAL EDITAR ASSISTÊNCIA (CORRIGIDO)
// ============================
function abrirModalEditarAssistencia(botao, idAssistencia) {
    const cargo = localStorage.getItem("userRole") || "Funcionario";
    if (cargo !== "Gerente") {
        alert("❌ Apenas gerentes podem editar assistências!");
        return;
    }
    assistenciaIdEditando = idAssistencia; // CORREÇÃO: usar a variável correta
    const linha = botao.closest("tr");
    const celulaAcoes = linha.querySelector("td:last-child");

    console.log("=== DEBUG EDITAR ASSISTÊNCIA ===");
    console.log("ID da Assistência:", idAssistencia);
    console.log("Linha:", linha);
    console.log("Célula Ações:", celulaAcoes);

    // Recuperar dados das células da tabela
    const nomeCliente = linha.children[0].textContent;
    const telefoneCliente = linha.children[1].textContent;
    const marcaAparelho = linha.children[2].textContent;
    const modeloAparelho = linha.children[3].textContent;
    const formaPagamento = linha.children[4].textContent;
    const valorServico = linha.children[5].textContent.replace("R$ ", "");
    const custoServico = linha.children[6].textContent;

    console.log("Dados recuperados da tabela:", {
        nomeCliente,
        telefoneCliente,
        marcaAparelho,
        modeloAparelho,
        formaPagamento,
        valorServico,
        custoServico
    });

    // Preenche os campos básicos (CORRIGIDO: IDs atualizados)
    document.getElementById("edit-assistencia-nome").value = nomeCliente;
    document.getElementById("edit-assistencia-telefone").value = telefoneCliente;
    document.getElementById("edit-assistencia-marca").value = marcaAparelho;
    document.getElementById("edit-assistencia-modelo").value = modeloAparelho;
    document.getElementById("edit-assistencia-valor").value = parseFloat(valorServico) || "";

    // Recuperar dados dos atributos
    const telefoneData = celulaAcoes.getAttribute("data-telefone");
    const formaPagamentoData = celulaAcoes.getAttribute("data-pagamento");
    const garantiaData = celulaAcoes.getAttribute("data-garantia");
    const vendedorData = celulaAcoes.getAttribute("data-vendedor");

    console.log("Dados dos atributos:", {
        telefoneData,
        formaPagamentoData,
        garantiaData,
        vendedorData
    });

    // Preencher outros campos
    if (telefoneData && telefoneData !== 'null') {
        document.getElementById("edit-assistencia-telefone").value = telefoneData;
    }

    // Configurar forma de pagamento
    const selectPagamento = document.getElementById("edit-assistencia-pagamento");
    if (formaPagamentoData) {
        // Converter texto para valor (ex: "Dinheiro" -> "cash")
        const pagamentoMap = {
            'Dinheiro': 'cash',
            'Cartão': 'card',
            'Pix': 'pix',
            'Vale': 'voucher',
            'Dinheiro + Cartão': 'cash_card',
            'Dinheiro + Pix': 'cash_pix',
            'Cartão + Pix': 'card_pix'
        };
        selectPagamento.value = pagamentoMap[formaPagamentoData] || formaPagamentoData;
    } else {
        selectPagamento.value = "cash";
    }

    // Preencher custo
    const custo = celulaAcoes.getAttribute("data-custo");
    document.getElementById("edit-assistencia-custo").value = (custo && custo !== "-" && custo !== "R$ -") ? parseFloat(custo.replace("R$ ", "")) : "";

    // Preencher garantia
    const garantia = celulaAcoes.getAttribute("data-garantia");
    document.getElementById("edit-assistencia-garantia").value = garantia && garantia !== "null" ? garantia : "30";

    // Carregar e preencher vendedores
    carregarVendedores().then(() => {
        preencherSelectVendedoresAssistencia();

        // Seleciona o vendedor atual
        const selectVendedor = document.getElementById('edit-assistencia-vendedor');
        if (vendedorData && vendedorData !== '-') {
            selectVendedor.value = vendedorData;
        } else {
            // Se não tiver vendedor, usa o usuário logado como padrão
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser && listaVendedores.includes(loggedInUser)) {
                selectVendedor.value = loggedInUser;
            }
        }
    });

    // Buscar detalhes completos da assistência
    buscarDetalhesAssistenciaParaEdicao(idAssistencia);

    document.getElementById("modal-editar-assistencia").classList.remove("hidden");
}



// ============================
//  PREENCHER CHECKLIST NA EDIÇÃO
// ============================
function preencherChecklistEdicao(checklist) {
    console.log("Preenchendo checklist:", checklist);

    const mapeamentoChecklist = {
        'aparelho_liga': { name: 'liga', values: ['sim', 'nao'] },
        'tela_quebrada': { name: 'tela', values: ['sim', 'nao'] },
        'exibe_imagem': { name: 'imagen', values: ['sim', 'nao'] },
        'camera_funciona': { name: 'camera', values: ['sim', 'nao', 'impossivel'] },
        'wifi_bluetooth': { name: 'wifi', values: ['sim', 'nao', 'impossivel'] },
        'som_funciona': { name: 'som', values: ['sim', 'nao', 'impossivel'] },
        'botoes_funcionam': { name: 'botoes', values: ['sim', 'nao', 'impossivel'] },
        'dano_liquido': { name: 'oxidacao', values: ['sim', 'nao'] },
        'outra_assistencia': { name: 'outra_assistencia', values: ['sim', 'nao'] },
        'gaveta_sim': { name: 'gaveta_chip', values: ['sim', 'nao'] },
        'com_capinha': { name: 'capinha', values: ['sim', 'nao'] }
    };

    for (const [chave, config] of Object.entries(mapeamentoChecklist)) {
        const valor = checklist[chave];
        if (valor && config.values.includes(valor)) {
            const radio = document.querySelector(`input[name="${config.name}"][value="${valor}"]`);
            if (radio) {
                radio.checked = true;
                console.log(`Checklist ${chave}: ${valor} - marcado`);
            } else {
                console.warn(`Radio não encontrado: name=${config.name}, value=${valor}`);
            }
        }
    }
}

// ============================
//  PREENCHER VALORES DE PAGAMENTO NA EDIÇÃO
// ============================
function preencherValoresPagamentoEdicao(assistencia) {
    // Preencher valores específicos de pagamento se necessário
    const formaPagamento = assistencia.forma_pagamento;

    // Mostrar/ocultar campos de pagamento combinado
    const comboFields = document.getElementById('service2-payment-combo-fields');
    if (formaPagamento && formaPagamento.includes('_')) {
        comboFields.classList.remove('hidden');

        // Preencher valores baseados no tipo de pagamento
        switch (formaPagamento) {
            case 'cash_card':
                document.getElementById('service2-payment-part1').value = assistencia.valor_dinheiro || 0;
                document.getElementById('service2-payment-part2').value = assistencia.valor_cartao || 0;
                break;
            case 'cash_pix':
                document.getElementById('service2-payment-part1').value = assistencia.valor_dinheiro || 0;
                document.getElementById('service2-payment-part2').value = assistencia.valor_pix || 0;
                break;
            case 'card_pix':
                document.getElementById('service2-payment-part1').value = assistencia.valor_cartao || 0;
                document.getElementById('service2-payment-part2').value = assistencia.valor_pix || 0;
                break;
        }
    } else {
        comboFields.classList.add('hidden');
    }
}

// ============================
//  SALVAR EDIÇÃO ASSISTÊNCIA (CORRIGIDO)
// ============================
function salvarEdicaoAssistencia() {
    if (!assistenciaIdEditando) {
        alert("Erro: ID da assistência não identificado!");
        return;
    }

    const vendedorSelecionado = document.getElementById("edit-assistencia-vendedor").value;

    if (!vendedorSelecionado) {
        alert("Por favor, selecione um técnico.");
        return;
    }

    // Coletar dados do checklist
    const checklist = {
        aparelho_liga: document.querySelector('input[name="liga"]:checked')?.value || 'nao',
        tela_quebrada: document.querySelector('input[name="tela"]:checked')?.value || 'nao',
        exibe_imagem: document.querySelector('input[name="imagen"]:checked')?.value || 'nao',
        camera_funciona: document.querySelector('input[name="camera"]:checked')?.value || 'nao',
        wifi_bluetooth: document.querySelector('input[name="wifi"]:checked')?.value || 'nao',
        som_funciona: document.querySelector('input[name="som"]:checked')?.value || 'nao',
        botoes_funcionam: document.querySelector('input[name="botoes"]:checked')?.value || 'nao',
        dano_liquido: document.querySelector('input[name="oxidacao"]:checked')?.value || 'nao',
        outra_assistencia: document.querySelector('input[name="outra_assistencia"]:checked')?.value || 'nao',
        gaveta_sim: document.querySelector('input[name="gaveta_chip"]:checked')?.value || 'nao',
        com_capinha: document.querySelector('input[name="capinha"]:checked')?.value || 'nao'
    };

    const forma_pagamento = document.getElementById("edit-assistencia-pagamento").value;
    const valor_servico = parseFloat(document.getElementById("edit-assistencia-valor").value);

    // Calcular valores de pagamento
    let valor_dinheiro = 0, valor_cartao = 0, valor_pix = 0, valor_vale = 0;

    if (forma_pagamento === 'cash') {
        valor_dinheiro = valor_servico;
    } else if (forma_pagamento === 'card') {
        valor_cartao = valor_servico;
    } else if (forma_pagamento === 'pix') {
        valor_pix = valor_servico;
    } else if (forma_pagamento === 'voucher') {
        valor_vale = valor_servico;
    } else if (forma_pagamento === 'cash_card') {
        valor_dinheiro = parseFloat(document.getElementById('service2-payment-part1')?.value || 0);
        valor_cartao = parseFloat(document.getElementById('service2-payment-part2')?.value || 0);
    } else if (forma_pagamento === 'cash_pix') {
        valor_dinheiro = parseFloat(document.getElementById('service2-payment-part1')?.value || 0);
        valor_pix = parseFloat(document.getElementById('service2-payment-part2')?.value || 0);
    } else if (forma_pagamento === 'card_pix') {
        valor_cartao = parseFloat(document.getElementById('service2-payment-part1')?.value || 0);
        valor_pix = parseFloat(document.getElementById('service2-payment-part2')?.value || 0);
    }

    const dados = {
        nome_cliente: document.getElementById("edit-assistencia-nome").value,
        telefone_cliente: document.getElementById("edit-assistencia-telefone").value,
        marca_aparelho: document.getElementById("edit-assistencia-marca").value,
        modelo_aparelho: document.getElementById("edit-assistencia-modelo").value,
        descricao_defeito: document.getElementById("edit-assistencia-defeito").value,
        servico_realizar: document.getElementById("edit-assistencia-servico").value,
        valor_servico: valor_servico,
        forma_pagamento: forma_pagamento,
        valor_dinheiro: valor_dinheiro,
        valor_cartao: valor_cartao,
        valor_pix: valor_pix,
        valor_vale: valor_vale,
        periodo_garantia: document.getElementById("edit-assistencia-garantia").value,
        custo_servico: parseFloat(document.getElementById("edit-assistencia-custo").value) || null,
        nome_vendedor: vendedorSelecionado
    };

    console.log("Enviando dados para edição:", dados);

    fetch(`${API}/editar_assistencia/${assistenciaIdEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.mensagem || 'Erro na requisição'); });
            }
            return response.json();
        })
        .then(data => {
            alert(data.mensagem);
            fecharModalEditarAssistencia();
            carregarAssistencias(); // Recarregar a tabela
        })
        .catch(err => {
            console.error('Erro ao editar assistência:', err);
            alert('Erro ao editar assistência: ' + err.message);
        });
}

// ============================
//  FECHAR MODAL EDITAR ASSISTÊNCIA
// ============================
function fecharModalEditarAssistencia() {
    document.getElementById("modal-editar-assistencia").classList.add("hidden");
    assistenciaIdEditando = null; // Limpar o ID
}

// ============================
//  BUSCAR DETALHES ASSISTÊNCIA PARA EDIÇÃO (CORRETA)
// ============================
function buscarDetalhesAssistenciaParaEdicao(idAssistencia) {
    fetch(`${API}/obter_assistencias`)
        .then(response => response.json())
        .then(assistencias => {
            const assistencia = assistencias.find(a => a.id === idAssistencia);
            if (assistencia) {
                console.log("Detalhes completos da assistência para edição:", assistencia);

                // ✅ IDs corretos
                document.getElementById("edit-assistencia-defeito").value = assistencia.descricao_defeito || "";
                document.getElementById("edit-assistencia-servico").value = assistencia.servico_realizar || "";

                if (assistencia.checklist) {
                    preencherChecklistEdicao(assistencia.checklist);
                }

                preencherValoresPagamentoEdicao(assistencia);
            } else {
                console.error("Assistência não encontrada para edição:", idAssistencia);
                alert("Erro: Assistência não encontrada!");
            }
        })
        .catch(error => {

        });
}





function fecharModalDetalhesAssistencia() {
    document.getElementById("modal-detalhes-assistencia").classList.add("hidden");
}

// ============================
//  EXCLUIR ASSISTÊNCIA
// ============================
function confirmarExclusaoAssistencia(idAssistencia) {
    const cargo = localStorage.getItem("userRole") || "Funcionario";
    if (cargo !== "Gerente") {
        alert("❌ Apenas gerentes podem excluir assistências!");
        return;
    }
    if (!confirm("Tem certeza que deseja excluir esta assistência?")) return;

    fetch(`${API}/excluir_assistencia/${idAssistencia}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => {
            alert(data.mensagem);
            carregarAssistencias();
        })
        .catch(err => console.error('Erro ao excluir assistência:', err));
}

// ============================
//  FUNÇÕES AUXILIARES
// ============================
function traduzirPagamento(forma) {
    switch (forma) {
        case 'cash': return 'Dinheiro';
        case 'card': return 'Cartão';
        case 'pix': return 'Pix';
        case 'voucher': return 'Vale';
        case 'cash_card': return 'Dinheiro + Cartão';
        case 'cash_pix': return 'Dinheiro + Pix';
        case 'card_pix': return 'Cartão + Pix';
        default: return forma;
    }
}

function traduzirChecklist(chave) {
    const traducoes = {
        'aparelho_liga': 'Aparelho liga',
        'tela_quebrada': 'Tela quebrada',
        'exibe_imagem': 'Exibe imagem',
        'camera_funciona': 'Câmera funciona',
        'wifi_bluetooth': 'Wi-Fi/Bluetooth',
        'som_funciona': 'Som funciona',
        'botoes_funcionam': 'Botões funcionam',
        'dano_liquido': 'Dano por líquido',
        'outra_assistencia': 'Outra assistência',
        'gaveta_sim': 'Gaveta de SIM',
        'com_capinha': 'Com capinha'
    };
    return traducoes[chave] || chave;
}

// ============================
//  FUNÇÃO PARA CARREGAR VENDEDORES
// ============================
async function carregarVendedores() {
    try {
        const response = await fetch(`${API}/obter_vendedores`);
        const vendedores = await response.json();
        listaVendedores = vendedores; // ATRIBUINDO À VARIÁVEL GLOBAL EXISTENTE
        return vendedores;
    } catch (error) {
        console.error('Erro ao carregar vendedores:', error);
        return [];
    }
}

function preencherSelectVendedoresAssistencia() {
    const selectVendedor = document.getElementById('edit-assistencia-vendedor');
    if (!selectVendedor) return;

    selectVendedor.innerHTML = '';

    // Adiciona opção padrão
    const optionPadrao = document.createElement('option');
    optionPadrao.value = '';
    optionPadrao.textContent = 'Selecione um Vendedor';
    optionPadrao.disabled = true;
    selectVendedor.appendChild(optionPadrao);

    // Adiciona os vendedores
    listaVendedores.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor;
        option.textContent = vendedor;
        selectVendedor.appendChild(option);
    });
}

// ============================
//  INICIALIZAÇÃO
// ============================
document.addEventListener('DOMContentLoaded', function () {
    // Fechar modais ao clicar fora
    const modais = ['modal-detalhes-assistencia', 'modal-custo-assistencia', 'modal-editar-assistencia'];

    modais.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    switch (modalId) {
                        case 'modal-detalhes-assistencia':
                            fecharModalDetalhesAssistencia();
                            break;
                        case 'modal-custo-assistencia':
                            fecharModalCustoAssistencia();
                            break;
                        case 'modal-editar-assistencia':
                            fecharModalEditarAssistencia();
                            break;
                    }
                }
            });
        }
    });

    // Enter para salvar custo
    const inputCusto = document.getElementById('input-custo-assistencia');
    if (inputCusto) {
        inputCusto.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                salvarCustoAssistencia();
            }
        });
    }

    // Carregar assistências se estiver na página correta - MANTIDO ORIGINAL
    if (window.location.pathname.includes('tbassistencia.html')) {
        carregarAssistencias();
        carregarVendedores();

        // Inicializar vendedores no modal de assistência
        if (typeof inicializarVendedoresModal === 'function') {
            inicializarVendedoresModal('services-modal', 'vendedor-assistencia');
        }
    }
});

// ============================
//  ATUALIZAR TABELA DE ASSISTÊNCIAS (com bloqueio de edição/exclusão para funcionários)
// ============================
function atualizarTabelaAssistencia(assistencias) {
    const tabela = document.getElementById('assistencia-table');
    if (!tabela) {
        console.error("Tabela de assistências não encontrada!");
        return;
    }

    tabela.innerHTML = '';

    // 🟩 Verifica o cargo do usuário logado
    const cargo = localStorage.getItem("userRole") || "Funcionario";

    assistencias.forEach(assist => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';

        // Permissões
        const podeEditar = (cargo === "Gerente");
        const podeExcluir = (cargo === "Gerente");

        const botoes = `
            <button onclick="abrirModalDetalhesAssistencia(this, ${assist.id})"
                class="px-3 py-1 rounded border border-green-500 bg-green-100 text-green-800 font-semibold hover:bg-green-200 transition text-sm">
                Ver Detalhes
            </button>

            <button onclick="${podeEditar ? `abrirModalEditarAssistencia(this, ${assist.id})` : `alert('❌ Apenas gerentes podem editar assistências!')`}"
                class="px-3 py-1 rounded border border-blue-500 ${podeEditar ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} font-semibold transition text-sm">
                Editar
            </button>

            <button onclick="${podeExcluir ? `confirmarExclusaoAssistencia(this, ${assist.id})` : `alert('❌ Apenas gerentes podem excluir assistências!')`}"
                class="px-3 py-1 rounded border border-red-500 ${podeExcluir ? 'bg-red-100 hover:bg-red-200 text-red-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} font-semibold transition text-sm">
                Excluir
            </button>
        `;

        tr.innerHTML = `
            <td class="px-4 py-3 whitespace-nowrap">${assist.nome_cliente || '-'}</td>
            <td class="px-4 py-3 whitespace-nowrap">${assist.descricao_defeito || '-'}</td>
            <td class="px-4 py-3 whitespace-nowrap">${assist.servico_realizado || '-'}</td>
            <td class="px-4 py-3 whitespace-nowrap">R$ ${parseFloat(assist.valor_servico || 0).toFixed(2)}</td>
            <td class="px-4 py-3 whitespace-nowrap">${assist.nome_vendedor || '-'}</td>
            <td class="px-4 py-3 space-x-2 whitespace-nowrap">
                ${botoes}
            </td>
        `;

        tabela.appendChild(tr);
    });
}





// ============================
//  FUNÇÃO TOGGLE FILTROS - ASSISTÊNCIAS
// ============================
function toggleFiltros(tipo) {
    const painel = document.getElementById(`painel-filtros-${tipo}`);
    const icon = document.getElementById(`icon-filtro-${tipo}`);

    if (!painel || !icon) {
        console.error(`Elementos do filtro ${tipo} não encontrados!`);
        return;
    }

    if (painel.classList.contains('hidden')) {
        painel.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        painel.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
}

// ============================
//  FUNÇÕES DE FILTRO - ASSISTÊNCIAS
// ============================

// Função para aplicar filtros nas assistências
function aplicarFiltrosAssistencias() {
    console.log("Aplicando filtros de assistências...");

    const filtroData = document.getElementById('filtro-data-assistencias').value;
    const filtroNome = document.getElementById('filtro-nome-assistencias').value.toLowerCase();
    const filtroVendedor = document.getElementById('filtro-vendedor-assistencias').value;
    const filtroStatus = document.getElementById('filtro-status-assistencias').value;

    filtrosAtivosAssistencias = {
        data: filtroData,
        nome: filtroNome,
        vendedor: filtroVendedor,
        status: filtroStatus
    };

    console.log("Filtros ativos assistências:", filtrosAtivosAssistencias);
    filtrarETableAssistencias();
}

// Função para filtrar e atualizar a tabela de assistências
function filtrarETableAssistencias() {
    console.log("Filtrando tabela de assistências...");
    console.log("todasAssistencias length:", todasAssistencias.length);

    if (!todasAssistencias || todasAssistencias.length === 0) {
        console.log("Nenhuma assistência carregada ainda. Carregando assistências...");
        carregarAssistencias();
        return;
    }

    const assistenciasFiltradas = todasAssistencias.filter(assistencia => {
        // Filtro por data
        if (filtrosAtivosAssistencias.data) {
            const dataAssistencia = assistencia.data_cadastro ? assistencia.data_cadastro.split(' ')[0] : '';
            console.log("Comparando data:", dataAssistencia, "com filtro:", filtrosAtivosAssistencias.data);
            if (dataAssistencia !== filtrosAtivosAssistencias.data) {
                return false;
            }
        }

        // Filtro por nome do cliente
        if (filtrosAtivosAssistencias.nome) {
            const nomeCliente = assistencia.nome_cliente ? assistencia.nome_cliente.toLowerCase() : '';
            if (!nomeCliente.includes(filtrosAtivosAssistencias.nome)) {
                return false;
            }
        }

        // Filtro por vendedor/técnico
        if (filtrosAtivosAssistencias.vendedor) {
            const vendedor = assistencia.nome_vendedor || '';
            if (vendedor !== filtrosAtivosAssistencias.vendedor) {
                return false;
            }
        }

        // Filtro por status (pendente/concluído)
        if (filtrosAtivosAssistencias.status) {
            const isPendente = assistencia.custo_servico === '-' || assistencia.custo_servico === null || assistencia.custo_servico === '' || assistencia.status === 'pendente';


            if (filtrosAtivosAssistencias.status === 'pendente' && !isPendente) {
                return false;
            }
            if (filtrosAtivosAssistencias.status === 'concluido' && isPendente) {
                return false;
            }
        }

        return true;
    });

    console.log("Assistências filtradas:", assistenciasFiltradas.length);
    atualizarTabelaAssistencias(assistenciasFiltradas);
    atualizarFiltrosAtivosUI('assistencias');
}

// Função para limpar filtros de assistências
function limparFiltrosAssistencias() {
    document.getElementById('filtro-data-assistencias').value = '';
    document.getElementById('filtro-nome-assistencias').value = '';
    document.getElementById('filtro-vendedor-assistencias').value = '';
    document.getElementById('filtro-status-assistencias').value = '';

    filtrosAtivosAssistencias = {
        data: '',
        nome: '',
        vendedor: '',
        status: ''
    };

    filtrarETableAssistencias();
}

// No final do arquivo assistencia.js, adicione:
document.addEventListener('DOMContentLoaded', function () {
    // Inicializar vendedores no modal de assistência
    if (typeof inicializarVendedoresModal === 'function') {
        inicializarVendedoresModal('services-modal', 'vendedor-assistencia');
    }
});