


// ============================
//  MODAL DETALHES VENDA - ATUALIZADO COM BOTÃO IMPRIMIR
// ============================
function abrirModalDetalhes(botao) {
    const linha = botao.closest("tr");
    const celulaAcoes = linha.querySelector("td:last-child");

    const nome = linha.children[0].textContent;
    const descricao = linha.children[1].textContent;
    const pagamento = linha.children[2].textContent;
    const valor = linha.children[3].textContent;
    const custo = linha.children[4].textContent;
    const vendedor = linha.children[5].textContent;
    const status = linha.children[6].textContent.trim();

    const telefone = celulaAcoes.getAttribute("data-telefone");
    const formaPagamento = celulaAcoes.getAttribute("data-pagamento");
    const garantiaDias = celulaAcoes.getAttribute("data-garantia");
    const vendedorData = celulaAcoes.getAttribute("data-vendedor");
    const dataCompra = celulaAcoes.getAttribute("data-data-compra");

    // Formatar data e hora da compra
    let dataCompraFormatada = 'Não informada';
    let horaCompraFormatada = 'Não informada';
    let dataValidadeGarantia = 'Não calculável';

    if (dataCompra && dataCompra !== 'null' && dataCompra !== 'undefined' && dataCompra !== '' && dataCompra !== '-') {
        try {
            const data = new Date(dataCompra);
            
            if (!isNaN(data.getTime())) {
                dataCompraFormatada = data.toLocaleDateString('pt-BR');
                horaCompraFormatada = data.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                // Calcular validade da garantia se houver dias de garantia
                if (garantiaDias && garantiaDias !== 'null' && garantiaDias !== 'undefined' && garantiaDias !== '') {
                    const dias = parseInt(garantiaDias);
                    
                    if (!isNaN(dias) && dias > 0) {
                        const dataValidade = new Date(data);
                        dataValidade.setDate(dataValidade.getDate() + dias);
                        dataValidadeGarantia = dataValidade.toLocaleDateString('pt-BR');
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

    const detalhesDiv = document.getElementById("detalhes-venda-content");
    detalhesDiv.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Coluna 1 -->
            <div class="space-y-3">
                <div class="border-b pb-2">
                    <h3 class="font-semibold text-gray-800 text-lg">Informações do Cliente</h3>
                </div>
                <div class="flex justify-between"><span class="font-medium">Nome:</span><span>${nome}</span></div>
                <div class="flex justify-between"><span class="font-medium">Telefone:</span><span>${telefone || 'Não informado'}</span></div>
                <div class="flex justify-between"><span class="font-medium">Vendedor:</span><span>${vendedorData || vendedor || '-'}</span></div>
                <div class="flex justify-between"><span class="font-medium">Data da Compra:</span><span>${dataCompraFormatada}</span></div>
                <div class="flex justify-between"><span class="font-medium">Hora da Compra:</span><span>${horaCompraFormatada}</span></div>
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
                    <h3 class="font-semibold text-gray-800 text-lg">Informações do Produto</h3>
                </div>
                <div class="flex justify-between"><span class="font-medium">Descrição:</span><span class="text-right">${descricao}</span></div>
                <div class="flex justify-between"><span class="font-medium">Forma de Pagamento:</span><span>${pagamento}</span></div>
                <div class="flex justify-between"><span class="font-medium">Garantia:</span><span>${garantiaTexto}</span></div>
            </div>
        </div>
        
        <!-- Financeiro -->
        <div class="border-t pt-4 mb-6">
            <h3 class="font-semibold text-gray-800 text-lg mb-3">Informações Financeiras</h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="text-center p-3 bg-blue-50 rounded">
                    <div class="font-semibold text-blue-800">Valor da Venda</div>
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
                <button onclick="imprimirCupomVenda(this)" 
                        class="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <i class="fas fa-print"></i>
                    Imprimir Cupom
                </button>
            </div>
        </div>
    `;

    // Armazenar dados para uso no PDF
    detalhesDiv.setAttribute('data-venda-detalhes', JSON.stringify({
        nome_cliente: nome,
        telefone_cliente: telefone || '',
        descricao_produto: descricao,
        valor_total: valor.replace('R$ ', ''),
        forma_pagamento: formaPagamento || 'cash',
        garantia: garantiaDias || '30',
        nome_vendedor: vendedorData || vendedor || '',
        data_venda: dataCompra
    }));

    document.getElementById("modal-detalhes-venda").classList.remove("hidden");
}



// ============================
//  IMPRIMIR CUPOM VENDA - DETALHES (VERSÃO TOLERANTE)
// ============================
function imprimirCupomVenda(botao) {
    console.log("🖨️ Tentando imprimir cupom de venda...");
    
    const detalhesDiv = document.getElementById("detalhes-venda-content");
    const dadosString = detalhesDiv.getAttribute('data-venda-detalhes');
    
    if (!dadosString) {
        alert('Erro: Dados da venda não encontrados.');
        return;
    }

    try {
        const dadosVenda = JSON.parse(dadosString);
        dadosVenda.valor_total = parseFloat(dadosVenda.valor_total.replace('R$', '').replace(/\s/g, '').trim());
        
        console.log("📊 Dados da venda:", dadosVenda);
        console.log("🔍 Verificando PDF Generator:", {
            pdfGenerator: !!window.pdfGenerator,
            abrirModalCupom: !!(window.pdfGenerator && window.pdfGenerator.abrirModalCupom),
            jspdf: typeof jspdf,
            jsPDF: typeof jsPDF,
            html2canvas: typeof html2canvas
        });

        // Tentar usar o PDF Generator
        if (window.pdfGenerator && window.pdfGenerator.abrirModalCupom) {
            console.log("✅ PDF Generator disponível, gerando PDF...");
            window.pdfGenerator.abrirModalCupom(dadosVenda, 'venda', (resultado) => {
                console.log("📄 PDF finalizado:", resultado);
            });
        } else {
            // Se não estiver disponível, tentar carregar novamente
            console.warn("⚠️ PDF Generator não disponível, tentando recarregar...");
            
            // Verificar se podemos carregar as bibliotecas manualmente
            if (typeof jsPDF === 'undefined') {
                console.log("📥 jsPDF não carregado, tentando carregar...");
                carregarBiblioteca('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', function() {
                    console.log("✅ jsPDF carregado, tentando novamente...");
                    setTimeout(() => imprimirCupomVenda(botao), 1000);
                });
                return;
            }
            
            if (typeof html2canvas === 'undefined') {
                console.log("📥 html2canvas não carregado, tentando carregar...");
                carregarBiblioteca('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', function() {
                    console.log("✅ html2canvas carregado, tentando novamente...");
                    setTimeout(() => imprimirCupomVenda(botao), 1000);
                });
                return;
            }
            
            alert('❌ Gerador de PDF não disponível. Recarregue a página e tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Erro ao gerar cupom: ' + error.message);
    }
}

// Função auxiliar para carregar bibliotecas dinamicamente
function carregarBiblioteca(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = function() {
        console.error('❌ Falha ao carregar: ' + url);
    };
    document.head.appendChild(script);
}

function fecharModalDetalhesVenda() {
    document.getElementById("modal-detalhes-venda").classList.add("hidden");
}

// ============================
//  CARREGAR VENDAS - CORRIGIDA
// ============================
function carregarVendas() {
    fetch('http://127.0.0.1:5000/obter_vendas')
        .then(response => response.json())
        .then(vendas => {
            const tabela = document.getElementById('transactions-table');
            tabela.innerHTML = '';

            vendas.forEach(venda => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-4 py-3 whitespace-nowrap">${venda.nome_cliente}</td>
                    <td class="px-4 py-3 whitespace-nowrap">${venda.descricao_produto}</td>
                    <td class="px-4 py-3 whitespace-nowrap">${traduzirPagamento(venda.forma_pagamento)}</td>
                    <td class="px-4 py-3 whitespace-nowrap">R$ ${parseFloat(venda.valor_total).toFixed(2)}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        ${venda.custo_produto === '-' ? '-' : `R$ ${parseFloat(venda.custo_produto).toFixed(2)}`}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">${venda.nome_vendedor || '-'}</td>
                    <td class="px-4 py-3 whitespace-nowrap">
                        ${venda.custo_produto === '-' ?
                        `<button onclick="abrirModalCusto(this, ${venda.id})"
                                class="bg-yellow-200 text-yellow-800 border border-yellow-400 px-3 py-1 rounded font-semibold hover:bg-yellow-300 transition">Pendente</button>` :
                        `<span class="bg-green-200 text-green-800 px-3 py-1 rounded font-semibold">Concluído</span>`}
                    </td>
                    <td class="px-4 py-3 space-x-2 whitespace-nowrap"
                        data-telefone="${venda.telefone_cliente || ''}"
                        data-pagamento="${venda.forma_pagamento || ''}"
                        data-custo="${venda.custo_produto || ''}"
                        data-garantia="${venda.garantia || ''}"
                        data-vendedor="${venda.nome_vendedor || ''}"
                        data-data-compra="${venda.data_venda || ''}">
                        <button onclick="abrirModalDetalhes(this)"
                            class="px-3 py-1 rounded border border-green-700 bg-green-500 text-white font-semibold hover:bg-green-600 transition">
                            Ver Detalhes
                        </button>
                        <button onclick="abrirModalEditar(this, ${venda.id})"
                            class="px-3 py-1 rounded border border-blue-500 bg-blue-100 text-blue-800 font-semibold hover:bg-blue-200 transition">
                            Editar
                        </button>
                        <button onclick="confirmarExclusao(this, ${venda.id})"
                            class="px-3 py-1 rounded border border-red-500 bg-red-100 text-red-800 font-semibold hover:bg-red-200 transition">
                            Excluir
                        </button>
                    </td>
                `;
                tabela.appendChild(tr);
            });
        })
        .catch(error => console.error('Erro ao carregar vendas:', error));
}




function fecharModalDetalhesVenda() {
    document.getElementById("modal-detalhes-venda").classList.add("hidden");
}



let formVendasInicializado = false;

function inicializarFormularioVendas() {
    if (formVendasInicializado) {
        return;
    }

    const salesForm = document.getElementById('sales-form');
    if (!salesForm) return;

    // Substituir o formulário para remover event listeners antigos
    const newForm = salesForm.cloneNode(true);
    salesForm.parentNode.replaceChild(newForm, salesForm);

    // Adicionar event listener ao NOVO formulário
    document.getElementById('sales-form').addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        registrarVenda();
        return false;
    });

    formVendasInicializado = true;
}

