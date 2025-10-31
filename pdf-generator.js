

// Verificar e aguardar pelas bibliotecas
function aguardarBibliotecasPDF(callback) {
    const maxTentativas = 10;
    let tentativas = 0;
    
    function verificar() {
        tentativas++;
        
        // Verificar se jspdf está disponível (pode ser jspdf ou jsPDF)
        const jspdfDisponivel = typeof jspdf !== 'undefined' || 
                                (window.jspdf && window.jspdf.jsPDF) || 
                                typeof jsPDF !== 'undefined';
        
        const html2canvasDisponivel = typeof html2canvas !== 'undefined';
        
    
        
        if (jspdfDisponivel && html2canvasDisponivel) {
            
            callback(true);
        } else if (tentativas >= maxTentativas) {
            console.error("❌ Timeout: Bibliotecas não carregadas após " + maxTentativas + " tentativas");
            callback(false);
        } else {
            setTimeout(verificar, 500);
        }
    }
    
    verificar();
}

// Inicializar apenas quando as bibliotecas estiverem prontas
aguardarBibliotecasPDF(function(sucesso) {
    if (!sucesso) {
        console.error("❌ PDF Generator não pode ser inicializado");
        return;
    }
    
    
    const pdfGenerator = {};

    // ======================================
    // CUPOM FISCAL - ESTILO PROFISSIONAL
    // ======================================
    function gerarHtmlCupom(dados, tipo) {
        const now = new Date();
        const dataHora = now.toLocaleString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const garantia = dados.garantia ? `${dados.garantia} dias` : '-';
        const vendedor = dados.nome_vendedor || '-';
        const telefone = dados.telefone_cliente || '-';
        const descricao = dados.descricao_produto || '-';
        const valor = (typeof dados.valor_total !== 'undefined')
            ? Number(dados.valor_total).toFixed(2)
            : '-';

        function traduzirForma(forma) {
            if (!forma) return '-';
            const map = {
                'cash': 'Dinheiro',
                'card': 'Cartão',
                'pix': 'Pix',
                'voucher': 'Vale',
                'cash_card': 'Dinheiro + Cartão',
                'cash_pix': 'Dinheiro + Pix',
                'card_pix': 'Cartão + Pix'
            };
            return map[forma] || forma;
        }

        return `
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">

<div id="__cupom_preview"
      style="width:200px; font-family:'Roboto Mono', monospace; color:#000;
            padding:4px; font-size:8px; line-height:1.2; word-wrap:break-word;
            letter-spacing:0.2px;">

    <!-- Cabeçalho -->
    <div style="text-align:center; margin-bottom:2px;">
        <div style="font-weight:700; font-size:10px;">TECH STORE</div>
        <div style="font-size:7px; color:#333;">------------------------------------</div>
        <div style="font-size:7px; margin-top:1px; letter-spacing:0.5px;">
            CUPOM FISCAL - ${tipo === 'venda' ? 'VENDA' : 'ASSISTÊNCIA'}
        </div>
        <div style="font-size:7px; color:#333;">------------------------------------</div>
    </div>

    <!-- Corpo -->
    <div style="font-size:8px;">
        <div><strong>CLIENTE:</strong> ${dados.nome_cliente || '-'}</div>
        <div style="margin-top:2px;"><strong>DESCRIÇÃO:</strong></div>
        <div>${descricao}</div>
        <div style="margin-top:2px;"><strong>FORMA:</strong> ${traduzirForma(dados.forma_pagamento)}</div>
    </div>

    <!-- Total -->
    <div style="margin-top:6px; border-top:1px dashed #000; border-bottom:1px dashed #000; padding:3px 0;">
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:9px;">
            <span>TOTAL</span>
            <span>R$ ${valor}</span>
        </div>
    </div>

    <!-- Garantia e vendedor -->
    <div style="margin-top:3px; font-size:7px;">
        <div><strong>GARANTIA:</strong> ${garantia}</div>
        <div><strong>VENDEDOR:</strong> ${vendedor}</div>
        <div><strong>TELEFONE:</strong>31 99726-2119</div>
        <div><strong>ENDEREÇO:</strong>Shoping Oiapoque: Portaria:2, Box:Pi26/27</div>
    </div>

    <div style="font-size:7px; color:#333;">------------------------------------</div>

    <!-- Rodapé -->
    <div style="font-size:6px; text-align:center;">
        <div>EMITIDO: ${dataHora}</div>
        <div style="font-weight:700;">OBRIGADO PELA PREFERÊNCIA!!!</div>

        <div style="margin-top:3px; text-align:justify;">
            CERTIFICAMOS QUE O PRODUTO FOI VERIFICADO E ENCONTRA-SE EM PERFEITAS
            CONDIÇÕES. ESTA GARANTIA COBRE DEFEITOS DE FABRICAÇÃO, EXCLUINDO DANOS
            POR MAU USO, QUEDA, ARRANHÕES, UMIDADE OU INTERVENÇÃO NÃO AUTORIZADA.
            ESTE DOCUMENTO É OBRIGATÓRIO PARA ANÁLISE TÉCNICA.
        </div>
    </div>
</div>
`;
    }

    // ======================================
    // CUPOM DE ASSISTÊNCIA - CORRIGIDO
    // ======================================
    function gerarHtmlAssistencia(dados) {
        const now = new Date();
        const dataHora = now.toLocaleString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const garantia = dados.periodo_garantia ? `${dados.periodo_garantia} dias` : '-';
        const vendedor = dados.nome_vendedor || '-';
        const telefone = dados.telefone_cliente || '-';
        const aparelho = `${dados.marca_aparelho || ''} ${dados.modelo_aparelho || ''}`.trim();
        const defeito = dados.descricao_defeito || '-';
        const servico = dados.servico_realizar || '-';
        const valor = (typeof dados.valor_servico !== 'undefined')
            ? Number(dados.valor_servico).toFixed(2)
            : '-';

        function traduzirForma(forma) {
            if (!forma) return '-';
            const map = {
                cash: 'Dinheiro',
                card: 'Cartão',
                pix: 'Pix',
                voucher: 'Vale',
                cash_card: 'Dinheiro + Cartão',
                cash_pix: 'Dinheiro + Pix',
                card_pix: 'Cartão + Pix'
            };
            return map[forma] || forma;
        }

        // Traduzir checklist para texto legível
        function traduzirChecklist(checklist) {
            if (!checklist) return '';

            const traducoes = {
                aparelho_liga: 'Aparelho liga',
                tela_quebrada: 'Tela quebrada',
                exibe_imagem: 'Exibe imagem',
                camera_funciona: 'Câmera funciona',
                wifi_bluetooth: 'Wi-Fi/Bluetooth',
                som_funciona: 'Som funciona',
                botoes_funcionam: 'Botões funcionam',
                dano_liquido: 'Dano por líquido',
                outra_assistencia: 'Outra assistência',
                gaveta_sim: 'Gaveta de SIM',
                com_capinha: 'Com capinha'
            };

            let resultado = '';
            for (const [chave, valor] of Object.entries(checklist)) {
                if (valor && valor !== 'nao') {
                    const texto = traducoes[chave] || chave;
                    const status = valor === 'sim' ? '✅' :
                        valor === 'impossivel' ? '⚠️' : '❌';
                    resultado += `${status} ${texto}\n`;
                }
            }

            // ADICIONANDO OS CAMPOS COM VALOR "NÃO"
            for (const [chave, valor] of Object.entries(checklist)) {
                if (valor === 'nao') {
                    const texto = traducoes[chave] || chave;
                    resultado += `❌ ${texto}\n`;
                }
            }

            return resultado || 'Nenhuma observação';
        }

        const checklistTexto = dados.checklist ? traduzirChecklist(dados.checklist) : '';

        return `
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet">

<div id="__cupom_assistencia"
     style="width:200px; font-family:'Roboto Mono', monospace; color:#000;
            padding:4px; font-size:8px; line-height:1.2; word-wrap:break-word;
            letter-spacing:0.2px;">

    <!-- Cabeçalho -->
    <div style="text-align:center; margin-bottom:2px;">
        <div style="font-weight:700; font-size:10px;">TECHSTORE</div>
        <div style="font-size:7px; color:#333;">------------------------------------</div>
        <div style="font-size:7px; margin-top:1px; letter-spacing:0.5px;">
            CUPOM FISCAL - ASSISTÊNCIA TÉCNICA
        </div>
        <div style="font-size:7px; color:#333;">------------------------------------</div>
    </div>

    <!-- Informações do Cliente -->
    <div style="font-size:8px; margin-bottom:4px;">
        <div><strong>CLIENTE:</strong> ${dados.nome_cliente || '-'}</div>
    </div>

    <!-- Informações do Aparelho -->
    <div style="font-size:8px; margin-bottom:4px;">
        <div><strong>APARELHO:</strong> ${aparelho}</div>
        <div><strong>DEFEITO:</strong> ${defeito}</div>
        <div><strong>SERVIÇO:</strong> ${servico}</div>
    </div>

    <!-- Checklist -->
    <div style="font-size:7px; margin-bottom:4px; background:#f5f5f5; padding:3px; border-radius:2px;">
        <div style="font-weight:700; margin-bottom:1px;">CHECKLIST:</div>
        <div style="white-space:pre-line;">${checklistTexto}</div>
    </div>

    <!-- Valor -->
    <div style="margin-top:6px; border-top:1px dashed #000; border-bottom:1px dashed #000; padding:3px 0;">
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:9px;">
            <span>VALOR DO SERVIÇO</span>
            <span>R$ ${valor}</span>
        </div>
    </div>

    <!-- Pagamento e Garantia -->
    <div style="margin-top:3px; font-size:7px;">
        <div><strong>FORMA PAGAMENTO:</strong> ${traduzirForma(dados.forma_pagamento)}</div>
        <div><strong>GARANTIA:</strong> ${garantia}</div>
        <div><strong>VENDEDOR:</strong> ${vendedor}</div>
    </div>

    <div style="font-size:7px; color:#333; margin:4px 0;">------------------------------------</div>

    <!-- Contato -->
    <div style="font-size:6px; margin-bottom:3px;">
        <div><strong>TELEFONE:</strong> 31 99726-2119</div>
        <div><strong>ENDEREÇO:</strong> Shopping Oiapoque - Portaria 2 - Box PI26/27</div>
    </div>

    <!-- Rodapé -->
    <div style="font-size:6px; text-align:center;">
        <div>EMITIDO: ${dataHora}</div>
        <div style="font-weight:700; margin:2px 0;">OBRIGADO PELA CONFIANÇA!</div>

        <div style="margin-top:3px; text-align:justify;">
            CERTIFICAMOS QUE O APARELHO FOI RECEBIDO PARA ANÁLISE E REPARO. 
            ESTA GARANTIA COBRE APENAS O SERVIÇO REALIZADO, EXCLUINDO 
            DANOS CAUSADOS POR MAU USO, QUEDAS, OXIDAÇÃO OU INTERVENÇÕES 
            NÃO AUTORIZADAS. ESTE DOCUMENTO É NECESSÁRIO PARA QUALQUER 
            RECLAMAÇÃO OU REPARO DENTRO DO PRAZO DE GARANTIA.
        </div>
    </div>
</div>
`;
    }

    // ======================================
    // FUNÇÕES AUXILIARES
    // ======================================
    function traduzirForma(forma) {
        if (!forma) return '-';
        const map = {
            cash: 'Dinheiro',
            card: 'Cartão',
            pix: 'Pix',
            voucher: 'Vale',
            cash_card: 'Dinheiro + Cartão',
            cash_pix: 'Dinheiro + Pix',
            card_pix: 'Cartão + Pix'
        };
        return map[forma] || forma;
    }

    // Gera PDF e retorna Promise com { blob, url }
    function gerarPdfBlobFromHtml(htmlString) {
        return new Promise((resolve, reject) => {
            // criar container temporário invisível
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            container.innerHTML = htmlString;
            document.body.appendChild(container);

            // usar html2canvas pra capturar
            html2canvas(container, { scale: 2, useCORS: true }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const PDFClass = window.jsPDF || (window.jspdf && window.jspdf.jsPDF);
                const pdf = new PDFClass({ unit: 'px', format: [canvas.width, canvas.height] });

                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

                // Gerar blob
                const arrayBuf = pdf.output('arraybuffer');
                const blob = new Blob([arrayBuf], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);

                // limpar
                document.body.removeChild(container);
                resolve({ blob, url });
            }).catch(err => {
                if (container.parentNode) document.body.removeChild(container);
                reject(err);
            });
        });
    }

    // Converte blob para base64
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Abre modal para selecionar contato
    function abrirModalSelecaoContato(blob, dados, tipo, onClose) {
        const modalContato = document.createElement('div');
        modalContato.id = '__modal_selecao_contato';
        modalContato.innerHTML = `
            <div style="position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:10000;">
                <div style="width:400px; max-width:95%; background:#fff; border-radius:8px; padding:20px; box-shadow:0 6px 18px rgba(0,0,0,0.2);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <strong style="font-size:18px;">Enviar PDF por WhatsApp</strong>
                        <button id="__fechar_contato_btn" style="background:#eee; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">✕</button>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                        <label style="display:block; margin-bottom:8px; font-weight:500;">Número do WhatsApp:</label>
                        <input id="__numero_whatsapp" type="tel" 
                               placeholder="55 + DDD + Número (ex: 5511999999999)"
                               style="width:100%; padding:12px; border:1px solid #ddd; border-radius:6px; font-size:14px;"
                               value="${dados.telefone_cliente ? dados.telefone_cliente.replace(/\D/g, '') : ''}">
                        <small style="color:#666; margin-top:4px; display:block;">
                            Formato: 55 + DDD + Número (sem espaços ou caracteres especiais)
                        </small>
                    </div>

                    <div style="margin-bottom:16px;">
                        <label style="display:block; margin-bottom:8px; font-weight:500;">Mensagem (opcional):</label>
                        <textarea id="__mensagem_whatsapp" 
                                  placeholder="Digite uma mensagem personalizada..."
                                  style="width:100%; padding:12px; border:1px solid #ddd; border-radius:6px; font-size:14px; min-height:80px; resize:vertical;"
                                  >Segue o cupom fiscal da sua ${tipo === 'venda' ? 'compra' : 'assistência'}. Obrigado!</textarea>
                    </div>

                    <div style="display:flex; gap:12px; justify-content:flex-end;">
                        <button id="__cancelar_envio_btn" style="padding:12px 20px; border-radius:6px; border:1px solid #ddd; background:#fff; cursor:pointer;">Cancelar</button>
                        <button id="__enviar_pdf_btn" style="padding:12px 20px; border-radius:6px; border:none; background:#25D366; color:#fff; cursor:pointer; font-weight:500;">
                            📤 Enviar PDF
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalContato);

        // Event listeners
        modalContato.querySelector('#__fechar_contato_btn').addEventListener('click', () => {
            modalContato.remove();
        });

        modalContato.querySelector('#__cancelar_envio_btn').addEventListener('click', () => {
            modalContato.remove();
        });

        modalContato.querySelector('#__enviar_pdf_btn').addEventListener('click', async () => {
            const numeroInput = modalContato.querySelector('#__numero_whatsapp').value.trim();
            const mensagem = modalContato.querySelector('#__mensagem_whatsapp').value.trim();

            if (!numeroInput) {
                alert('Por favor, informe o número do WhatsApp.');
                return;
            }

            // Validar número (formato internacional: 5511999999999)
            const numeroLimpo = numeroInput.replace(/\D/g, '');
            if (numeroLimpo.length < 10) {
                alert('Número de WhatsApp inválido. Use o formato: DDD + Número');
                return;
            }

            try {
                // Baixar automaticamente o PDF antes de abrir o WhatsApp
                const nomeArquivo = `cupom_${(new Date()).toISOString().slice(0, 19).replace(/[:T]/g, '-')}.pdf`;
                const linkDownload = document.createElement('a');
                linkDownload.href = URL.createObjectURL(blob);
                linkDownload.download = nomeArquivo;
                document.body.appendChild(linkDownload);
                linkDownload.click();
                linkDownload.remove();

                // Espera 1 segundo para garantir o download
                await new Promise(r => setTimeout(r, 1000));

                // Converter PDF para base64
                const base64PDF = await blobToBase64(blob);

                // Preparar mensagem
                const mensagemCodificada = encodeURIComponent(mensagem || `Segue o cupom fiscal da sua ${tipo === 'venda' ? 'compra' : 'assistência'}. Obrigado!`);

                // Abrir WhatsApp
                const waUrl = `https://api.whatsapp.com/send?phone=${numeroLimpo}&text=${mensagemCodificada}`;
                window.open(waUrl, '_blank');

                // Fechar modais
                modalContato.remove();
                const modalPrincipal = document.getElementById('__modal_cupom_pdf');
                if (modalPrincipal) modalPrincipal.remove();

                if (onClose) onClose('whatsapp_pdf');

                // Aviso amigável
                setTimeout(() => {
                    alert('✅ O PDF foi baixado automaticamente.\nAgora, no WhatsApp Web, clique no clipe (📎) → "Documento" → selecione o arquivo baixado para enviar.');
                }, 1000);

            } catch (error) {
                console.error('Erro ao enviar PDF:', error);
                alert('Erro ao preparar envio do PDF. Tente novamente.');
            }
        });

        // Fechar modal ao clicar fora
        modalContato.addEventListener('click', (e) => {
            if (e.target === modalContato) {
                modalContato.remove();
            }
        });
    }

    // ======================================
    // FUNÇÃO PRINCIPAL PARA ASSISTÊNCIA
    // ======================================
    pdfGenerator.abrirModalAssistencia = async function (dados, onClose = null) {
        console.log("🎬 Iniciando abrirModalAssistencia...");
        
        // Verificar novamente no momento do uso
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            alert("❌ Biblioteca jsPDF não encontrada");
            return;
        }
        
        if (typeof html2canvas === 'undefined') {
            alert("❌ Biblioteca html2canvas não encontrada");
            return;
        }

        try {
            const html = gerarHtmlAssistencia(dados);
            const { blob, url } = await gerarPdfBlobFromHtml(html);

            // Mostrar modal de visualização
            let modal = document.getElementById('__modal_cupom_pdf');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = '__modal_cupom_pdf';
                modal.innerHTML = `
                <div style="position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:9999;">
                  <div style="width:420px; max-width:95%; background:#fff; border-radius:8px; padding:16px; box-shadow:0 6px 18px rgba(0,0,0,0.2);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                      <strong style="font-size:18px;">Cupom de Assistência</strong>
                      <button id="__fechar_cupom_btn" style="background:#eee; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">✕</button>
                    </div>
                    <div id="__cupom_preview_container" style="overflow:auto; max-height:400px; padding-bottom:8px; margin-bottom:12px; border:1px solid #eee; border-radius:4px;"></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px;">
                      <button id="__baixar_pdf_btn" style="padding:12px; border-radius:6px; border:none; cursor:pointer; background:#0ea5e9; color:#fff; font-weight:500;">📥 Baixar PDF</button>
                      <button id="__imprimir_pdf_btn" style="padding:12px; border-radius:6px; border:none; cursor:pointer; background:#10b981; color:#fff; font-weight:500;">🖨️ Imprimir</button>
                      <button id="__whatsapp_pdf_btn" style="padding:12px; border-radius:6px; border:none; cursor:pointer; background:#128C7E; color:#fff; font-weight:500;">📤 Enviar WhatsApp</button>
                    </div>
                  </div>
                </div>
              `;
                document.body.appendChild(modal);

                modal.querySelector('#__fechar_cupom_btn').addEventListener('click', () => {
                    modal.remove();
                    if (onClose) onClose('fechar');
                });
            }

            const previewContainer = modal.querySelector('#__cupom_preview_container');
            previewContainer.innerHTML = html;

            // Baixar PDF
            modal.querySelector('#__baixar_pdf_btn').onclick = () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = `assistencia_${Date.now()}.pdf`;
                a.click();
                if (onClose) onClose('baixar');
                modal.remove();
            };

            // Imprimir
            modal.querySelector('#__imprimir_pdf_btn').onclick = () => {
                window.open(url, '_blank');
                if (onClose) onClose('imprimir');
                modal.remove();
            };

            // Enviar WhatsApp
            modal.querySelector('#__whatsapp_pdf_btn').onclick = () => {
                abrirModalSelecaoContato(blob, dados, 'assistencia', onClose);
            };

        } catch (err) {
            console.error('Erro ao gerar PDF de assistência:', err);
            alert('Erro ao gerar PDF da assistência. Veja o console.');
        }
    };

    // ======================================
    // FUNÇÃO PRINCIPAL PARA VENDA
    // ======================================
    pdfGenerator.abrirModalCupom = async function (dados, tipo = 'venda', onClose = null) {
        console.log("🎬 Iniciando abrirModalCupom...");
        
        // Verificar novamente no momento do uso
        if (typeof jspdf === 'undefined' && typeof jsPDF === 'undefined') {
            alert("❌ Biblioteca jsPDF não encontrada");
            return;
        }
        
        if (typeof html2canvas === 'undefined') {
            alert("❌ Biblioteca html2canvas não encontrada");
            return;
        }

        try {
            const html = gerarHtmlCupom(dados, tipo);
            const { blob, url } = await gerarPdfBlobFromHtml(html);

            // criar modal (se já existir, só atualizar)
            let modal = document.getElementById('__modal_cupom_pdf');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = '__modal_cupom_pdf';
                modal.innerHTML = `
                  <div style="position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:9999;">
                    <div style="width:420px; max-width:95%; background:#fff; border-radius:8px; padding:16px; box-shadow:0 6px 18px rgba(0,0,0,0.2);">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <strong style="font-size:18px;">Cupom Fiscal - Opções</strong>
                        <button id="__fechar_cupom_btn" style="background:#eee; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">✕</button>
                      </div>
                      <div id="__cupom_preview_container" style="overflow:auto; max-height:400px; padding-bottom:8px; margin-bottom:12px; border:1px solid #eee; border-radius:4px;"></div>
                      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:12px;">
                        <button id="__baixar_pdf_btn" style="padding:12px; border-radius:6px; border:none; cursor:pointer; background:#0ea5e9; color:#fff; font-weight:500;">
                          📥 Baixar PDF
                        </button>
                        <button id="__imprimir_pdf_btn" style="padding:12px; border-radius:6px; border:none; cursor:pointer; background:#10b981; color:#fff; font-weight:500;">
                          🖨️ Abrir / Imprimir
                        </button>
                        <button id="__whatsapp_text_btn" style="padding:12px; border-radius:6px; border:none; cursor:pointer; background:#25D366; color:#fff; font-weight:500;">
                          💬 Enviar Texto
                        </button>
                        <button id="__whatsapp_pdf_btn" style="padding:12px; border-radius:6px; border:none; cursor:pointer; background:#128C7E; color:#fff; font-weight:500;">
                          📤 Enviar PDF
                        </button>
                      </div>
                    </div>
                  </div>
                `;
                document.body.appendChild(modal);

                // event listeners
                modal.querySelector('#__fechar_cupom_btn').addEventListener('click', () => {
                    modal.remove();
                    if (onClose) onClose('fechar');
                });

                // Fechar modal ao clicar fora
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.remove();
                        if (onClose) onClose('fechar');
                    }
                });
            }

            const previewContainer = modal.querySelector('#__cupom_preview_container');
            previewContainer.innerHTML = html;

            // Baixar PDF
            modal.querySelector('#__baixar_pdf_btn').onclick = () => {
                const a = document.createElement('a');
                a.href = url;
                const nomeArquivo = `cupom_${(new Date()).toISOString().slice(0, 19).replace(/[:T]/g, '-')}.pdf`;
                a.download = nomeArquivo;
                document.body.appendChild(a);
                a.click();
                a.remove();

                // Fechar modal após download E CHAMAR CALLBACK
                setTimeout(() => {
                    modal.remove();
                    if (onClose) onClose('baixar');
                }, 500);
            };

            // Abrir em nova aba (usuário pode imprimir pelo viewer)
            modal.querySelector('#__imprimir_pdf_btn').onclick = () => {
                window.open(url, '_blank');

                // Fechar modal após abrir impressão E CHAMAR CALLBACK
                setTimeout(() => {
                    modal.remove();
                    if (onClose) onClose('imprimir');
                }, 500);
            };

            // Enviar WhatsApp (texto pré-formatado)
            modal.querySelector('#__whatsapp_text_btn').onclick = () => {
                const msgLines = [
                    '📄 *Cupom Fiscal*',
                    `Cliente: ${dados.nome_cliente || '-'}`,
                    `Produto: ${dados.descricao_produto || '-'}`,
                    `Valor: R$ ${(typeof dados.valor_total !== 'undefined') ? Number(dados.valor_total).toFixed(2) : '-'}`,
                    `Garantia: ${dados.garantia || '-'} dias`,
                    `Vendedor: ${dados.nome_vendedor || '-'}`,
                    '',
                    'Obrigado pela preferência! 👋'
                ];
                const texto = encodeURIComponent(msgLines.join('\n'));
                const waUrl = `https://api.whatsapp.com/send?text=${texto}`;
                window.open(waUrl, '_blank');

                // Fechar modal após abrir WhatsApp E CHAMAR CALLBACK
                setTimeout(() => {
                    modal.remove();
                    if (onClose) onClose('whatsapp');
                }, 500);
            };

            // Enviar PDF por WhatsApp
            modal.querySelector('#__whatsapp_pdf_btn').onclick = () => {
                abrirModalSelecaoContato(blob, dados, tipo, onClose);
            };

            // mostrar modal (se já estiver no DOM, garantir visível)
            modal.style.display = 'block';
            modal.querySelector('#__cupom_preview_container').scrollTop = 0;

        } catch (err) {
            console.error('Erro ao gerar cupom/PDF:', err);
            alert('Erro ao gerar cupom. Veja console para mais detalhes.');
            if (onClose) onClose('erro');
        }
    };

    // expondo global
    window.pdfGenerator = pdfGenerator;

});