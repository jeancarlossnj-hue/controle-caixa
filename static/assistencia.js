
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

        dadosAssistencia.checklist = checklist;


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

        const response = await fetch(`${API}/registrar_assistencia`, {
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
// ===============================================
// 🟢 Carregar Assistências (corrigido e responsivo)
// ===============================================
// ===============================================
// 🟢 Carregar Assistências (corrigido e otimizado)
// ===============================================
function carregarAssistencias() {
    fetch(`${API}/obter_assistencias`)
        .then(res => res.json())
        .then(assistencias => {
            const tabela = document.getElementById("assistencias-table");
            tabela.innerHTML = "";

            assistencias.forEach(a => {
                // ==========================
                // 💰 Formatação de custo
                // ==========================
                let custoNum = 0;
                if (a.custo_servico != null && a.custo_servico !== "") {
                    custoNum = parseFloat(a.custo_servico);
                } else if (a.custo != null && a.custo !== "") {
                    custoNum = parseFloat(a.custo);
                } else if (a.custo_bruto != null && a.custo_bruto !== "") {
                    custoNum = parseFloat(a.custo_bruto);
                }

                const custoHTML = (!isNaN(custoNum) && custoNum > 0)
                    ? `<span class="inline-flex items-center justify-end gap-1 font-mono tabular-nums">
                           <span>R$</span><span>${custoNum.toFixed(2)}</span>
                       </span>`
                    : "-";

                // ==========================
                // 💵 Formatação de valor
                // ==========================
                const valorNum = parseFloat(a.valor_servico) || 0;
                const valorHTML = (a.valor_servico != null && !isNaN(valorNum) && valorNum > 0)
                    ? `<span class="inline-flex items-center justify-end gap-1 font-mono tabular-nums">
                           <span>R$</span><span>${valorNum.toFixed(2)}</span>
                       </span>`
                    : "-";

                // ==========================
                // ⚙️ Status visual
                // ==========================
                const statusPendente = (!a.custo_servico || a.custo_servico === 0 || a.status === "pendente");
                const statusHTML = statusPendente
                    ? `<button onclick="abrirModalCustoAssistencia(${a.id})"
                          class="bg-yellow-100 text-yellow-800 border border-yellow-400 px-2 py-1 rounded font-semibold hover:bg-yellow-200 transition">
                          ⚠️ Pendente
                       </button>`
                    : `<span class="bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">✅ Concluído</span>`;

                // ==========================
                // 🧾 Criar linha da tabela
                // ==========================
                const tr = document.createElement("tr");
                tr.className = "hover:bg-gray-50 text-xs sm:text-sm";
                tr.innerHTML = `
                    <td class="px-3 sm:px-4 py-2">${a.nome_cliente || "-"}</td>
                    <td class="px-3 sm:px-4 py-2">${a.marca_aparelho || "-"}</td>
                    <td class="px-3 sm:px-4 py-2">${a.modelo_aparelho || "-"}</td>
                    <td class="px-3 sm:px-4 py-2">${a.servico_realizado || "-"}</td>
                    <td class="px-3 sm:px-4 py-2">${traduzirPagamento(a.forma_pagamento)}</td>
                    <td class="px-3 sm:px-4 py-2 text-right align-middle">${valorHTML}</td>
                    <td class="px-3 sm:px-4 py-2 text-right align-middle">${custoHTML}</td>
                    <td class="px-3 sm:px-4 py-2">${a.nome_vendedor || "-"}</td>
                    <td class="px-3 sm:px-4 py-2 text-center">${statusHTML}</td>

                    <!-- 🔘 Botões de ação -->
                    <td class="flex flex-col sm:flex-row gap-2 justify-center items-center py-2 sm:py-0 text-center"
                        data-telefone="${a.telefone_cliente || ''}"
                        data-pagamento="${a.forma_pagamento || 'cash'}"
                        data-garantia="${a.garantia || 30}"
                        data-vendedor="${a.nome_vendedor || ''}"
                        data-data-cadastro="${a.data_registro || new Date().toISOString()}">
                        
                        <!-- 📘 Detalhes -->
                        <button onclick="abrirModalDetalhesAssistencia(this)"
                                class="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm px-3 py-2 rounded transition flex items-center justify-center gap-1">
                            <i class="fas fa-info-circle"></i>
                            <span class="hidden sm:inline">Detalhes</span>
                        </button>

                        <!-- ✏️ Editar -->
                        <button onclick="editarAssistencia(${a.id})"
                                class="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm px-3 py-2 rounded transition flex items-center justify-center gap-1">
                            <i class="fas fa-edit"></i>
                            <span class="hidden sm:inline">Editar</span>
                        </button>

                        <!-- 🗑️ Excluir -->
                        <button onclick="excluirAssistencia(${a.id})"
                                class="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm px-3 py-2 rounded transition flex items-center justify-center gap-1">
                            <i class="fas fa-trash-alt"></i>
                            <span class="hidden sm:inline">Excluir</span>
                        </button>
                    </td>
                `;

                tabela.appendChild(tr);
            });
        })
        .catch(err => console.error("❌ Erro ao carregar assistências:", err));
}



// ============================
//  MODAL DETALHES ASSISTÊNCIA - PADRÃO VENDAS
// ============================
function verDetalhesAssistencia(botao) {
    const celula = botao.closest("td");
    if (!celula) return alert("❌ Erro: célula não encontrada!");

    const nome = celula.getAttribute("data-cliente");
    const marca = celula.getAttribute("data-marca");
    const modelo = celula.getAttribute("data-modelo");
    const servico = celula.getAttribute("data-servico");
    const forma = celula.getAttribute("data-forma");
    const valor = celula.getAttribute("data-valor");
    const custo = celula.getAttribute("data-custo");
    const vendedor = celula.getAttribute("data-vendedor");
    const status = celula.getAttribute("data-status");
    const dataRegistro = celula.getAttribute("data-data");

    // Calcula lucro
    let lucroHTML = "";
    if (custo && custo !== "-" && custo !== "R$ -") {
        const valorNum = parseFloat(valor.replace("R$", "").trim()) || 0;
        const custoNum = parseFloat(custo.replace("R$", "").trim()) || 0;
        const lucro = valorNum - custoNum;
        const margem = valorNum > 0 ? ((lucro / valorNum) * 100).toFixed(1) : "0.0";
        lucroHTML = `
        <div class="text-center p-3 bg-green-50 rounded">
            <div class="font-semibold text-green-800">Lucro Total</div>
            <div class="text-lg font-bold">R$ ${lucro.toFixed(2)}</div>
            <div class="text-sm text-green-600">Margem: ${margem}%</div>
        </div>`;
    }

    // Encontra o container correto do modal
    const detalhesDiv = document.getElementById("detalhes-assistencia-content");
    if (!detalhesDiv) {
        alert("❌ Erro: elemento #detalhes-assistencia-content não encontrado!");
        return;
    }

    // Monta o HTML completo
    detalhesDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="space-y-2">
                <h3 class="font-semibold text-gray-800 text-lg border-b pb-2">Informações do Cliente</h3>
                <div><strong>Cliente:</strong> ${nome}</div>
                <div><strong>Marca:</strong> ${marca}</div>
                <div><strong>Modelo:</strong> ${modelo}</div>
                <div><strong>Vendedor/Técnico:</strong> ${vendedor}</div>
                <div><strong>Data:</strong> ${dataRegistro || '-'}</div>
                <div><strong>Status:</strong>
                    <span class="px-2 py-1 rounded text-xs font-medium ${status.includes('pendente') ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}">${status}</span>
                </div>
            </div>
            <div class="space-y-2">
                <h3 class="font-semibold text-gray-800 text-lg border-b pb-2">Serviço e Pagamento</h3>
                <div><strong>Serviço:</strong> ${servico}</div>
                <div><strong>Forma de Pagamento:</strong> ${forma}</div>
                <div><strong>Valor:</strong> ${valor}</div>
                <div><strong>Custo:</strong> ${custo}</div>
            </div>
        </div>

        <div class="border-t pt-4">
            <h3 class="font-semibold text-gray-800 text-lg mb-2">Resumo Financeiro</h3>
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
                    </div>`}
            </div>
        </div>
    `;

    document.getElementById("modal-detalhes-assistencia").classList.remove("hidden");
}


// Fechar modal
function fecharModalDetalhesAssistencia() {
    const m = document.getElementById("modal-detalhes-assistencia");
    if (m) m.classList.add("hidden");
}






function salvarCustoAssistencia() {
    const custo = document.getElementById("input-custo-assistencia").value;
    if (!custo || custo <= 0) {
        alert("Informe um custo válido.");
        return;
    }

    fetch(`${API}/atualizar_custo_assistencia/${assistenciaIdAtual}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ custo_servico: parseFloat(custo) })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.mensagem);
            fecharModalCustoAssistencia();
            carregarAssistencias();
        })
        .catch(err => console.error("Erro ao salvar custo:", err));
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



// === MODAL DETALHES ASSISTÊNCIA (espelho do de vendas) ===
function abrirModalDetalhesAssistencia(botao) {
    const linha = botao.closest("tr");
    const celulaAcoes = linha.querySelector("td:last-child");

    // Colunas (mantive a mesma ordem do HTML da tabela de assistência)
    const nome = linha.children[0]?.textContent || '-';
    const marca = linha.children[1]?.textContent || '-';
    const modelo = linha.children[2]?.textContent || '-';
    const servico = linha.children[3]?.textContent || '-';
    const pagamentoBruto = linha.children[4]?.textContent || '-';
    const valor = linha.children[5]?.textContent || '-';
    const custo = linha.children[6]?.textContent || '-';
    const vendedor = linha.children[7]?.textContent || '-';
    const status = (linha.children[8]?.textContent || '-').trim();

    // Atributos extras na última célula (padronize estes nomes ao montar a tabela)
    const telefone = celulaAcoes?.getAttribute("data-telefone") || '';
    const formaPagamento = celulaAcoes?.getAttribute("data-pagamento") || '';
    const garantiaDias = celulaAcoes?.getAttribute("data-garantia") || '';
    const vendedorData = celulaAcoes?.getAttribute("data-vendedor") || '';
    const dataCadastro = celulaAcoes?.getAttribute("data-data-cadastro") || '';

    // === Data/Hora (mesma lógica de vendas) ===
    let dataCadastroFormatada = 'Não informada';
    let horaCadastroFormatada = 'Não informada';
    let dataValidadeGarantia = 'Não calculável';

    if (dataCadastro && dataCadastro !== 'null' && dataCadastro !== 'undefined' && dataCadastro !== '-') {
        try {
            const d = new Date(dataCadastro);
            if (!isNaN(d.getTime())) {
                dataCadastroFormatada = d.toLocaleDateString('pt-BR');
                horaCadastroFormatada = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                if (garantiaDias && garantiaDias !== 'null' && garantiaDias !== 'undefined' && garantiaDias !== '') {
                    const dias = parseInt(garantiaDias);
                    if (!isNaN(dias) && dias > 0) {
                        const validade = new Date(d);
                        validade.setDate(validade.getDate() + dias);
                        dataValidadeGarantia = validade.toLocaleDateString('pt-BR');
                    }
                }
            }
        } catch (e) { console.error(e); }
    }

    // === Garantia (mesma montagem de texto) ===
    let garantiaTexto = 'Não informada';
    if (garantiaDias && garantiaDias !== 'null' && garantiaDias !== 'undefined' && garantiaDias !== '') {
        const dias = parseInt(garantiaDias);
        if (!isNaN(dias) && dias > 0) {
            garantiaTexto = `${dias} dias${dataValidadeGarantia !== 'Não calculável' ? ` (Válida até: ${dataValidadeGarantia})` : ''}`;
        }
    }

    // === Lucro (igual ao de vendas) ===
    let lucroHTML = '';
    if (custo !== '-' && custo !== '' && custo !== 'R$ -') {
        const v = parseFloat((valor || '').replace('R$', '').replace(/\s/g, '').replace(',', '.')) || 0;
        const c = parseFloat((custo || '').replace('R$', '').replace(/\s/g, '').replace(',', '.')) || 0;
        const lucro = v - c;
        const margem = v > 0 ? ((lucro / v) * 100).toFixed(1) : '0.0';
        const lucroFmt = lucro.toFixed(2);
        lucroHTML = `
      <div class="text-center p-3 bg-green-50 rounded">
        <div class="font-semibold text-green-800">Lucro Total</div>
        <div class="text-lg font-bold">R$ ${lucroFmt}</div>
        <div class="text-sm text-green-600">Margem: ${margem}%</div>
      </div>`;
    }

    // === Tradução do pagamento (igual ao de vendas)
    const pagamento = traduzirPagamento(formaPagamento || pagamentoBruto);

    // === Montagem do HTML (idêntico ao de vendas, com campos de assistência)
    const detalhesDiv = document.getElementById("detalhes-assistencia-content");
    if (!detalhesDiv) { alert("Erro interno: container de detalhes não encontrado."); return; }

    detalhesDiv.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Coluna 1 -->
      <div class="space-y-3">
        <div class="border-b pb-2">
          <h3 class="font-semibold text-gray-800 text-lg">Informações do Cliente</h3>
        </div>
        <div class="flex justify-between"><span class="font-medium">Nome:</span><span>${nome}</span></div>
        <div class="flex justify-between"><span class="font-medium">Telefone:</span><span>${telefone || 'Não informado'}</span></div>
        <div class="flex justify-between"><span class="font-medium">Vendedor/Técnico:</span><span>${vendedorData || vendedor || '-'}</span></div>
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
        <div class="flex justify-between"><span class="font-medium">Modelo:</span><span class="text-right">${modelo}</span></div>
        <div class="flex justify-between"><span class="font-medium">Serviço:</span><span class="text-right">${servico}</span></div>
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
          </div>`}
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
        ${(formaPagamento && formaPagamento.includes('_')) ? `
          <div class="mt-2 text-sm text-gray-600">
            <p>Pagamento dividido em duas formas</p>
          </div>` : ''}
      </div>
    </div>

    <!-- Botão Imprimir Cupom -->
    <div class="border-t pt-4 mt-6">
      <div class="flex justify-center">
        <button onclick="imprimirCupomAssistencia(this)"
                class="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
          <i class="fas fa-print"></i>
          Imprimir Cupom
        </button>
      </div>
    </div>
  `;

    // Guarda dados para o PDF (chaves paralelas às de vendas)
    detalhesDiv.setAttribute('data-assistencia-detalhes', JSON.stringify({
        nome_cliente: nome,
        telefone_cliente: telefone || '',
        marca_aparelho: marca,
        modelo_aparelho: modelo,
        servico_realizado: servico,
        valor_servico: (valor || '').replace('R$ ', ''),
        forma_pagamento: formaPagamento || 'cash',
        garantia: garantiaDias || '30',
        nome_vendedor: vendedorData || vendedor || '',
        data_cadastro: dataCadastro
    }));

    document.getElementById("modal-detalhes-assistencia").classList.remove("hidden");
}





// ============================
//  IMPRIMIR CUPOM ASSISTÊNCIA - DETALHES
// ============================
function imprimirCupomAssistencia() {
    const div = document.getElementById("detalhes-assistencia-content");
    const raw = div?.getAttribute('data-assistencia-detalhes');
    if (!raw) return alert('Erro: dados da assistência não encontrados.');
    const dados = JSON.parse(raw);

    if (window.pdfGenerator && window.pdfGenerator.abrirModalAssistencia) {
        window.pdfGenerator.abrirModalAssistencia(dados, (res) => console.log("PDF assistência:", res));
    } else {
        alert('Gerador de PDF não disponível. Recarregue a página.');
    }
}




// ============================
//  MODAL CUSTO ASSISTÊNCIA
// ============================
// Abrir modal já guardando o id
function abrirModalCustoAssistencia(id) {
    assistenciaIdAtual = id;
    const modal = document.getElementById("modal-custo-assistencia");
    const input = document.getElementById("input-custo-assistencia");
    if (input) input.value = "";
    if (modal) modal.classList.remove("hidden");
}

function fecharModalCustoAssistencia() {
    const modal = document.getElementById("modal-custo-assistencia");
    if (modal) modal.classList.add("hidden");
}

// Salvar custo com tratamento de respostas não-JSON (evita "Unexpected token <")
async function salvarCustoAssistencia() {
    try {
        if (!assistenciaIdAtual) {
            alert("ID da assistência não encontrado. Abra o modal novamente.");
            return;
        }
        const input = document.getElementById("input-custo-assistencia");
        const custo = parseFloat(input?.value || "0");
        if (isNaN(custo)) {
            alert("Informe um custo válido.");
            return;
        }

        const resp = await fetch(`${API}/atualizar_custo_assistencia/${assistenciaIdAtual}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ custo_servico: custo })
        });

        const texto = await resp.text();
        let data;
        try { data = JSON.parse(texto); } catch { data = null; }

        if (!resp.ok) {
            throw new Error(data?.mensagem || texto || "Falha ao salvar custo.");
        }

        fecharModalCustoAssistencia();
        // recarrega a tabela para atualizar status/lucro
        carregarAssistencias();
    } catch (err) {
        console.error("Erro ao salvar custo:", err);
        alert("❌ Não foi possível salvar o custo. Detalhe: " + err.message);
    }
}