// ============================
//  REGISTRAR VENDA - FLUXO CORRIGIDO (MESMO DA ASSISTÊNCIA)
// ============================
function registrarVenda() {
    
    // Pega os campos principais
    const nomeCliente = document.getElementById('customer-name').value.trim();
    const telefoneCliente = document.getElementById('customer-phone').value.trim();
    const descricaoProduto = document.getElementById('product-description').value.trim();
    const valorTotal = parseFloat(document.getElementById('sale-value').value);
    const nomeVendedor = document.getElementById('vendedor-venda').value;

    if (!nomeCliente || !telefoneCliente || !descricaoProduto || isNaN(valorTotal) || !nomeVendedor) {
        alert('⚠️ Preencha todos os campos obrigatórios, incluindo o vendedor.');
        return false;
    }

    const pagamento = document.getElementById('payment-method').value;
    const parte1 = parseFloat(document.getElementById('payment-part1').value) || 0;
    const parte2 = parseFloat(document.getElementById('payment-part2').value) || 0;

    let valorDinheiro = 0, valorCartao = 0, valorPix = 0, valorVale = 0;

    // Define o tipo de pagamento
    switch (pagamento) {
        case 'cash': valorDinheiro = valorTotal; break;
        case 'card': valorCartao = valorTotal; break;
        case 'pix': valorPix = valorTotal; break;
        case 'voucher': valorVale = valorTotal; break;
        case 'cash_card': valorDinheiro = parte1; valorCartao = parte2; break;
        case 'cash_pix': valorDinheiro = parte1; valorPix = parte2; break;
        case 'card_pix': valorCartao = parte1; valorPix = parte2; break;
    }

    const garantia = document.querySelector('input[name="service-warranty"]:checked')?.value || '30';

    // Monta o objeto que será enviado ao backend
    const dadosVenda = {
        nome_cliente: nomeCliente,
        telefone_cliente: telefoneCliente,
        descricao_produto: descricaoProduto,
        valor_total: valorTotal,
        forma_pagamento: pagamento,
        valor_dinheiro: valorDinheiro,
        valor_cartao: valorCartao,
        valor_pix: valorPix,
        valor_vale: valorVale,
        garantia: garantia,
        nome_vendedor: nomeVendedor
    };


    // PRIMEIRO: Gerar o PDF (igual na assistência)
    if (window.pdfGenerator && window.pdfGenerator.abrirModalCupom) {
        
        // Fecha o modal do formulário APENAS quando o PDF for gerado
        document.getElementById('sales-modal').classList.add('hidden');

        // Gera o PDF e só depois salva
        window.pdfGenerator.abrirModalCupom(dadosVenda, 'venda', async (resultado) => {
            
            if (resultado !== 'fechar' && resultado !== 'erro') {
                console.log("💾 Salvando venda no banco de dados...");
                await salvarVendaNoBanco(dadosVenda);
            } else {
                console.log("❌ PDF cancelado, não salvando no banco");
                // Reabre o modal caso o usuário cancele
                document.getElementById('sales-modal').classList.remove('hidden');
            }
        });

    } else {
        console.error("❌ PDF Generator não disponível, salvando direto...");
        salvarVendaNoBanco(dadosVenda);
    }

    return false;
}

