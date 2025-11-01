// dashboard.js (consolidado e corrigido)
// --------------------------------
// Regras:
// - API base determinada dinamicamente (ver api-config.js)
// - Formatações em pt-BR
// - Atualiza todos os modais listados no dashboard.html

let filtroAtual = { tipo: 'hoje', dataInicio: null, dataFim: null };

// Função para obter data no formato YYYY-MM-DD - CORRIGIDA
function getLocalDateString(date) {
    // Usar diretamente a data local do navegador
    // O navegador já deve estar configurado com o fuso horário correto
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}




function formatNumberBR(value = 0) {
    // retorna "0,00" sem o "R$"
    return Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCurrencyBR(value = 0) {
    return 'R$ ' + formatNumberBR(value);
}

function formatarDataLong(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${Number(d)} de ${months[Number(m) - 1]} de ${y}`;
}

function formatarDataShort(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

// === TOGGLE FILTERS ===
function toggleFilters() {
    const content = document.getElementById('filter-content');
    const arrow = document.getElementById('filter-arrow');

    if (!content) {
        console.error('Elemento filter-content não encontrado');
        return;
    }

    // Alternar visibilidade
    if (content.classList.contains('hidden')) {
        // Mostrar
        content.classList.remove('hidden');
        content.style.maxHeight = content.scrollHeight + "px";
        if (arrow) arrow.classList.add('rotate-180');
    } else {
        // Esconder
        content.classList.add('hidden');
        content.style.maxHeight = "0";
        if (arrow) arrow.classList.remove('rotate-180');
    }

    console.log('Filtros toggle:', content.classList.contains('hidden') ? 'escondido' : 'visível');
}

// === INICIALIZAÇÃO DOS FILTROS ===
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM carregado - inicializando filtros...');

    // Configurar data atual nos campos
    const hoje = getLocalDateString(new Date());
    const dateInicio = document.getElementById('date-inicio');
    const dateFim = document.getElementById('date-fim');

    if (dateInicio) {
        dateInicio.value = hoje;
        console.log('Data início configurada:', hoje);
    }
    if (dateFim) {
        dateFim.value = hoje;
        console.log('Data fim configurada:', hoje);
    }

    // Configurar evento no select de período
    const periodoSelect = document.getElementById('select-periodo');
    if (periodoSelect) {
        console.log('Select de período encontrado');
        periodoSelect.addEventListener('change', function () {
            console.log('Período alterado para:', this.value);
            buscarPorPeriodoPredefinido(this.value);
        });

        // Inicializar com "hoje"
        periodoSelect.value = 'hoje';
        console.log('Período padrão definido: hoje');

        // Carregar dados iniciais
        console.log('Carregando dados iniciais para a hoje...');
        buscarPorPeriodoPredefinido('hoje');
    } else {
        console.error('Select de período não encontrado!');
        buscarPorPeriodoPredefinido('hoje');
    }

    // Configurar evento no botão de busca por data específica
    const btnBuscarData = document.getElementById('btn-buscar-data');
    if (btnBuscarData) {
        console.log('Botão buscar data encontrado');
        btnBuscarData.addEventListener('click', buscarPorDataEspecifica);
    } else {
        console.error('Botão buscar data não encontrado!');
    }

    // Verificar se os elementos existem
    const filterContent = document.getElementById('filter-content');
    const filterArrow = document.getElementById('filter-arrow');

    if (!filterContent) {
        console.error('❌ Elemento filter-content não encontrado no DOM');
    } else {
        console.log('✅ Elemento filter-content encontrado');
    }

    if (!filterArrow) {
        console.error('❌ Elemento filter-arrow não encontrado no DOM');
    } else {
        console.log('✅ Elemento filter-arrow encontrado');
    }

    // Adicionar click nos cards (caso HTML não tenha onclick)
    document.querySelectorAll('.stats-card').forEach(card => {
        card.addEventListener('click', function () {
            const modalId = this.id.replace('-card', '-modal');
            openModal(modalId);
        });
    });

    // Inicializar toggle dos filtros como fechado
    const filterContentEl = document.getElementById('filter-content');
    if (filterContentEl) {
        filterContentEl.classList.add('hidden');
        filterContentEl.style.maxHeight = "0";
    }

    console.log('Inicialização completa - Dashboard pronto');
});

function toggleDashboardCards() {
    const cards = document.getElementById('dashboard-cards');
    const arrow = document.getElementById('dashboard-cards-arrow');
    if (!cards) return;
    if (cards.style.maxHeight && cards.style.maxHeight !== "0px") {
        cards.style.maxHeight = "0";
        arrow && arrow.classList.remove('rotate-180');
    } else {
        cards.style.maxHeight = cards.scrollHeight + "px";
        arrow && arrow.classList.add('rotate-180');
    }
}

function toggleLucroCards() {
    const cards = document.getElementById('lucro-cards');
    const arrow = document.getElementById('lucro-cards-arrow');
    if (!cards) return;
    if (cards.style.maxHeight && cards.style.maxHeight !== "0px") {
        cards.style.maxHeight = "0";
        arrow && arrow.classList.remove('rotate-180');
    } else {
        cards.style.maxHeight = cards.scrollHeight + "px";
        arrow && arrow.classList.add('rotate-180');
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'flex';

    // carregar dados do modal quando abrir
    const { dataInicio, dataFim } = filtroAtual;
    try {
        if (modalId === 'sales-modal') carregarModalVendas(dataInicio, dataFim);
        if (modalId === 'services-modal') carregarModalAssistencias(dataInicio, dataFim);
        if (modalId === 'expenses-modal') carregarModalSaidas(dataInicio, dataFim);
        if (modalId === 'pending-sales-modal') carregarModalPendentes(dataInicio, dataFim);
        if (modalId === 'lucro-vendas-modal') carregarModalLucroVendas(dataInicio, dataFim);
        if (modalId === 'lucro-assistencias-modal') carregarModalLucroAssistencias(dataInicio, dataFim);
        if (modalId === 'lucro-total-modal') carregarModalLucroTotal(dataInicio, dataFim);
        if (modalId === 'total-modal') carregarModalTotal(dataInicio, dataFim);
        if (modalId === 'sellers-summary-modal') carregarModalVendedores(dataInicio, dataFim); // NOVA LINHA
    } catch (e) {
        console.error('Erro ao abrir modal:', e);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'none';
}

// fechar modal clicando fora
window.addEventListener('click', (event) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) modal.style.display = 'none';
    });
});

/* -------------------------
Buscar por período (pré e personalizado)
   ------------------------- */
function definirFiltroAtual(tipo, dataInicio, dataFim) {
    filtroAtual = { tipo, dataInicio, dataFim };
}

async function buscarPorPeriodoPredefinido(periodo = null) {
    // Se não foi passado período, pega do select
    if (!periodo) {
        periodo = document.getElementById('select-periodo').value;
    }

    const hoje = new Date();
    let dataInicio, dataFim;

    switch (periodo) {
        case 'hoje':
            dataInicio = dataFim = getLocalDateString(hoje);
            break;

        case 'semana':
            // Começar na segunda-feira da semana atual
            const diaSemana = hoje.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado
            const diffSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;

            const segundaFeira = new Date(hoje);
            segundaFeira.setDate(hoje.getDate() + diffSegunda);
            dataInicio = getLocalDateString(segundaFeira);
            dataFim = getLocalDateString(hoje);
            break;

        case 'mes':
            const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            dataInicio = getLocalDateString(primeiroDiaMes);
            dataFim = getLocalDateString(ultimoDiaMes);
            break;

        case 'trimestre':
            const trimestre = Math.floor(hoje.getMonth() / 3);
            const primeiroDiaTrimestre = new Date(hoje.getFullYear(), trimestre * 3, 1);
            const ultimoDiaTrimestre = new Date(hoje.getFullYear(), (trimestre + 1) * 3, 0);
            dataInicio = getLocalDateString(primeiroDiaTrimestre);
            dataFim = getLocalDateString(ultimoDiaTrimestre);
            break;

        case 'semestre':
            const semestre = Math.floor(hoje.getMonth() / 6);
            const primeiroDiaSemestre = new Date(hoje.getFullYear(), semestre * 6, 1);
            const ultimoDiaSemestre = new Date(hoje.getFullYear(), (semestre + 1) * 6, 0);
            dataInicio = getLocalDateString(primeiroDiaSemestre);
            dataFim = getLocalDateString(ultimoDiaSemestre);
            break;

        case 'ano':
            const primeiroDiaAno = new Date(hoje.getFullYear(), 0, 1);
            const ultimoDiaAno = new Date(hoje.getFullYear(), 11, 31);
            dataInicio = getLocalDateString(primeiroDiaAno);
            dataFim = getLocalDateString(ultimoDiaAno);
            break;

        case 'todos':
            dataInicio = '2020-01-01';
            dataFim = getLocalDateString(new Date(hoje.getFullYear() + 1, 11, 31));
            break;

        default:
            dataInicio = dataFim = getLocalDateString(hoje);
    }

    console.log(`Período ${periodo}: ${dataInicio} à ${dataFim}`);
    console.log('Data atual:', getLocalDateString(hoje));
    definirFiltroAtual(periodo, dataInicio, dataFim);
    await carregarDadosDashboard(dataInicio, dataFim);
    await carregarDadosLucro(dataInicio, dataFim);
}

// === BUSCAR POR DATA ESPECÍFICA ===
function buscarPorDataEspecifica() {
    const dataInicio = document.getElementById('date-inicio').value;
    const dataFim = document.getElementById('date-fim').value;

    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione ambas as datas (início e fim).');
        return;
    }

    if (dataInicio > dataFim) {
        alert('A data de início não pode ser maior que a data de fim.');
        return;
    }

    buscarPorPeriodo(dataInicio, dataFim);
}

// === BUSCAR POR PERÍODO PERSONALIZADO ===
async function buscarPorPeriodo(dataInicio, dataFim) {
    console.log(`Buscando período personalizado: ${dataInicio} à ${dataFim}`);
    definirFiltroAtual('personalizado', dataInicio, dataFim);
    await carregarDadosDashboard(dataInicio, dataFim);
    await carregarDadosLucro(dataInicio, dataFim);

    // Atualizar select para refletir que é um período personalizado
    const periodoSelect = document.getElementById('select-periodo');
    if (periodoSelect) {
        periodoSelect.value = 'personalizado';
    }

    // atualizar modais abertos
    const modals = [
        'sales-modal', 
        'services-modal', 
        'expenses-modal', 
        'pending-sales-modal',
        'lucro-vendas-modal', 
        'lucro-assistencias-modal', 
        'lucro-total-modal',
        'total-modal', 
        'sellers-summary-modal'  // ADICIONADO sellers-summary-modal
    ];
    
    modals.forEach(async (m) => {
        const el = document.getElementById(m);
        if (el && el.style.display === 'flex') {
            // chama a função correspondente
            if (m === 'sales-modal') await carregarModalVendas(dataInicio, dataFim);
            if (m === 'services-modal') await carregarModalAssistencias(dataInicio, dataFim);
            if (m === 'expenses-modal') await carregarModalSaidas(dataInicio, dataFim);
            if (m === 'pending-sales-modal') await carregarModalPendentes(dataInicio, dataFim);
            if (m === 'lucro-vendas-modal') await carregarModalLucroVendas(dataInicio, dataFim);
            if (m === 'lucro-assistencias-modal') await carregarModalLucroAssistencias(dataInicio, dataFim);
            if (m === 'lucro-total-modal') await carregarModalLucroTotal(dataInicio, dataFim);
            if (m === 'total-modal') await carregarModalTotal(dataInicio, dataFim);
            if (m === 'sellers-summary-modal') await carregarModalVendedores(dataInicio, dataFim); // NOVA LINHA
        }
    });
}

/* -------------------------
    Carregamento de dados (dashboard + modais)
   ------------------------- */
async function carregarDadosDashboard(dataInicio, dataFim) {
    try {
        console.log(`Carregando dados dashboard: ${dataInicio} à ${dataFim}`);

        // vendas
        const vendasRes = await apiFetch(`/obter_resumo_vendas_concluidas_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const dadosVendas = await (vendasRes.ok ? vendasRes.json() : { total_geral: 0 });
        console.log('Dados vendas:', dadosVendas);

        // assistencias
        const assistRes = await apiFetch(`/obter_resumo_assistencias_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const dadosAssist = await (assistRes.ok ? assistRes.json() : {
            total_geral: 0,
            total_dinheiro: 0,
            total_cartao: 0,
            total_pix: 0,
            total_vale: 0
        });
        console.log('Dados assistências:', dadosAssist);

        // saídas
        const saidasRes = await apiFetch(`/obter_resumo_saidas_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const dadosSaidas = await (saidasRes.ok ? saidasRes.json() : { total: 0 });
        console.log('Dados saídas:', dadosSaidas);

        const totalVendas = Number(dadosVendas.total_geral || 0);
        const totalAssist = Number(dadosAssist.total_geral || 0);
        const totalSaidas = Number(dadosSaidas.total || 0);
        const somaVendasAssist = totalVendas + totalAssist;

        console.log(`Totais - Vendas: ${totalVendas}, Assist: ${totalAssist}, Saídas: ${totalSaidas}, Total: ${somaVendasAssist}`);

        // atualizar cartões
        const elTodaySales = document.getElementById('today-sales');
        const elTodayServices = document.getElementById('today-services');
        const elTodayExpenses = document.getElementById('today-expenses');
        const elTotalAmount = document.getElementById('total-amount');

        if (elTodaySales) elTodaySales.textContent = formatNumberBR(totalVendas);
        if (elTodayServices) elTodayServices.textContent = formatNumberBR(totalAssist);
        if (elTodayExpenses) elTodayExpenses.textContent = formatNumberBR(totalSaidas);
        if (elTotalAmount) elTotalAmount.textContent = formatNumberBR(somaVendasAssist);

        // Atualizar valores separados das assistências
        document.getElementById('services-dinheiro') && (document.getElementById('services-dinheiro').textContent = `Din: ${formatCurrencyBR(dadosAssist.total_dinheiro || 0)}`);
        document.getElementById('services-cartao') && (document.getElementById('services-cartao').textContent = `Cartão: ${formatCurrencyBR(dadosAssist.total_cartao || 0)}`);
        document.getElementById('services-pix') && (document.getElementById('services-pix').textContent = `PIX: ${formatCurrencyBR(dadosAssist.total_pix || 0)}`);
        document.getElementById('services-vale') && (document.getElementById('services-vale').textContent = `Vale: ${formatCurrencyBR(dadosAssist.total_vale || 0)}`);

    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
    }
}

/* ---- Modais LUCROS ---- */
async function carregarDadosLucro(dataInicio, dataFim) {
    try {
        console.log(`Carregando dados lucro: ${dataInicio} à ${dataFim}`);

        const vendasRes = await apiFetch(`/obter_lucro_vendas_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const vendas = vendasRes.ok ? await vendasRes.json() : { lucro_total: 0, total_vendas: 0, total_custo: 0 };
        console.log('Lucro vendas:', vendas);

        const assistRes = await apiFetch(`/obter_lucro_assistencias_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const assists = assistRes.ok ? await assistRes.json() : { lucro_total: 0, total_servicos: 0, total_custo: 0 };
        console.log('Lucro assistências:', assists);

        // cards de lucro
        const elLucroVendas = document.getElementById('lucro-vendas');
        const elLucroAssist = document.getElementById('lucro-assistencias');
        const elLucroTotal = document.getElementById('lucro-total');

        if (elLucroVendas) elLucroVendas.textContent = formatNumberBR(Number(vendas.lucro_total || 0));
        if (elLucroAssist) elLucroAssist.textContent = formatNumberBR(Number(assists.lucro_total || 0));
        if (elLucroTotal) elLucroTotal.textContent = formatNumberBR(Number(vendas.lucro_total || 0) + Number(assists.lucro_total || 0));

        console.log(`Lucros calculados - Vendas: ${vendas.lucro_total}, Assist: ${assists.lucro_total}, Total: ${Number(vendas.lucro_total || 0) + Number(assists.lucro_total || 0)}`);

    } catch (error) {
        console.error('Erro ao carregar dados de lucro:', error);
    }
}

/* ---- Modal VENDAS ---- */
async function carregarModalVendas(dataInicio, dataFim) {
    try {
        const res = await apiFetch(`/obter_resumo_vendas_concluidas_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        if (!res.ok) throw new Error('Erro ao obter resumo de vendas');
        const dados = await res.json();

        // período
        const periodoEl = document.getElementById('modal-periodo');
        if (periodoEl) periodoEl.textContent = `${formatarDataLong(dataInicio)} à ${formatarDataLong(dataFim)}`;

        const total = Number(dados.total_geral || 0);
        const percent = (value) => total > 0 ? (Number(value || 0) / total) * 100 : 0;

        // atualizar barras/valores (verifica existência)
        const map = [
            ['modal-dinheiro-valor', 'modal-dinheiro-bar', dados.total_dinheiro],
            ['modal-cartao-valor', 'modal-cartao-bar', dados.total_cartao],
            ['modal-pix-valor', 'modal-pix-bar', dados.total_pix],
            ['modal-vale-valor', 'modal-vale-bar', dados.total_vale]
        ];
        map.forEach(([valId, barId, value]) => {
            const valEl = document.getElementById(valId);
            const barEl = document.getElementById(barId);
            if (valEl) valEl.textContent = formatCurrencyBR(Number(value || 0));
            if (barEl) barEl.style.width = `${percent(value)}%`;
        });

        const totalEl = document.getElementById('modal-total-valor');
        if (totalEl) totalEl.textContent = formatCurrencyBR(total);
    } catch (error) {
        console.error('Erro ao carregar dados do modal de vendas:', error);
    }
}

/* ---- Modal ASSISTÊNCIAS ---- */
async function carregarModalAssistencias(dataInicio, dataFim) {
    try {
        const res = await apiFetch(`/obter_resumo_assistencias_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        if (!res.ok) throw new Error('Erro ao obter resumo de assistências');
        const dados = await res.json();

        const periodoEl = document.getElementById('modal-periodo-assistencias');
        if (periodoEl) periodoEl.textContent = `${formatarDataLong(dataInicio)} à ${formatarDataLong(dataFim)}`;

        const total = Number(dados.total_geral || 0);
        const percent = (value) => total > 0 ? (Number(value || 0) / total) * 100 : 0;

        const map = [
            ['modal-assistencia-dinheiro-valor', 'modal-assistencia-dinheiro-bar', dados.total_dinheiro],
            ['modal-assistencia-cartao-valor', 'modal-assistencia-cartao-bar', dados.total_cartao],
            ['modal-assistencia-pix-valor', 'modal-assistencia-pix-bar', dados.total_pix],
            ['modal-assistencia-vale-valor', 'modal-assistencia-vale-bar', dados.total_vale]
        ];

        map.forEach(([valId, barId, value]) => {
            const valEl = document.getElementById(valId);
            const barEl = document.getElementById(barId);
            if (valEl) valEl.textContent = formatCurrencyBR(Number(value || 0));
            if (barEl) barEl.style.width = `${percent(value)}%`;
        });

        const totalEl = document.getElementById('modal-assistencia-total-valor');
        if (totalEl) totalEl.textContent = formatCurrencyBR(total);

    } catch (error) {
        console.error('Erro ao carregar dados do modal de assistências:', error);
    }
}

/* ---- Modal PENDENTES ---- */
async function carregarModalPendentes(dataInicio, dataFim) {
    try {
        const vendasRes = await apiFetch(`/obter_resumo_vendas_pendentes_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const vendas = vendasRes.ok ? await vendasRes.json() : { quantidade: 0, total_geral: 0 };

        const assistRes = await apiFetch(`/obter_resumo_assistencias_pendentes_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const assists = assistRes.ok ? await assistRes.json() : { quantidade: 0, total_geral: 0 };

        document.getElementById('modal-periodo-pendentes') && (document.getElementById('modal-periodo-pendentes').textContent = `${formatarDataLong(dataInicio)} à ${formatarDataLong(dataFim)}`);

        document.getElementById('modal-vendas-pendentes-qtd') && (document.getElementById('modal-vendas-pendentes-qtd').textContent = vendas.quantidade || 0);
        document.getElementById('modal-vendas-pendentes-valor') && (document.getElementById('modal-vendas-pendentes-valor').textContent = formatCurrencyBR(Number(vendas.total_geral || 0)));

        document.getElementById('modal-assistencias-pendentes-qtd') && (document.getElementById('modal-assistencias-pendentes-qtd').textContent = assists.quantidade || 0);
        document.getElementById('modal-assistencias-pendentes-valor') && (document.getElementById('modal-assistencias-pendentes-valor').textContent = formatCurrencyBR(Number(assists.total_geral || 0)));

        const total = Number(vendas.total_geral || 0) + Number(assists.total_geral || 0);
        document.getElementById('modal-total-pendentes') && (document.getElementById('modal-total-pendentes').textContent = formatCurrencyBR(total));
    } catch (error) {
        console.error('Erro ao carregar pendentes:', error);
    }
}

/* ---- Modal SAÍDAS (detalhes) ---- */
async function carregarModalSaidas(dataInicio, dataFim) {
    try {
        // obter lista completa de saídas e filtrar por período (endpoint: /api/saidas)
        const listRes = await apiFetch(`/api/saidas`);
        const todas = listRes.ok ? await listRes.json() : [];

        // filtrar por data (data no formato ISO ou YYYY-MM-DD)
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        // garantir fim até 23:59:59
        fim.setHours(23, 59, 59, 999);

        const selecionadas = todas.filter(s => {
            const d = new Date(s.data);
            return d >= inicio && d <= fim;
        });

        const modal = document.getElementById('expenses-modal');
        if (!modal) return;

        // atualizar período exibido no modal
        const periodoSpan = modal.querySelector('.modal-content .border-b .font-medium');
        if (periodoSpan) periodoSpan.textContent = `${formatarDataLong(dataInicio)} à ${formatarDataLong(dataFim)}`;

        // container onde estão os itens de despesas: pegar o segundo .p-4 dentro do modal-content
        const p4s = modal.querySelectorAll('.modal-content > .p-4');
        let listContainer = null;
        if (p4s && p4s.length >= 2) listContainer = p4s[1];
        else listContainer = modal.querySelector('.modal-content'); // fallback

        // limpar itens existentes (os .expense-item)
        if (listContainer) {
            // remover todos os filhos expense-item para repopular
            const existing = listContainer.querySelectorAll('.expense-item');
            existing.forEach(e => e.remove());

            // criar itens para cada saída selecionada
            let total = 0;
            selecionadas.forEach(s => {
                total += Number(s.valor || 0);
                const item = document.createElement('div');
                item.className = 'expense-item flex justify-between items-start mb-3';
                item.innerHTML = `
                    <div>
                        <span class="font-medium text-gray-700">${s.motivo || s.funcionario || 'Despesa'}</span>
                        <p class="text-sm text-gray-500">${s.funcionario ? s.funcionario : (s.data || '')}</p>
                    </div>
                    <span class="font-medium text-red-600">${formatCurrencyBR(Number(s.valor || 0))}</span>
                `;
                listContainer.appendChild(item);
            });

            // total elemento (payment-total). Recriar/atualizar
            const totalDiv = document.createElement('div');
            totalDiv.className = 'expense-item payment-total flex justify-between items-center mt-4';
            totalDiv.innerHTML = `<span class="font-medium text-gray-700">Total</span><span class="font-bold text-gray-800">${formatCurrencyBR(total)}</span>`;
            listContainer.appendChild(totalDiv);

            // atualizar cartão principal (today-expenses) caso o período seja "hoje"
            const today = getLocalDateString(new Date());
            if (dataInicio === today && dataFim === today) {
                const cardEl = document.getElementById('today-expenses');
                if (cardEl) cardEl.textContent = formatNumberBR(total);
            }
        }
    } catch (error) {
        console.error('Erro ao carregar modal de saídas:', error);
    }
}

/* ---- Modais LUCROS ---- */
async function carregarDadosLucro(dataInicio, dataFim) {
    try {
        const vendasRes = await apiFetch(`/obter_lucro_vendas_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const vendas = vendasRes.ok ? await vendasRes.json() : { lucro_total: 0, total_vendas: 0, total_custo: 0 };

        const assistRes = await apiFetch(`/obter_lucro_assistencias_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const assists = assistRes.ok ? await assistRes.json() : { lucro_total: 0, total_servicos: 0, total_custo: 0 };

        // cards de lucro
        const elLucroVendas = document.getElementById('lucro-vendas');
        const elLucroAssist = document.getElementById('lucro-assistencias');
        const elLucroTotal = document.getElementById('lucro-total');

        if (elLucroVendas) elLucroVendas.textContent = formatNumberBR(Number(vendas.lucro_total || 0));
        if (elLucroAssist) elLucroAssist.textContent = formatNumberBR(Number(assists.lucro_total || 0));
        if (elLucroTotal) elLucroTotal.textContent = formatNumberBR(Number(vendas.lucro_total || 0) + Number(assists.lucro_total || 0));
    } catch (error) {
        console.error('Erro ao carregar dados de lucro:', error);
    }
}

async function carregarModalLucroVendas(dataInicio, dataFim) {
    try {
        const res = await apiFetch(`/obter_lucro_vendas_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        if (!res.ok) throw new Error('Erro obter lucro vendas');
        const dados = await res.json();

        document.getElementById('modal-periodo-lucro-vendas') && (document.getElementById('modal-periodo-lucro-vendas').textContent = `${formatarDataLong(dataInicio)} à ${formatarDataLong(dataFim)}`);
        document.getElementById('modal-total-vendas-lucro') && (document.getElementById('modal-total-vendas-lucro').textContent = formatCurrencyBR(dados.total_vendas || 0));
        document.getElementById('modal-total-custo-vendas') && (document.getElementById('modal-total-custo-vendas').textContent = formatCurrencyBR(dados.total_custo || 0));
        document.getElementById('modal-lucro-total-vendas') && (document.getElementById('modal-lucro-total-vendas').textContent = formatCurrencyBR(dados.lucro_total || 0));
    } catch (error) {
        console.error('Erro ao carregar modal lucro vendas:', error);
    }
}

async function carregarModalLucroAssistencias(dataInicio, dataFim) {
    try {
        const res = await apiFetch(`/obter_lucro_assistencias_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        if (!res.ok) throw new Error('Erro obter lucro assistencias');
        const dados = await res.json();

        document.getElementById('modal-periodo-lucro-assistencias') && (document.getElementById('modal-periodo-lucro-assistencias').textContent = `${formatarDataLong(dataInicio)} à ${formatarDataLong(dataFim)}`);
        document.getElementById('modal-total-servicos-lucro') && (document.getElementById('modal-total-servicos-lucro').textContent = formatCurrencyBR(dados.total_servicos || 0));
        document.getElementById('modal-total-custo-assistencias') && (document.getElementById('modal-total-custo-assistencias').textContent = formatCurrencyBR(dados.total_custo || 0));
        document.getElementById('modal-lucro-total-assistencias') && (document.getElementById('modal-lucro-total-assistencias').textContent = formatCurrencyBR(dados.lucro_total || 0));
    } catch (error) {
        console.error('Erro ao carregar modal lucro assistências:', error);
    }
}

async function carregarModalLucroTotal(dataInicio, dataFim) {
    try {
        const vendasRes = await apiFetch(`/obter_lucro_vendas_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const vendas = vendasRes.ok ? await vendasRes.json() : { lucro_total: 0 };

        const assistRes = await apiFetch(`/obter_lucro_assistencias_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const assists = assistRes.ok ? await assistRes.json() : { lucro_total: 0 };

        document.getElementById('modal-periodo-lucro-total') && (document.getElementById('modal-periodo-lucro-total').textContent = `${formatarDataLong(dataInicio)} à ${formatarDataLong(dataFim)}`);
        document.getElementById('modal-lucro-vendas-total') && (document.getElementById('modal-lucro-vendas-total').textContent = formatCurrencyBR(vendas.lucro_total || 0));
        document.getElementById('modal-lucro-assistencias-total') && (document.getElementById('modal-lucro-assistencias-total').textContent = formatCurrencyBR(assists.lucro_total || 0));
        document.getElementById('modal-lucro-total-geral') && (document.getElementById('modal-lucro-total-geral').textContent = formatCurrencyBR((vendas.lucro_total || 0) + (assists.lucro_total || 0)));
    } catch (error) {
        console.error('Erro ao carregar modal lucro total:', error);
    }
}

/* ---- Modal TOTAL (resumo soma vendas+assistencias) ---- */
async function carregarModalTotal(dataInicio, dataFim) {
    try {
        // Reaproveita endpoints de vendas/assistências para montar o total detalhado
        const vendasRes = await apiFetch(`/obter_resumo_vendas_concluidas_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const vendas = vendasRes.ok ? await vendasRes.json() : { total_geral: 0 };

        const assistRes = await apiFetch(`/obter_resumo_assistencias_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        const assists = assistRes.ok ? await assistRes.json() : { total_geral: 0 };

        // Atualizar modal (tem ids: modal-periodo? para vendas já usamos; para total usamos => id 'modal-periodo-lucro-total' ou 'modal-periodo' dependendo do modal)
        const periodoEl = document.getElementById('modal-periodo') || document.getElementById('modal-periodo-lucro-total');
        if (periodoEl) periodoEl.textContent = `${formatarDataLong(dataInicio)} à ${formatarDataLong(dataFim)}`;

        // Preencher campos de total-modal (se existirem)
        // total-modal contém ids: modal-lucro-vendas-total/modal-lucro-assistencias-total/modal-lucro-total-geral
        // Mas para o 'total-modal' (Total Geral) nós mostramos soma de vendas + assistências:
        const totalGeral = Number(vendas.total_geral || 0) + Number(assists.total_geral || 0);
        const totalEl = document.getElementById('total-amount');
        if (totalEl) totalEl.textContent = formatNumberBR(totalGeral);

    } catch (error) {
        console.error('Erro ao carregar modal total:', error);
    }
}

/* ---- Modal RESUMO DE VENDEDORES ---- */
async function carregarModalVendedores(dataInicio, dataFim) {
    try {
        const res = await apiFetch(`/obter_lucro_vendedores_periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
        if (!res.ok) throw new Error('Erro ao obter resumo de vendedores');
        const vendedores = await res.json();

        const modal = document.getElementById('sellers-summary-modal');
        if (!modal) return;

        // Atualizar período
        const periodoEl = modal.querySelector('.border-b .font-medium');
        if (periodoEl) periodoEl.textContent = `${formatarDataLong(dataInicio)} à ${formatarDataLong(dataFim)}`;

        // Encontrar o container onde os vendedores serão listados
        const p4s = modal.querySelectorAll('.modal-content > .p-4');
        let listContainer = null;
        if (p4s && p4s.length >= 2) listContainer = p4s[1];
        else listContainer = modal.querySelector('.modal-content');

        if (listContainer) {
            // Limpar itens existentes (exceto o título e período)
            const existingItems = listContainer.querySelectorAll('.seller-item');
            existingItems.forEach(item => item.remove());

            let lucroTotalEquipe = 0;
            let brutoTotalEquipe = 0;
            let qtdTotalVendas = 0;
            let qtdTotalAssistencias = 0;

            // Adicionar cada vendedor
            vendedores.forEach(vendedor => {
                lucroTotalEquipe += Number(vendedor.lucro_total || 0);
                brutoTotalEquipe += Number(vendedor.total_vendas || 0) + Number(vendedor.total_assistencias || 0);
                qtdTotalVendas += Number(vendedor.qtd_vendas || 0);
                qtdTotalAssistencias += Number(vendedor.qtd_assistencias || 0);

                const brutoTotal = (vendedor.total_vendas || 0) + (vendedor.total_assistencias || 0);

                const item = document.createElement('div');
                item.className = 'seller-item flex justify-between items-start mb-4 p-3 bg-gray-50 rounded-lg';
                
                item.innerHTML = `
                    <div class="flex-1">
                        <span class="font-medium text-gray-700 block">${vendedor.vendedor || 'Não informado'}</span>
                        <div class="text-sm text-gray-500 mt-1">
                            <div>Vendas: ${vendedor.qtd_vendas || 0} (${formatCurrencyBR(vendedor.total_vendas || 0)})</div>
                            <div>Assistências: ${vendedor.qtd_assistencias || 0} (${formatCurrencyBR(vendedor.total_assistencias || 0)})</div>
                            <div class="font-medium text-blue-600 mt-1">
                                Bruto Total: ${formatCurrencyBR(brutoTotal)}
                            </div>
                        </div>
                    </div>
                    <div class="text-right ml-4">
                        <span class="font-medium text-gray-700 block">Lucro Total</span>
                        <div class="text-xs text-gray-500 mt-1">
                            Lucro.Vendas: ${formatCurrencyBR(vendedor.lucro_vendas || 0)}<br>
                            Lucro.Assist: ${formatCurrencyBR(vendedor.lucro_assistencias || 0)}
                        </div>
                        <span class="font-bold text-green-600 block text-lg">${formatCurrencyBR(vendedor.lucro_total || 0)}</span>
                    </div>
                `;
                listContainer.appendChild(item);
            });

            // Atualizar total da equipe
            const totalDiv = document.createElement('div');
            totalDiv.className = 'seller-item payment-total flex justify-between items-center mt-6 p-3 bg-blue-50 rounded-lg';
            totalDiv.innerHTML = `
                <div class="text-left">
                    <span class="font-medium text-gray-700 block">Total da Equipe</span>
                    <span class="font-bold text-blue-600">Bruto: ${formatCurrencyBR(brutoTotalEquipe)}</span>
                    <div class="text-xs text-gray-500 mt-1">
                        ${qtdTotalVendas} vendas + ${qtdTotalAssistencias} assistências
                    </div>
                </div>
                <div class="text-right">
                    <span class="font-bold text-green-600 block text-lg">Lucro: ${formatCurrencyBR(lucroTotalEquipe)}</span>
                </div>
            `;
            listContainer.appendChild(totalDiv);

            // Atualizar contador no cartão principal
            const sellersCountEl = document.getElementById('sellers-count');
            if (sellersCountEl) {
                sellersCountEl.textContent = vendedores.length;
            }
        }

    } catch (error) {
        console.error('Erro ao carregar modal de vendedores:', error);
        
        // Fallback para dados estáticos em caso de erro
        const sellersCountEl = document.getElementById('sellers-count');
        if (sellersCountEl) {
            sellersCountEl.textContent = '0';
        }
    }
}

// ============================
//  REDIRECIONAMENTO PENDENTES - VERSÃO SIMPLES
// ============================
document.addEventListener('DOMContentLoaded', function() {
    // Encontrar as divs pelo texto
    const divs = document.querySelectorAll('.payment-method');
    
    divs.forEach(div => {
        if (div.textContent.includes('Vendas Pendentes')) {
            div.style.cursor = 'pointer';
            div.title = 'Clique para ver Vendas Pendentes';
            div.addEventListener('click', function() {
                window.location.href = 'tabelas/tbvendas.html';
            });
        }
        
        if (div.textContent.includes('Assistências Pendentes')) {
            div.style.cursor = 'pointer';
            div.title = 'Clique para ver Assistências Pendentes';
            div.addEventListener('click', function() {
                window.location.href = 'tabelas/tbassistencia.html';
            });
        }
    });
});