function fecharModalCustoAssistencia() {
    document.getElementById("modal-custo-assistencia").classList.add("hidden");
}




// ============================
// 💾 SALVAR EDIÇÃO (substitui o registro caso esteja em modo edição)
// ============================
document.getElementById('services-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const editId = e.target.getAttribute('data-edit-id');

    const dados = {
        nome_cliente: document.getElementById('service-customer-name').value,
        telefone_cliente: document.getElementById('service-customer-phone').value,
        marca_aparelho: document.getElementById('device-model').value,
        modelo_aparelho: document.getElementById('device-brand').value,
        descricao_defeito: document.getElementById('defect-description').value,
        servico_realizado: document.getElementById('service-description').value,
        valor_servico: parseFloat(document.getElementById('service-value').value) || 0,
        forma_pagamento: document.getElementById('service2-payment-method').value,
        garantia: document.querySelector('input[name="service-warranty"]:checked')?.value || '30',
        nome_vendedor: document.getElementById('vendedor-assistencia').value
    };

    if (editId) {
        fetch(`${API}/editar_assistencia/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
            .then(res => res.json())
            .then(data => {
                alert("✅ " + (data.mensagem || "Assistência atualizada com sucesso!"));
                e.target.removeAttribute('data-edit-id');
                e.target.reset();
                carregarAssistencias();
            })
            .catch(err => {
                console.error("Erro ao editar:", err);
                alert("❌ Falha ao atualizar assistência.");
            });
    } else {
        registrarAssistencia(); // mantém o fluxo normal de cadastro
    }
});

// ============================
// 🗑️ EXCLUIR ASSISTÊNCIA
// ============================
function excluirAssistencia(id) {
    if (!confirm("🗑️ Deseja realmente excluir esta assistência?")) return;
    fetch(`${API}/excluir_assistencia/${id}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            alert("✅ " + data.mensagem);
            carregarAssistencias();
        })
        .catch(err => {
            console.error("Erro ao excluir:", err);
            alert("❌ Erro ao excluir assistência.");
        });
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
    document.getElementById('modal-editar-assistencia').classList.add('hidden');
}