// ============================
//  FUNÇÃO PARA SALVAR VENDA NO BANCO
// ============================
async function salvarVendaNoBanco(dadosVenda) {
    try {
        console.log("📤 Enviando dados para API...");

        const response = await fetch('http://127.0.0.1:5000/registrar_venda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosVenda)
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Venda salva no banco:", data);

        // Limpar formulário apenas se salvou com sucesso
        document.getElementById('sales-form').reset();

        // Atualizar lista apenas se necessário
        if (window.location.pathname.includes('tbvendas.html') && typeof carregarVendas === 'function') {
            console.log("🔄 Atualizando lista de vendas...");
            carregarVendas();
        }

    } catch (error) {
        console.error('❌ Erro ao salvar venda:', error);
        alert('❌ Erro ao salvar venda: ' + error.message);

        // Reabre o modal em caso de erro
        document.getElementById('sales-modal').classList.remove('hidden');
    }
}


// ============================
//  MODAL CUSTO
// ============================
let vendaIdAtual = null;
function abrirModalCusto(botao, idVenda) {
    vendaIdAtual = idVenda;
    document.getElementById("input-custo").value = "";
    document.getElementById("modal-custo").classList.remove("hidden");
}

function salvarCusto() {
    const custo = document.getElementById("input-custo").value;
    if (custo === "") {
        alert("Por favor, informe o custo.");
        return;
    }

    fetch(`http://127.0.0.1:5000/atualizar_custo/${vendaIdAtual}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custo: parseFloat(custo) })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.mensagem);
            fecharModalCusto();
            carregarVendas();
        })
        .catch(err => console.error('Erro ao atualizar custo:', err));
}

// ============================
//  FECHAR MODAL CUSTO
// ============================
function fecharModalCusto() {
    document.getElementById("modal-custo").classList.add("hidden");
}

// ============================
//  FECHAR MODAL AO CLICAR FORA
// ============================
document.addEventListener('DOMContentLoaded', function () {
    // Para todos os modais
    const modais = ['modal-custo', 'modal-detalhes-venda', 'modal-editar'];

    modais.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    if (modalId === 'modal-custo') fecharModalCusto();
                    if (modalId === 'modal-detalhes-venda') fecharModalDetalhesVenda();
                    if (modalId === 'modal-editar') fecharModalEditar();
                }
            });
        }
    });
});


// ============================
//  SALVAR COM ENTER
// ============================
document.addEventListener('DOMContentLoaded', function () {
    // Modal de Custo
    const inputCusto = document.getElementById('input-custo');
    if (inputCusto) {
        inputCusto.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                salvarCusto();
            }
        });
    }

    // Modal de EdiÃ§Ã£o
    const modalEditar = document.getElementById('modal-editar');
    if (modalEditar) {
        modalEditar.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                salvarEdicao();
            }
        });
    }
});

// ============================
//  TRADUZ PAGAMENTO
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



// Confirma exclusÃ£o
function confirmarExclusao(botao) {
    const confirmar = confirm("Tem certeza que deseja excluir esta venda?");
    if (confirmar) {
        const linha = botao.closest("tr");
        linha.remove();
        // Aqui vocÃª pode adicionar chamada AJAX para excluir no banco de dados
    }
}


function abrirModalEditar(botao, idVenda) {
    vendaIdEditando = idVenda;
    const linha = botao.closest("tr");
    const celulaAcoes = linha.querySelector("td:last-child");

    // Preenche os campos bÃ¡sicos
    document.getElementById("edit-nome").value = linha.children[0].textContent;
    document.getElementById("edit-descricao").value = linha.children[1].textContent;
    document.getElementById("edit-valor").value = parseFloat(linha.children[3].textContent.replace("R$", ""));

    document.getElementById("edit-telefone").value = celulaAcoes.getAttribute("data-telefone") || "";
    document.getElementById("edit-pagamento").value = celulaAcoes.getAttribute("data-pagamento") || "cash";

    const custo = celulaAcoes.getAttribute("data-custo");
    document.getElementById("edit-custo").value = (custo && custo !== "-") ? parseFloat(custo) : "";

    const vendedorAtual = celulaAcoes.getAttribute("data-vendedor");
    const garantia = celulaAcoes.getAttribute("data-garantia");
    document.getElementById("edit-garantia").value = garantia && garantia !== "null" ? garantia : "30";

    // Carrega e preenche os vendedores
    carregarVendedores().then(() => {
        preencherSelectVendedores();

        // Seleciona o vendedor atual
        const selectVendedor = document.getElementById('edit-vendedor');
        if (vendedorAtual && vendedorAtual !== '-') {
            selectVendedor.value = vendedorAtual;
        } else {
            // Se nÃ£o tiver vendedor, usa o usuÃ¡rio logado como padrÃ£o
            const loggedInUser = localStorage.getItem('loggedInUser');
            if (loggedInUser && tabvendedores.includes(loggedInUser)) {
                selectVendedor.value = loggedInUser;
            }
        }
    });

    document.getElementById("modal-editar").classList.remove("hidden");
}


function salvarEdicao() {
    const pagamento = document.getElementById("edit-pagamento").value;
    const valorTotal = parseFloat(document.getElementById("edit-valor").value);
    const vendedorSelecionado = document.getElementById("edit-vendedor").value;

    // Validação do vendedor
    if (!vendedorSelecionado) {
        alert("Por favor, selecione um vendedor.");
        return;
    }

    let valorDinheiro = null, valorCartao = null, valorPix = null, valorVale = null;

    switch (pagamento) {
        case 'cash': valorDinheiro = valorTotal; break;
        case 'card': valorCartao = valorTotal; break;
        case 'pix': valorPix = valorTotal; break;
        case 'voucher': valorVale = valorTotal; break;
        case 'cash_card':
            valorDinheiro = parseFloat(document.getElementById("edit-parte1").value) || 0;
            valorCartao = parseFloat(document.getElementById("edit-parte2").value) || 0;
            break;
        case 'cash_pix':
            valorDinheiro = parseFloat(document.getElementById("edit-parte1").value) || 0;
            valorPix = parseFloat(document.getElementById("edit-parte2").value) || 0;
            break;
        case 'card_pix':
            valorCartao = parseFloat(document.getElementById("edit-parte1").value) || 0;
            valorPix = parseFloat(document.getElementById("edit-parte2").value) || 0;
            break;
    }

    const dados = {
        nome_cliente: document.getElementById("edit-nome").value,
        telefone_cliente: document.getElementById("edit-telefone").value,
        descricao_produto: document.getElementById("edit-descricao").value,
        valor_total: valorTotal,
        forma_pagamento: pagamento,
        valor_dinheiro: valorDinheiro,
        valor_cartao: valorCartao,
        valor_pix: valorPix,
        valor_vale: valorVale,
        garantia: document.getElementById("edit-garantia").value || null,
        custo_produto: parseFloat(document.getElementById("edit-custo").value) || null,
        nome_vendedor: vendedorSelecionado
    };

    fetch(`http://127.0.0.1:5000/editar_venda/${vendaIdEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    })
        .then(res => res.json())
        .then(data => {
            alert(data.mensagem);
            fecharModalEditar();
            carregarVendas();
        })
        .catch(err => console.error('Erro ao editar venda:', err));
}

function fecharModalEditar() {
    document.getElementById("modal-editar").classList.add("hidden");
}

// =======================
// Excluir venda
// =======================
function confirmarExclusao(botao, idVenda) {
    if (!confirm("Tem certeza que deseja excluir esta venda?")) return;

    fetch(`http://127.0.0.1:5000/excluir_venda/${idVenda}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => {
            alert(data.mensagem);
            carregarVendas();
        })
        .catch(err => console.error('Erro ao excluir venda:', err));
}


// ============================
//  CARREGAR VENDEDORES
// ============================
let tabvendedores = [];

function carregarVendedores() {
    return fetch('http://127.0.0.1:5000/obter_vendedores')
        .then(response => response.json())
        .then(vendedores => {
            tabvendedores = vendedores;
            return vendedores;
        })
        .catch(error => {
            console.error('Erro ao carregar vendedores:', error);
            return [];
        });
}

// ============================
//  PREENCHER SELECT DE VENDEDORES
// ============================
function preencherSelectVendedores() {
    const selectVendedor = document.getElementById('edit-vendedor');
    if (!selectVendedor) return;

    selectVendedor.innerHTML = ''; // Limpa o select

    // Adiciona opÃ§Ã£o padrÃ£o
    const optionPadrao = document.createElement('option');
    optionPadrao.value = '';
    optionPadrao.textContent = 'Selecione um vendedor';
    optionPadrao.disabled = true;
    optionPadrao.selected = true;
    selectVendedor.appendChild(optionPadrao);

    // Adiciona os vendedores
    tabvendedores.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor;
        option.textContent = vendedor;
        selectVendedor.appendChild(option);
    });
}



// ============================
//  CONTROLE DE CAMPOS DE PAGAMENTO (EDIÃ‡ÃƒO)
// ============================
function configurarCamposPagamentoEdicao() {
    const selectPagamento = document.getElementById('edit-pagamento');
    const camposCombinados = document.getElementById('edit-payment-combo-fields');
    const labelParte1 = document.getElementById('edit-payment-part1-label');
    const labelParte2 = document.getElementById('edit-payment-part2-label');

    if (!selectPagamento) return;

    selectPagamento.addEventListener('change', function () {
        const valor = this.value;

        if (valor.includes('_')) {
            camposCombinados.classList.remove('hidden');

            // Configurar labels baseado no tipo de pagamento
            if (valor === 'cash_card') {
                labelParte1.textContent = 'Dinheiro';
                labelParte2.textContent = 'CartÃ£o';
            } else if (valor === 'cash_pix') {
                labelParte1.textContent = 'Dinheiro';
                labelParte2.textContent = 'Pix';
            } else if (valor === 'card_pix') {
                labelParte1.textContent = 'CartÃ£o';
                labelParte2.textContent = 'Pix';
            }
        } else {
            camposCombinados.classList.add('hidden');
        }
    });
}



// Chame esta funÃ§Ã£o quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    configurarCamposPagamentoEdicao();
});

if (window.location.pathname.includes('tbvendas.html')) {
    carregarVendas();
}



// ============================
//  VERIFICAR E RESTAURAR MODAL PDF
// ============================
function verificarERestaurarModalPDF() {
    const mostrarModal = localStorage.getItem('mostrarModalPDF');
    const dadosVenda = localStorage.getItem('ultimaVendaRegistrada');

    if (mostrarModal === 'true' && dadosVenda && window.pdfGenerator) {
        try {
            const dados = JSON.parse(dadosVenda);
            console.log('Restaurando modal PDF para venda:', dados);

            // Pequeno delay para garantir que o PDF Generator esteja carregado
            setTimeout(() => {
                window.pdfGenerator.abrirModalCupom(dados, 'venda', function () {
                    // Callback quando o modal for fechado - limpar o localStorage
                    localStorage.removeItem('ultimaVendaRegistrada');
                    localStorage.removeItem('mostrarModalPDF');
                });
            }, 500);
        } catch (error) {
            console.error('Erro ao restaurar modal PDF:', error);
            localStorage.removeItem('ultimaVendaRegistrada');
            localStorage.removeItem('mostrarModalPDF');
        }
    }
}




// Adicione este código no arquivo que controla o index.html
document.addEventListener('DOMContentLoaded', function () {
    // Verificar se deve mostrar o modal PDF após recarregar a página
    const mostrarModal = localStorage.getItem('mostrarModalPDF');
    const dadosVenda = localStorage.getItem('ultimaVendaRegistrada');

    if (mostrarModal === 'true' && dadosVenda) {
        // Pequeno delay para garantir que todos os scripts estejam carregados
        setTimeout(() => {
            if (window.pdfGenerator) {
                try {
                    const dados = JSON.parse(dadosVenda);
                    window.pdfGenerator.abrirModalCupom(dados, 'venda', function () {
                        localStorage.removeItem('ultimaVendaRegistrada');
                        localStorage.removeItem('mostrarModalPDF');
                    });
                } catch (error) {
                    console.error('Erro ao abrir modal PDF:', error);
                    localStorage.removeItem('ultimaVendaRegistrada');
                    localStorage.removeItem('mostrarModalPDF');
                }
            }
        }, 1000);
    }
});




// ============================
//  INICIALIZAR VENDEDORES NOS MODAIS
// ============================
function inicializarVendedoresNosModais() {
    // Carrega vendedores quando os modais são abertos
    document.addEventListener('click', function (e) {
        // Modal de Vendas
        if (e.target.id === 'sales-btn' || e.target.closest('#sales-btn')) {
            setTimeout(() => {
                carregarVendedores();
                inicializarFormularioVendas();
            }, 100);
        }

        // Modal de Assistência
        if (e.target.id === 'services-btn' || e.target.closest('#services-btn')) {
            setTimeout(() => {
                carregarVendedores();
            }, 100);
        }
    });

    // Também carrega ao carregar a página se os modais estiverem visíveis
    setTimeout(() => {
        const modalVendas = document.getElementById('sales-modal');
        const modalAssistencia = document.getElementById('services-modal');

        if (modalVendas && !modalVendas.classList.contains('hidden')) {
            carregarVendedores();
        }
        if (modalAssistencia && !modalAssistencia.classList.contains('hidden')) {
            carregarVendedores();
        }
    }, 500);
}

// Adicione esta função para debug do submit
function debugFormSubmit() {
    const form = document.getElementById('sales-form');
    if (form) {
        // Verificar se há múltiplos event listeners
        const originalAddEventListener = form.addEventListener;
        form.addEventListener = function (type, listener, options) {
            if (type === 'submit') {
                console.log('🎯 EVENT LISTENER SUBMIT ADICIONADO:', listener);
                console.trace('Stack trace');
            }
            return originalAddEventListener.call(this, type, listener, options);
        };
    }
}


// ============================
//  CONFIGURAR CAMPOS DE PAGAMENTO COMBINADO (VENDAS) - VERSÃO LIMPA
// ============================
function configurarCamposPagamentoVendas() {
    const selectPagamento = document.getElementById('payment-method');
    const camposCombinados = document.getElementById('payment-combo-fields');

    if (!selectPagamento || !camposCombinados) return;

    // Remover event listeners antigos para evitar duplicação
    const newSelect = selectPagamento.cloneNode(true);
    selectPagamento.parentNode.replaceChild(newSelect, selectPagamento);

    // Re-obter os elementos após o clone
    const selectAtualizado = document.getElementById('payment-method');
    const camposAtualizados = document.getElementById('payment-combo-fields');

    function atualizarCamposPagamento() {
        const valor = selectAtualizado.value;

        if (valor.includes('_')) {
            camposAtualizados.classList.remove('hidden');
            camposAtualizados.style.display = 'grid';

            const labelParte1 = document.getElementById('payment-part1-label');
            const labelParte2 = document.getElementById('payment-part2-label');

            if (valor === 'cash_card') {
                if (labelParte1) labelParte1.textContent = 'Dinheiro';
                if (labelParte2) labelParte2.textContent = 'Cartão';
            } else if (valor === 'cash_pix') {
                if (labelParte1) labelParte1.textContent = 'Dinheiro';
                if (labelParte2) labelParte2.textContent = 'Pix';
            } else if (valor === 'card_pix') {
                if (labelParte1) labelParte1.textContent = 'Cartão';
                if (labelParte2) labelParte2.textContent = 'Pix';
            }
        } else {
            camposAtualizados.classList.add('hidden');
            camposAtualizados.style.display = 'none';
        }
    }

    selectAtualizado.addEventListener('change', atualizarCamposPagamento);

    // Executar uma vez para o estado inicial
    setTimeout(atualizarCamposPagamento, 100);
}

// ============================
//  CONFIGURAR CAMPOS DE PAGAMENTO COMBINADO (ASSISTÊNCIA) - VERSÃO LIMPA
// ============================
function configurarCamposPagamentoAssistencia() {
    const selectPagamento = document.getElementById('service2-payment-method');
    const camposCombinados = document.getElementById('service2-payment-combo-fields');

    if (!selectPagamento || !camposCombinados) return;

    // Remover event listeners antigos para evitar duplicação
    const newSelect = selectPagamento.cloneNode(true);
    selectPagamento.parentNode.replaceChild(newSelect, selectPagamento);

    // Re-obter os elementos após o clone
    const selectAtualizado = document.getElementById('service2-payment-method');
    const camposAtualizados = document.getElementById('service2-payment-combo-fields');

    function atualizarCamposPagamento() {
        const valor = selectAtualizado.value;

        if (valor.includes('_')) {
            camposAtualizados.classList.remove('hidden');
            camposAtualizados.style.display = 'grid';

            const labelParte1 = document.getElementById('service2-payment-part1-label');
            const labelParte2 = document.getElementById('service2-payment-part2-label');

            if (valor === 'cash_card') {
                if (labelParte1) labelParte1.textContent = 'Dinheiro';
                if (labelParte2) labelParte2.textContent = 'Cartão';
            } else if (valor === 'cash_pix') {
                if (labelParte1) labelParte1.textContent = 'Dinheiro';
                if (labelParte2) labelParte2.textContent = 'Pix';
            } else if (valor === 'card_pix') {
                if (labelParte1) labelParte1.textContent = 'Cartão';
                if (labelParte2) labelParte2.textContent = 'Pix';
            }
        } else {
            camposAtualizados.classList.add('hidden');
            camposAtualizados.style.display = 'none';
        }
    }

    selectAtualizado.addEventListener('change', atualizarCamposPagamento);

    // Executar uma vez para o estado inicial
    setTimeout(atualizarCamposPagamento, 100);
}

// ============================
//  INICIALIZAÇÃO - BLOCO ÚNICO (ATUALIZADO COM FILTROS)
// ============================
document.addEventListener('DOMContentLoaded', function () {
    

    // 1. Inicializar formulário de vendas (APENAS UMA VEZ)
    inicializarFormularioVendas();
    
    // 2. Inicializar vendedores nos modais
    if (typeof inicializarVendedoresNosModais === 'function') {
        inicializarVendedoresNosModais();
    }

    // 3. Configurar campos de pagamento (EDIÇÃO E VENDAS)
    if (typeof configurarCamposPagamentoEdicao === 'function') {
        configurarCamposPagamentoEdicao();
    }
    
    // 4. Configurar campos de pagamento combinado para vendas
    configurarCamposPagamentoVendas();
    
    // 5. Configurar campos de pagamento combinado para assistência
    configurarCamposPagamentoAssistencia();

    // 6. Carregar dados específicos da página de vendas
    if (window.location.pathname.includes('tbvendas.html')) {
        
        carregarVendedores().then(() => {
            carregarVendas(); // Esta função agora carrega e aplica filtros
        });
    }

    // 7. Carregar vendedores automaticamente na página principal
    if (!window.location.pathname.includes('tbvendas.html') && 
        !window.location.pathname.includes('tbassistencia.html')) {
        carregarVendedores();
    }

    // 8. Configurar fechamento de modais
    const modalDetalhesVenda = document.getElementById('modal-detalhes-venda');
    if (modalDetalhesVenda) {
        modalDetalhesVenda.addEventListener('click', function (e) {
            if (e.target === modalDetalhesVenda) {
                fecharModalDetalhesVenda();
            }
        });
    }

    // 9. Verificar e restaurar modal PDF se necessário
    if (typeof verificarERestaurarModalPDF === 'function') {
        verificarERestaurarModalPDF();
    }
    
    // 10. Inicializar filtros se estiver na página de vendas
    if (window.location.pathname.includes('tbvendas.html')) {
        
        // As variáveis já foram definidas no escopo global
    }
});


// ============================
//  SISTEMA DE FILTROS - VENDAS
// ============================

let todasVendas = [];
let filtrosAtivosVendas = {
    data: '',
    nome: '',
    vendedor: '',
    status: ''
};

// Função para alternar a visibilidade dos filtros
function toggleFiltros(tipo) {
    const painel = document.getElementById(`painel-filtros-${tipo}`);
    const icon = document.getElementById(`icon-filtro-${tipo}`);
    
    if (painel.classList.contains('hidden')) {
        painel.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        painel.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
}

// Função para aplicar filtros nas vendas
function aplicarFiltrosVendas() {
    console.log("Aplicando filtros de vendas...");
    
    const filtroData = document.getElementById('filtro-data-vendas').value;
    const filtroNome = document.getElementById('filtro-nome-vendas').value.toLowerCase();
    const filtroVendedor = document.getElementById('filtro-vendedor-vendas').value;
    const filtroStatus = document.getElementById('filtro-status-vendas').value;

    filtrosAtivosVendas = {
        data: filtroData,
        nome: filtroNome,
        vendedor: filtroVendedor,
        status: filtroStatus
    };

    console.log("Filtros ativos:", filtrosAtivosVendas);
    filtrarETableVendas();
}

// Função para filtrar e atualizar a tabela de vendas
function filtrarETableVendas() {
    
    if (!todasVendas || todasVendas.length === 0) {
        console.log("Nenhuma venda carregada ainda. Carregando vendas...");
        carregarVendas();
        return;
    }

    const vendasFiltradas = todasVendas.filter(venda => {
        // Filtro por data
        if (filtrosAtivosVendas.data) {
            const dataVenda = venda.data_venda ? venda.data_venda.split(' ')[0] : '';
            console.log("Comparando data:", dataVenda, "com filtro:", filtrosAtivosVendas.data);
            if (dataVenda !== filtrosAtivosVendas.data) {
                return false;
            }
        }

        // Filtro por nome do cliente
        if (filtrosAtivosVendas.nome) {
            const nomeCliente = venda.nome_cliente ? venda.nome_cliente.toLowerCase() : '';
            if (!nomeCliente.includes(filtrosAtivosVendas.nome)) {
                return false;
            }
        }

        // Filtro por vendedor
        if (filtrosAtivosVendas.vendedor) {
            const vendedor = venda.nome_vendedor || '';
            if (vendedor !== filtrosAtivosVendas.vendedor) {
                return false;
            }
        }

        // Filtro por status (pendente/concluído)
        if (filtrosAtivosVendas.status) {
            const isPendente = venda.custo_produto === '-' || venda.custo_produto === null || venda.custo_produto === '';
            console.log("Venda", venda.id, "é pendente?", isPendente);
            
            if (filtrosAtivosVendas.status === 'pendente' && !isPendente) {
                return false;
            }
            if (filtrosAtivosVendas.status === 'concluido' && isPendente) {
                return false;
            }
        }

        return true;
    });

    
    atualizarTabelaVendas(vendasFiltradas);
    atualizarFiltrosAtivosUI('vendas');
}

// Função para atualizar a tabela com vendas filtradas (com controle de permissão)
function atualizarTabelaVendas(vendas) {
    const tabela = document.getElementById('transactions-table');
    if (!tabela) {
        console.error("Tabela de vendas não encontrada!");
        return;
    }

    tabela.innerHTML = '';

    // 🟩 Recupera o cargo do usuário logado
    const cargo = localStorage.getItem("userRole") || "Funcionario";

    vendas.forEach(venda => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';

        // Define se o usuário pode editar/excluir
        const podeEditar = (cargo === "Gerente");
        const podeExcluir = (cargo === "Gerente");

        // Define os botões, de acordo com a permissão
        const botoesAcoes = `
            <button onclick="abrirModalDetalhes(this)"
                class="px-3 py-1 rounded border border-green-700 bg-green-500 text-white font-semibold hover:bg-green-600 transition text-sm">
                Ver Detalhes
            </button>

            <button onclick="${podeEditar ? `abrirModalEditar(this, ${venda.id})` : `alert('❌ Apenas gerentes podem editar vendas!')`}"
                class="px-3 py-1 rounded border border-blue-500 ${podeEditar ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} font-semibold transition text-sm">
                Editar
            </button>

            <button onclick="${podeExcluir ? `confirmarExclusao(this, ${venda.id})` : `alert('❌ Apenas gerentes podem excluir vendas!')`}"
                class="px-3 py-1 rounded border border-red-500 ${podeExcluir ? 'bg-red-100 hover:bg-red-200 text-red-800' : 'bg-gray-200 text-gray-500 cursor-not-allowed'} font-semibold transition text-sm">
                Excluir
            </button>
        `;

        tr.innerHTML = `
            <td class="px-4 py-3 whitespace-nowrap">${venda.nome_cliente || '-'}</td>
            <td class="px-4 py-3 whitespace-nowrap">${venda.descricao_produto || '-'}</td>
            <td class="px-4 py-3 whitespace-nowrap">${traduzirPagamento(venda.forma_pagamento)}</td>
            <td class="px-4 py-3 whitespace-nowrap">R$ ${parseFloat(venda.valor_total || 0).toFixed(2)}</td>
            <td class="px-4 py-3 whitespace-nowrap">
                ${(venda.custo_produto === '-' || !venda.custo_produto) ? '-' : `R$ ${parseFloat(venda.custo_produto).toFixed(2)}`}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">${venda.nome_vendedor || '-'}</td>
            <td class="px-4 py-3 whitespace-nowrap">
                ${(venda.custo_produto === '-' || !venda.custo_produto)
                    ? `<button onclick="abrirModalCusto(this, ${venda.id})"
                            class="bg-yellow-200 text-yellow-800 border border-yellow-400 px-3 py-1 rounded font-semibold hover:bg-yellow-300 transition text-sm">
                        Pendente
                    </button>`
                    : `<span class="bg-green-200 text-green-800 px-3 py-1 rounded font-semibold text-sm">Concluído</span>`}
            </td>
            <td class="px-4 py-3 space-x-2 whitespace-nowrap"
                data-telefone="${venda.telefone_cliente || ''}"
                data-pagamento="${venda.forma_pagamento || ''}"
                data-custo="${venda.custo_produto || ''}"
                data-garantia="${venda.garantia || ''}"
                data-vendedor="${venda.nome_vendedor || ''}"
                data-data-compra="${venda.data_venda || ''}">
                ${botoesAcoes}
            </td>
        `;

        tabela.appendChild(tr);
    });
}


// Função para atualizar a interface dos filtros ativos
function atualizarFiltrosAtivosUI(tipo) {
    const container = document.getElementById(`filtros-ativos-${tipo}`);
    const tagsContainer = document.getElementById(`tags-filtros-${tipo}`);
    const textoContador = document.getElementById(`texto-contador-${tipo}`);
    
    if (!container || !tagsContainer || !textoContador) return;
    
    const filtros = tipo === 'vendas' ? filtrosAtivosVendas : filtrosAtivosAssistencias;
    const dados = tipo === 'vendas' ? todasVendas : todasAssistencias;
    
    // Limpar tags existentes
    tagsContainer.innerHTML = '';
    
    // Criar tags para filtros ativos
    let filtrosCount = 0;
    
    if (filtros.data) {
        criarTagFiltro(tagsContainer, `Data: ${formatarData(filtros.data)}`, tipo);
        filtrosCount++;
    }
    
    if (filtros.nome) {
        criarTagFiltro(tagsContainer, `Nome: "${filtros.nome}"`, tipo);
        filtrosCount++;
    }
    
    if (filtros.vendedor) {
        criarTagFiltro(tagsContainer, `Vendedor: ${filtros.vendedor}`, tipo);
        filtrosCount++;
    }
    
    if (filtros.status) {
        const statusText = filtros.status === 'pendente' ? 'Pendentes' : 'Concluídos';
        criarTagFiltro(tagsContainer, `Status: ${statusText}`, tipo);
        filtrosCount++;
    }
    
    // Mostrar/ocultar container de filtros ativos
    if (filtrosCount > 0) {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
    
    // Atualizar texto do contador
    const total = dados.length;
    const dadosFiltrados = tipo === 'vendas' ? 
        todasVendas.filter(v => filtrarVenda(v, filtros)) : 
        todasAssistencias.filter(a => filtrarAssistencia(a, filtros));
    const filtrados = dadosFiltrados.length;
    
    if (filtrosCount > 0) {
        textoContador.textContent = `${filtrados} de ${total} vendas encontradas`;
        textoContador.className = 'text-sm text-blue-600 font-medium';
    } else {
        textoContador.textContent = `${total} vendas no total`;
        textoContador.className = 'text-sm text-gray-600';
    }
    
    // Atualizar badge do contador
    const contador = document.getElementById(`contador-${tipo}`);
    if (contador) {
        contador.textContent = filtrados;
        if (filtrosCount > 0) {
            contador.className = 'bg-blue-500 text-white px-2 py-1 rounded text-sm font-medium';
        } else {
            contador.className = 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm';
        }
    }
}

// Função auxiliar para filtrar uma venda
function filtrarVenda(venda, filtros) {
    if (filtros.data) {
        const dataVenda = venda.data_venda ? venda.data_venda.split(' ')[0] : '';
        if (dataVenda !== filtros.data) return false;
    }

    if (filtros.nome) {
        const nomeCliente = venda.nome_cliente ? venda.nome_cliente.toLowerCase() : '';
        if (!nomeCliente.includes(filtros.nome)) return false;
    }

    if (filtros.vendedor) {
        const vendedor = venda.nome_vendedor || '';
        if (vendedor !== filtros.vendedor) return false;
    }

    if (filtros.status) {
        const isPendente = venda.custo_produto === '-' || venda.custo_produto === null || venda.custo_produto === '';
        if (filtros.status === 'pendente' && !isPendente) return false;
        if (filtros.status === 'concluido' && isPendente) return false;
    }

    return true;
}

// Função para criar tag de filtro
function criarTagFiltro(container, texto, tipo) {
    const tag = document.createElement('div');
    tag.className = `bg-${tipo === 'vendas' ? 'blue' : 'orange'}-100 text-${tipo === 'vendas' ? 'blue' : 'orange'}-800 px-2 py-1 rounded-full text-xs font-medium flex items-center`;
    
    const tipoFiltro = texto.split(':')[0].toLowerCase().trim();
    const valorFiltro = texto.split(':')[1] ? texto.split(':')[1].trim() : '';
    
    tag.innerHTML = `
        ${texto}
        <button onclick="removerFiltro('${tipoFiltro}', '${tipo}')" 
                class="ml-1 text-${tipo === 'vendas' ? 'blue' : 'orange'}-600 hover:text-${tipo === 'vendas' ? 'blue' : 'orange'}-800">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    container.appendChild(tag);
}

// Função para remover filtro individual
function removerFiltro(tipoFiltro, contexto) {
    const filtros = contexto === 'vendas' ? filtrosAtivosVendas : filtrosAtivosAssistencias;
    
    switch (tipoFiltro) {
        case 'data':
            document.getElementById(`filtro-data-${contexto}`).value = '';
            filtros.data = '';
            break;
        case 'nome':
            document.getElementById(`filtro-nome-${contexto}`).value = '';
            filtros.nome = '';
            break;
        case 'vendedor':
            document.getElementById(`filtro-vendedor-${contexto}`).value = '';
            filtros.vendedor = '';
            break;
        case 'status':
            document.getElementById(`filtro-status-${contexto}`).value = '';
            filtros.status = '';
            break;
    }
    
    // Reaplicar filtros
    if (contexto === 'vendas') {
        filtrarETableVendas();
    } else {
        filtrarETableAssistencias();
    }
}

// Função para formatar data
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para limpar filtros de vendas
function limparFiltrosVendas() {
    document.getElementById('filtro-data-vendas').value = '';
    document.getElementById('filtro-nome-vendas').value = '';
    document.getElementById('filtro-vendedor-vendas').value = '';
    document.getElementById('filtro-status-vendas').value = '';

    filtrosAtivosVendas = {
        data: '',
        nome: '',
        vendedor: '',
        status: ''
    };

    filtrarETableVendas();
}

// Função para preencher select de vendedores nos filtros
function preencherFiltroVendedoresVendas() {
    const select = document.getElementById('filtro-vendedor-vendas');
    if (!select) return;

    // Limpar opções existentes (mantendo a primeira)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Adicionar vendedores únicos
    const vendedoresUnicos = [...new Set(todasVendas.map(v => v.nome_vendedor).filter(v => v && v !== '-' && v !== ''))];
    
    vendedoresUnicos.forEach(vendedor => {
        const option = document.createElement('option');
        option.value = vendedor;
        option.textContent = vendedor;
        select.appendChild(option);
    });
}

// MODIFICAR a função carregarVendas original para armazenar os dados
function carregarVendas() {
    
    
    fetch('http://127.0.0.1:5000/obter_vendas')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao carregar vendas: ' + response.status);
            }
            return response.json();
        })
        .then(vendas => {
            
            todasVendas = vendas;
            preencherFiltroVendedoresVendas();
            filtrarETableVendas(); // Aplicar filtros após carregar
        })
        .catch(error => {
            console.error('Erro ao carregar vendas:', error);
            
        });
}


function verificarPermissaoGerente() {
    const cargo = localStorage.getItem("userRole");
    if (cargo !== "Gerente") {
        alert("❌ Apenas gerentes podem realizar esta ação.");
        return false;
    }
    return true;
}


// Chame no DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    debugFormSubmit();
});