function salvarEdicaoAssistencia() {
    const id = document.getElementById('modal-editar-assistencia').getAttribute('data-edit-id');
    if (!id) return alert("❌ ID da assistência não encontrado.");

    const dados = {
        nome_cliente: document.getElementById('edit-assistencia-nome').value.trim(),
        telefone_cliente: document.getElementById('edit-assistencia-telefone').value.trim(),
        marca_aparelho: document.getElementById('edit-assistencia-marca').value.trim(),
        modelo_aparelho: document.getElementById('edit-assistencia-modelo').value.trim(),
        descricao_defeito: document.getElementById('edit-assistencia-defeito').value.trim(),
        servico_realizado: document.getElementById('edit-assistencia-servico').value.trim(),
        valor_servico: parseFloat(document.getElementById('edit-assistencia-valor').value) || 0,
        forma_pagamento: document.getElementById('edit-assistencia-pagamento').value,
        garantia: document.getElementById('edit-assistencia-garantia').value,
        custo_servico: parseFloat(document.getElementById('edit-assistencia-custo').value) || 0,
        nome_vendedor: document.getElementById('edit-assistencia-vendedor').value
    };

    fetch(`${API}/editar_assistencia/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(res => res.json())
        .then(data => {
            alert("✅ Assistência atualizada com sucesso!");
            fecharModalEditarAssistencia();
            carregarAssistencias();
        })
        .catch(err => {
            console.error("Erro ao salvar edição:", err);
            alert("❌ Erro ao salvar edição.");
        });
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

// === TRADUZ PAGAMENTO (igual ao de vendas) ===
function traduzirPagamento(forma) {
    const map = {
        cash: "Dinheiro",
        card: "Cartão",
        pix: "Pix",
        voucher: "Vale",
        cash_card: "Dinheiro + Cartão",
        cash_pix: "Dinheiro + Pix",
        card_pix: "Cartão + Pix"
    };
    return map[forma] || forma || "-";
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


// ===============================================
// 🟣 ABRIR MODAL EDITAR ASSISTÊNCIA - CORRIGIDO
// ===============================================
async function editarAssistencia(id) {
    try {
        // 1) Busca a assistência
        const res = await fetch(`${API}/obter_assistencias`);
        const lista = await res.json();
        const a = lista.find(x => x.id === id);
        if (!a) return alert("❌ Assistência não encontrada.");

        // 2) Garante que o select de vendedores está populado
        if (typeof carregarVendedores === "function" && typeof preencherSelectVendedores === "function") {
            const vendedores = await carregarVendedores();
            preencherSelectVendedores("edit-assistencia-vendedor", a.nome_vendedor || "");
        }

        // 3) Preenche os campos do modal de edição
        document.getElementById('edit-assistencia-nome').value = a.nome_cliente || '';
        document.getElementById('edit-assistencia-telefone').value = a.telefone_cliente || '';
        document.getElementById('edit-assistencia-marca').value = a.marca_aparelho || '';
        document.getElementById('edit-assistencia-modelo').value = a.modelo_aparelho || '';
        document.getElementById('edit-assistencia-defeito').value = a.descricao_defeito || '';
        document.getElementById('edit-assistencia-servico').value = a.servico_realizado || '';
        document.getElementById('edit-assistencia-valor').value = a.valor_servico || '';
        document.getElementById('edit-assistencia-pagamento').value = a.forma_pagamento || 'cash';
        document.getElementById('edit-assistencia-garantia').value = a.garantia || '30';
        document.getElementById('edit-assistencia-custo').value = a.custo_servico ?? '';

        // 4) Guarda o ID no modal para o salvar
        const modal = document.getElementById('modal-editar-assistencia');
        modal?.setAttribute('data-edit-id', String(id));
        modal?.classList.remove('hidden');
    } catch (err) {
        console.error("Erro ao carregar assistência:", err);
        alert("❌ Erro ao carregar dados da assistência.");
    }
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