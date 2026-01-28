document.addEventListener("DOMContentLoaded", function () {
    
    // ==========================================
    // MENU LATERAL
    // ==========================================
    const sideMenu = document.getElementById('side-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const aboutModal = document.getElementById('aboutModal');
    const menuQuemSomos = document.getElementById('menu-quem-somos');
    const menuInicialLink = document.getElementById('menu-inicial-link');

    function toggleMenu(show) {
        if (show) sideMenu.classList.add('active');
        else sideMenu.classList.remove('active');
    }

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(true); });
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => toggleMenu(false));
    
    // Fechar menu ao clicar em "MENU INICIAL" e navegar para o link
    if (menuInicialLink) {
        menuInicialLink.addEventListener('click', (e) => {
            toggleMenu(false);
        });
    }
    
    document.addEventListener('click', (e) => {
        if (sideMenu && sideMenu.classList.contains('active') && !sideMenu.contains(e.target) && e.target !== mobileMenuBtn) {
            toggleMenu(false);
        }
    });

        // Initialize stylable datepicker for the 'DATA DA ENTREGA' field
        if (window.flatpickr) {
            const dataInput = document.querySelector('#data');
            const horarioInput = document.querySelector('#horario');

            if (dataInput) dataInput.readOnly = true; // prevent typing, only allow selection
            if (horarioInput) horarioInput.readOnly = true; // prevent typing, only allow picker

            // Date picker: DD/MM/AA (two-digit year)
            flatpickr('#data', {
                locale: 'pt',
                dateFormat: 'd/m/y', // two-digit year as requested (DD/MM/AA)
                allowInput: false,
                appendTo: document.body,
                clickOpens: true,
                position: 'below',
                closeOnSelect: true
            });

            // Time picker: custom looping hour/minute selector (no scrollbars, no blank space)
            if (horarioInput) {
                if (horarioInput._flatpickr) {
                    horarioInput._flatpickr.destroy();
                }

                const timePicker = document.createElement('div');
                timePicker.id = 'custom-time-picker';
                timePicker.style.display = 'none';
                timePicker.innerHTML = `
                    <div class="tp-columns">
                        <div class="tp-column" data-type="hour">
                            <div class="tp-viewport" data-type="hour-viewport"></div>
                        </div>
                        <div class="tp-column" data-type="minute">
                            <div class="tp-viewport" data-type="min-viewport"></div>
                        </div>
                    </div>
                `;
                document.body.appendChild(timePicker);

                const hourValues = Array.from({length:24}, (_,i) => String(i).padStart(2,'0'));
                const minValues = Array.from({length:60}, (_,i) => String(i).padStart(2,'0'));

                let selectedHourIdx = 0;
                let selectedMinIdx = 0;

                const hourViewport = timePicker.querySelector('[data-type="hour-viewport"]');
                const minViewport = timePicker.querySelector('[data-type="min-viewport"]');

                // render visible window (5 items: 2 above, selected, 2 below)
                function renderViewport(values, selectedIdx, viewport) {
                    const total = values.length;
                    const lines = 5;
                    const half = Math.floor(lines/2);
                    viewport.innerHTML = '';
                    for (let i = -half; i <= half; i++) {
                        const idx = (selectedIdx + i + total) % total;
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'tp-item';
                        btn.dataset.idx = idx;
                        btn.textContent = values[idx];
                        if (i === 0) btn.classList.add('selected');
                        viewport.appendChild(btn);
                    }
                }

                function updateAll() {
                    renderViewport(hourValues, selectedHourIdx, hourViewport);
                    renderViewport(minValues, selectedMinIdx, minViewport);
                }

                function closeTimePicker() {
                    timePicker.style.display = 'none';
                    document.removeEventListener('click', outsideClickHandler);
                }

                function outsideClickHandler(e) {
                    if (!timePicker.contains(e.target) && e.target !== horarioInput) closeTimePicker();
                }

                horarioInput.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // set selections from current value if present
                    const cur = horarioInput.value.split(':');
                    if (cur.length === 2) {
                        const h = cur[0].padStart(2,'0');
                        const m = cur[1].padStart(2,'0');
                        const hi = hourValues.indexOf(h);
                        const mi = minValues.indexOf(m);
                        if (hi >= 0) selectedHourIdx = hi;
                        if (mi >= 0) selectedMinIdx = mi;
                    }
                    updateAll();

                    const rect = horarioInput.getBoundingClientRect();
                    timePicker.style.position = 'absolute';
                    timePicker.style.left = (rect.left + window.pageXOffset) + 'px';
                    timePicker.style.top = (rect.bottom + window.pageYOffset + 6) + 'px';
                    timePicker.style.minWidth = Math.max(160, rect.width) + 'px';
                    timePicker.style.display = 'block';
                    document.addEventListener('click', outsideClickHandler);
                });

                // handle item clicks (no arrows)
                timePicker.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const item = e.target.closest('.tp-item');
                    if (item) {
                        const parent = item.closest('.tp-viewport');
                        const idx = parseInt(item.dataset.idx, 10);
                        if (parent === hourViewport) selectedHourIdx = idx;
                        if (parent === minViewport) selectedMinIdx = idx;
                        updateAll();
                        // if both selected, set value and close
                        if (typeof selectedHourIdx === 'number' && typeof selectedMinIdx === 'number') {
                            horarioInput.value = `${hourValues[selectedHourIdx]}:${minValues[selectedMinIdx]}`;
                            closeTimePicker();
                        }
                    }
                });
            }

            // Custom pagamento picker: replace native select with rounded trigger + popup
            const pagamentoSelect = document.querySelector('#pagamento');
            if (pagamentoSelect) {
                // hide native select
                pagamentoSelect.style.display = 'none';

                // create trigger
                const trigger = document.createElement('div');
                trigger.id = 'pagamento-trigger';
                trigger.className = 'custom-select-trigger';
                trigger.tabIndex = 0;
                trigger.textContent = pagamentoSelect.options[pagamentoSelect.selectedIndex].textContent;

                pagamentoSelect.parentNode.insertBefore(trigger, pagamentoSelect);

                // build picker
                const pagPicker = document.createElement('div');
                pagPicker.id = 'custom-pagamento-picker';
                pagPicker.style.display = 'none';
                Array.from(pagamentoSelect.options).forEach(opt => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'pag-item';
                    btn.dataset.value = opt.value;
                    btn.textContent = opt.textContent;
                    if (opt.selected) btn.classList.add('selected');
                    pagPicker.appendChild(btn);
                });
                document.body.appendChild(pagPicker);

                function closePagPicker() {
                    pagPicker.style.display = 'none';
                    document.removeEventListener('click', outsidePagClick);
                }

                function outsidePagClick(e) {
                    if (!pagPicker.contains(e.target) && e.target !== trigger) closePagPicker();
                }

                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const rect = trigger.getBoundingClientRect();
                    pagPicker.style.position = 'absolute';
                    pagPicker.style.left = (rect.left + window.pageXOffset) + 'px';
                    pagPicker.style.top = (rect.bottom + window.pageYOffset + 6) + 'px';
                    pagPicker.style.minWidth = Math.max(180, rect.width) + 'px';
                    pagPicker.style.display = 'block';
                    document.addEventListener('click', outsidePagClick);
                });

                pagPicker.addEventListener('click', (e) => {
                    const btn = e.target.closest('.pag-item');
                    if (!btn) return;
                    // update selection
                    Array.from(pagPicker.querySelectorAll('.pag-item')).forEach(x => x.classList.remove('selected'));
                    btn.classList.add('selected');
                    pagamentoSelect.value = btn.dataset.value;
                    trigger.textContent = btn.textContent;
                    closePagPicker();
                });
            }
        }

    // ==========================================
    // MODAL QUEM SOMOS
    // ==========================================
    function openAboutModal() {
        if (aboutModal) {
            aboutModal.classList.add('show');
            toggleMenu(false);
        }
    }

    function closeAboutModal() {
        if (aboutModal) {
            aboutModal.classList.remove('show');
        }
    }

    if (menuQuemSomos) {
        menuQuemSomos.addEventListener('click', (e) => {
            e.preventDefault();
            openAboutModal();
        });
    }

    window.onclick = (e) => {
        if (e.target == aboutModal) {
            closeAboutModal();
        }
    }

    window.closeAboutModal = closeAboutModal;
    window.openAboutModal = openAboutModal;
    
    // ==========================================
    // NAVEGAÇÃO DE CATEGORIAS (Drag & Click)
    // ==========================================
    const categoriasNav = document.getElementById('categorias-horizontal');
    const categoriasBtns = document.querySelectorAll('.categoria-btn');
    
    // Drag para scroll horizontal
    let isDown = false;
    let startX;
    let scrollLeft;

    categoriasNav.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - categoriasNav.offsetLeft;
        scrollLeft = categoriasNav.scrollLeft;
    });

    categoriasNav.addEventListener('mouseleave', () => {
        isDown = false;
    });

    categoriasNav.addEventListener('mouseup', () => {
        isDown = false;
    });

    categoriasNav.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - categoriasNav.offsetLeft;
        const walk = (x - startX) * 2;
        categoriasNav.scrollLeft = scrollLeft - walk;
    });

    // Touch para mobile/tablet
    categoriasNav.addEventListener('touchstart', (e) => {
        isDown = true;
        startX = e.touches[0].pageX - categoriasNav.offsetLeft;
        scrollLeft = categoriasNav.scrollLeft;
    });

    categoriasNav.addEventListener('touchend', () => {
        isDown = false;
    });

    categoriasNav.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const x = e.touches[0].pageX - categoriasNav.offsetLeft;
        const walk = (x - startX) * 2;
        categoriasNav.scrollLeft = scrollLeft - walk;
    });

    // Clique para ir à categoria
    categoriasBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = btn.getAttribute('data-target');
            const elemento = document.getElementById(target);
            
            if (elemento) {
                // Scroll para o topo da categoria, considerando o header fixo
                const headerHeight = document.querySelector('header').offsetHeight;
                const categoriesNavHeight = document.querySelector('#categorias-nav').offsetHeight;
                const offset = headerHeight + categoriesNavHeight;
                
                const top = elemento.offsetTop - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
                
                // Atualizar classe active
                categoriasBtns.forEach(b => b.classList.remove('active-link'));
                btn.classList.add('active-link');
                
                // Scroll automático da barra de categorias para deixar o botão mais à esquerda
                setTimeout(() => {
                    const container = document.getElementById('categorias-horizontal');
                    const btnRect = btn.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    
                    // Calcula quanto deve rolar para deixar o botão próximo à esquerda
                    // com um pequeno offset (50px) para mostrar um pouco antes
                    const scrollAmount = btn.offsetLeft - container.offsetLeft - 50;
                    
                    container.scrollTo({ left: Math.max(0, scrollAmount), behavior: 'smooth' });
                }, 100);
            }
        });
    });
    
    // ==========================================
    // VARIÁVEL GLOBAL PARA CUPOM
    // ==========================================
    let cupomAplicado = { codigo: null, desconto: 0, mensagem: '' };
    let oldPedidoId = null; // Armazena o ID do pedido antigo para reedição
    
    // =======================================================
    // CONFIGURAÇÃO DO POPUP DE NATAL (PERÍODO CONFIGURÁVEL)
    // =======================================================
    const POPUP_NATAL_CONFIG = {
        dataInicio: '2026-01-26',  // Data de início (YYYY-MM-DD)
        dataFim: '2026-01-28'      // Data de fim (YYYY-MM-DD)
    };
    
    // =======================================================
    // CUPONS GERADOS (USO ÚNICO E VALIDADE: ATÉ 28/02/2026)
    // =======================================================
    const CUPONS_GERADOS = {
        'FAVU09779811427': { descontoTipo: 'percentual', valor: 0.10, aplicaEm: 'total', expiraEm: '2026-02-28', usoUnico: true, usado: false },
        'FAVU07453741408': { descontoTipo: 'percentual', valor: 0.10, aplicaEm: 'total', expiraEm: '2026-02-28', usoUnico: true, usado: false },
        'FAVU10798497424': { descontoTipo: 'percentual', valor: 0.10, aplicaEm: 'total', expiraEm: '2026-02-28', usoUnico: true, usado: false },
        'FAVU53648820478': { descontoTipo: 'percentual', valor: 0.10, aplicaEm: 'total', expiraEm: '2026-02-28', usoUnico: true, usado: false },
        'FAVU08805480452': { descontoTipo: 'percentual', valor: 0.10, aplicaEm: 'total', expiraEm: '2026-02-28', usoUnico: true, usado: false }
    };

    const gruposComMinimoIndividual = ["Doces", "Salgados Fritos", "Salgados Assados", "Salgados Vegetarianos"];
    const MINI_COOKIE_ID = 'mini-cookie';
    
    // -----------------------------------------------------
    // DADOS DOS PRODUTOS
    // -----------------------------------------------------
    const generateId = (nome, tamanho) => {
        let base = nome.toLowerCase().replace(/[^a-z0-9]/g, '-');
        if (tamanho) { base += '-' + tamanho.toLowerCase().replace(/[^a-z0-9]/g, ''); }
        return base.replace(/-+/g, '-').trim('-');
    };
    
    const addGroupKeys = (itens) => {
        return itens.map(item => ({
            ...item,
            groupKey: item.tamanho ? item.nome : item.id
        }));
    };

    const itensBoloTradicional = addGroupKeys([
        { nome: "Bolo de Bem-Casado", tamanho: "P (1.5 KG)", preco: 100.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo de Bem-Casado - P (1.5 KG)", descricaoPopup: ""},
        { nome: "Bolo de Bem-Casado", tamanho: "M (2.5 KG)", preco: 160.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo de Bem-Casado - M (2.5 KG)", descricaoPopup: ""},
        { nome: "Bolo de Bem-Casado", tamanho: "G (3.5 KG)", preco: 220.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo de Bem-Casado - G (3.5 KG)", descricaoPopup: ""},
        { nome: "Bolo de Doce de Leite", tamanho: "P (1.5 KG)", preco: 90.00, min: 1, descricaoItem: "Com Crocante de Amendoim", descricaoResumo: "Bolo de Doce de Leite e Crocante de Amendoim - P (1.5 KG)", descricaoPopup: "Com Crocante de Amendoim"},
        { nome: "Bolo de Doce de Leite", tamanho: "M (2.5 KG)", preco: 150.00, min: 1, descricaoItem: "Com Crocante de Amendoim", descricaoResumo: "Bolo de Doce de Leite e Crocante de Amendoim - M (2.5 KG)", descricaoPopup: "Com Crocante de Amendoim"},
        { nome: "Bolo de Doce de Leite", tamanho: "G (3.5 KG)", preco: 210.00, min: 1, descricaoItem: "Com Crocante de Amendoim", descricaoResumo: "Bolo de Doce de Leite e Crocante de Amendoim - G (3.5 KG)", descricaoPopup: "Com Crocante de Amendoim"},
        { nome: "Bolo de Chocolate", tamanho: "P (1.5 KG)", preco: 90.00, min: 1, descricaoItem: "Com chocolate 50% cacau", descricaoResumo: "Bolo de Chocolate 50% Cacau - P (1.5 KG)", descricaoPopup: "Com chocolate 50% cacau"},
        { nome: "Bolo de Chocolate", tamanho: "M (2.5 KG)", preco: 150.00, min: 1, descricaoItem: "Com chocolate 50% cacau", descricaoResumo: "Bolo de Chocolate 50% Cacau - M (2.5 KG)", descricaoPopup: "Com chocolate 50% cacau"},
        { nome: "Bolo de Chocolate", tamanho: "G (3.5 KG)", preco: 210.00, min: 1, descricaoItem: "Com chocolate 50% cacau", descricaoResumo: "Bolo de Chocolate 50% Cacau - G (3.5 KG)", descricaoPopup: "Com chocolate 50% cacau"},
        { nome: "Bolo de Limão", tamanho: "P (1.5 KG)", preco: 90.00, min: 1, descricaoItem: "Com Chocolate Branco", descricaoResumo: "Bolo de Limão e Chocolate Branco - P (1.5 KG)", descricaoPopup: "Com Chocolate Branco"},
        { nome: "Bolo de Limão", tamanho: "M (2.5 KG)", preco: 150.00, min: 1, descricaoItem: "Com Chocolate Branco", descricaoResumo: "Bolo de Limão e Chocolate Branco - M (2.5 KG)", descricaoPopup: "Com Chocolate Branco"},
        { nome: "Bolo de Limão", tamanho: "G (3.5 KG)", preco: 210.00, min: 1, descricaoItem: "Com Chocolate Branco", descricaoResumo: "Bolo de Limão e Chocolate Branco - G (3.5 KG)", descricaoPopup: "Com Chocolate Branco"},
        { nome: "Bolo de Maracujá", tamanho: "P (1.5 KG)", preco: 90.00, min: 1, descricaoItem: "Com Chocolate Branco", descricaoResumo: "Bolo de Maracujá e Chocolate Branco - P (1.5 KG)", descricaoPopup: "Com Chocolate Branco"},
        { nome: "Bolo de Maracujá", tamanho: "M (2.5 KG)", preco: 150.00, min: 1, descricaoItem: "Com Chocolate Branco", descricaoResumo: "Bolo de Maracujá e Chocolate Branco - M (2.5 KG)", descricaoPopup: "Com Chocolate Branco"},
        { nome: "Bolo de Maracujá", tamanho: "G (3.5 KG)", preco: 210.00, min: 1, descricaoItem: "Com Chocolate Branco", descricaoResumo: "Bolo de Maracujá e Chocolate Branco - G (3.5 KG)", descricaoPopup: "Com Chocolate Branco"},
    ]).map(item => ({...item, id: generateId(item.nome, item.tamanho)}));
    
    const itensBoloEspecial = addGroupKeys([
        { nome: "Cheesecake Tradicional ", tamanho: "2.1 KG", preco: 150.00, min: 1, descricaoItem: "Com Calda de Goiabada", descricaoResumo: "Cheesecake Tradicional | Goiabada- 2.1 KG", descricaoPopup: "Com Calda de Goiabada"},
        { nome: "Cheesecake Tradicional", tamanho: "2.1 KG", preco: 160.00, min: 1, descricaoItem: "Com Calda de Morango", descricaoResumo: "Cheesecake Tradicional | Morango - 2.1 KG", descricaoPopup: "Com Calda de Morango"},
        { nome: "Cheesecake De Doce de leite", tamanho: "2.1 KG", preco: 160.00, min: 1, descricaoItem: "Com Caramelo Salgado", descricaoResumo: "Cheesecake Doce de leite - 2.1 KG", descricaoPopup: "Com Caramelo Salgado"},
        { nome: "Bolo de Ameixa", tamanho: "P (1.5 KG)", preco: 110.00, min: 1, descricaoItem: "Com Chocolate Branco", descricaoResumo: "Bolo de Ameixa e Chocolate Branco - P (1.5 KG)", descricaoPopup: "Com Chocolate Branco"},
        { nome: "Bolo de Ameixa", tamanho: "M (2.5 KG)", preco: 180.00, min: 1, descricaoItem: "Com Chocolate Branco", descricaoResumo: "Bolo de Ameixa e Chocolate Branco - M (2.5 KG)", descricaoPopup: "Com Chocolate Branco"},
        { nome: "Bolo de Ameixa", tamanho: "G (3.5 KG)", preco: 250.00, min: 1, descricaoItem: "Com Chocolate Branco", descricaoResumo: "Bolo de Ameixa e Chocolate Branco - G (3.5 KG)", descricaoPopup: "Com Chocolate Branco"},
        { nome: "Bolo de Café e Doce de Leite", tamanho: "P (1.5 KG)", preco: 110.00, min: 1, descricaoItem: "Com Chocolate Amargo", descricaoResumo: "Bolo de Café Com Doce de Leite e Chocolate Amargo - P (1.5 KG)", descricaoPopup:"Com Chocolate Amargo"},
        { nome: "Bolo de Café e Doce de Leite", tamanho: "M (2.5 KG)", preco: 180.00, min: 1, descricaoItem: "Com Chocolate Amargo", descricaoResumo: "Bolo de Café Com Doce de Leite e Chocolate Amargo - M (2.5 KG)", descricaoPopup:"Com Chocolate Amargo"},
        { nome: "Bolo de Café e Doce de Leite", tamanho: "G (3.5 KG)", preco: 250.00, min: 1, descricaoItem: "Com Chocolate Amargo", descricaoResumo: "Bolo de Café Com Doce de Leite e Chocolate Amargo - G (3.5 KG)", descricaoPopup:"Com Chocolate Amargo"},
        { nome: "Bolo de Chocolate 50%", tamanho: "P (1.5 KG)", preco: 110.00, min: 1, descricaoItem: "Com Morangos", descricaoResumo: "Bolo de Chocolate 50% com Morangos - P (1.5 KG)", descricaoPopup:"Com Morangos"},
        { nome: "Bolo de Chocolate 50%", tamanho: "M (2.5 KG)", preco: 175.00, min: 1, descricaoItem: "Com Morangos", descricaoResumo: "Bolo de Chocolate 50% com Morangos - M (2.5 KG)", descricaoPopup:"Com Morangos"},
        { nome: "Bolo de Chocolate 50%", tamanho: "G (3.5 KG)", preco: 245.00, min: 1, descricaoItem: "Com Morangos", descricaoResumo: "Bolo de Chocolate 50% com Morangos - G (3.5 KG)", descricaoPopup:"Com Morangos"},
        { nome: "Bolo de Delicia de Abacaxi", tamanho: "P (1.5 KG)", preco: 105.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo de Delicia de Abacaxi - P (1.5 KG)", descricaoPopup: ""},
        { nome: "Bolo de Delicia de Abacaxi", tamanho: "M (2.5 KG)", preco: 175.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo de Delicia de Abacaxi - M (2.5 KG)", descricaoPopup: ""},
        { nome: "Bolo de Delicia de Abacaxi", tamanho: "G (3.5 KG)", preco: 245.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo de Delicia de Abacaxi - G (3.5 KG)", descricaoPopup: ""},
        { nome: "Bolo de Morango", tamanho: "P (1.5 KG)", preco: 110.00, min: 1, descricaoItem: "Com Recheio de Brigadeiro Branco e Cobertura de Chantininho", descricaoResumo: "Bolo de Morango com Brigadeiro Branco e Chantinhinho - P (1.5 KG)", descricaoPopup: "Com Recheio de Brigadeiro Branco e Cobertura de Chantininho"},
        { nome: "Bolo de Morango", tamanho: "M (2.5 KG)", preco: 175.00, min: 1, descricaoItem: "Com Recheio de Brigadeiro Branco e Cobertura de Chantininho", descricaoResumo: "Bolo de Morango com Brigadeiro Branco e Chantinhinho - M (2.5 KG)", descricaoPopup: "Com Recheio de Brigadeiro Branco e Cobertura de Chantininho"},
        { nome: "Bolo de Morango", tamanho: "G (3.5 KG)", preco: 245.00, min: 1, descricaoItem: "Com Recheio de Brigadeiro Branco e Cobertura de Chantininho", descricaoResumo: "Bolo de Morango com Brigadeiro Branco e Chantinhinho - G (3.5 KG)", descricaoPopup: "Com Recheio de Brigadeiro Branco e Cobertura de Chantininho"},
        { nome: "Bolo de Ninho trufado", tamanho: "P (1.5 KG)", preco: 110.00, min: 1, descricaoItem: "Com chocolate Branco", descricaoResumo: "Bolo de Ninho trufado - P (1.5 KG)", descricaoPopup: "Com chocolate Branco"},
        { nome: "Bolo de Ninho trufado", tamanho: "M (2.5 KG)", preco: 175.00, min: 1, descricaoItem: "Com chocolate Branco", descricaoResumo: "Bolo de Ninho trufado - M (2.5 KG)", descricaoPopup: "Com chocolate Branco"},
        { nome: "Bolo de Ninho trufado", tamanho: "G (3.5 KG)", preco: 245.00, min: 1, descricaoItem: "Com chocolate Branco", descricaoResumo: "Bolo de Ninho trufado - G (3.5 KG)", descricaoPopup: "Com chocolate Branco"},
        { nome: "Bolo de Noiva", tamanho: "P (1.5 KG)", preco: 145.00, min: 1, descricaoItem: "Com cobertura de glacê ", descricaoResumo: "Bolo de noiva - P (1.5 KG)", descricaoPopup: "Com cobertura de glacê "},
        { nome: "Bolo de Noiva", tamanho: "M (2.5 KG)", preco: 240.00, min: 1, descricaoItem: "Com cobertura de glacê ", descricaoResumo: "Bolo de noiva - M (2.5 KG)", descricaoPopup: "Com cobertura de glacê "},
        { nome: "Bolo de Noiva", tamanho: "G (3.5 KG)", preco: 335.00, min: 1, descricaoItem: "Com cobertura de glacê ", descricaoResumo: "Bolo de noiva - G (3.5 KG)", descricaoPopup: "Com cobertura de glacê "},
        { nome: "Bolo Prestígio", tamanho: "P (1.5 KG)", preco: 105.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo Prestígio - P (1.5 KG)", descricaoPopup: ""},
        { nome: "Bolo Prestígio", tamanho: "M (2.5 KG)", preco: 175.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo Prestígio - M (2.5 KG)", descricaoPopup: ""},
        { nome: "Bolo Prestígio", tamanho: "G (3.5 KG)", preco: 245.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo Prestígio - G (3.5 KG)", descricaoPopup: ""},    
        { nome: "Bolo Red velvet", tamanho: "P (1.5 KG)", preco: 105.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo Red velvet - P (1.5 KG)", descricaoPopup: ""},
        { nome: "Bolo Red velvet", tamanho: "M (2.5 KG)", preco: 175.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo Red velvet - M (2.5 KG)", descricaoPopup: ""},
        { nome: "Bolo Red velvet", tamanho: "G (3.5 KG)", preco: 245.00, min: 1, descricaoItem: "", descricaoResumo: "Bolo Red Velvet - G (3.5 KG)", descricaoPopup: ""},
    ]).map(item => ({...item, id: generateId(item.nome, item.tamanho)}));

    const itensDoces = addGroupKeys([
        { nome: "Beijinho", min: 20, preco: 1.20, descricaoItem: "", descricaoResumo: "Beijinho", descricaoPopup: "" },
        { nome: "Bem-casado", min: 20, preco: 1.20, descricaoItem: "", descricaoResumo: "Bem-casado", descricaoPopup: "" },
        { nome: "Brigadeiro", min: 20, preco: 1.20, descricaoItem: "", descricaoResumo: "Brigadeiro", descricaoPopup: "" },
        { nome: "Mini Cookie Black", min: 20, preco: 2.80, descricaoItem: "Massa feita com cacau 100% e pedaços de chocolate meio amargo", descricaoResumo: "Mini Cookie Black", descricaoPopup: "Massa feita com cacau 100% e pedaços de chocolate meio amargo" },
        { nome: "Mini Cookie Red Velvet", min: 20, preco: 2.80, descricaoItem: "Massa de baunilha com toque de cream cheese, cacau vermelho e pedaços de chocolate branco", descricaoResumo: "Mini Cookie Red Velvet", descricaoPopup: "Massa de baunilha com toque de cream cheese, cacau vermelho e pedaços de chocolate branco" },
        { nome: "Mini Cookie Tradicional", min: 20, preco: 2.80, descricaoItem: "Massa de baunilha com pedaços de chocolate meio amargo", descricaoResumo: "Mini Cookie Tradicional", descricaoPopup: "Massa de baunilha com pedaços de chocolate meio amargo" },
        { nome: "Mini Tortilete", min: 20, preco: 1.30, descricaoItem: "", descricaoResumo: "Mini Tortilete", descricaoPopup: "" },
        { nome: "Moranguinho", min: 20, preco: 1.20, descricaoItem: "", descricaoResumo: "Moranguinho", descricaoPopup: "" },
        { nome: "Ouriço", min: 20, preco: 1.30, descricaoItem: "", descricaoResumo: "Ouriço", descricaoPopup: "" },
        { nome: "Queijadinha", min: 20, preco: 1.30, descricaoItem: "", descricaoResumo: "Queijadinha", descricaoPopup: "" },
        { nome: "Surpresa de uva", min: 20, preco: 1.30, descricaoItem: "", descricaoResumo: "Surpresa de uva", descricaoPopup: "" },
    ]).map(item => ({...item, id: generateId(item.nome)}));

    const itensCookies = addGroupKeys([
        { nome: "Cookie Tradicional *", min: 1, preco: 12.00, descricaoItem: "Massa de baunilha com pedaços de chocolate meio amargo", descricaoResumo: "*Cookie Tradicional", descricaoPopup: "Massa de baunilha com pedaços de chocolate meio amargo" },
        { nome: "Cookie Red Velvet *", min: 1, preco: 12.00, descricaoItem: "Massa de baunilha com toque de cream cheese, cacau vermelho e pedaços de chocolate branco", descricaoResumo: "*Cookie Red Velvet", descricaoPopup: "Massa de baunilha com toque de cream cheese, cacau vermelho e pedaços de chocolate branco" },
        { nome: "Cookie Black *", min: 1, preco: 12.00, descricaoItem: "Massa feita com cacau 100% e pedaços de chocolate meio amargo", descricaoResumo: "*Cookie Black", descricaoPopup: "Massa feita com cacau 100% e pedaços de chocolate meio amargo" },
    ]).map(item => ({...item, id: generateId(item.nome)}));

    const itensSalgadoFrito = addGroupKeys([
        { nome: "Bolinho de Bacalhau", min: 20, preco: 1.30, descricaoItem: "", descricaoResumo: "Bolinho de Bacalhau", descricaoPopup: "" },
        { nome: "Bolinho de Charque", min: 20, preco: 1.20, descricaoItem: "", descricaoResumo: "Bolinho de Charque", descricaoPopup: "" },
        { nome: "Coxinha de Frango", min: 20, preco: 1.00, descricaoItem: "", descricaoResumo: "Coxinha de Frango", descricaoPopup: "" },
        { nome: "Croquete Misto", min: 20, preco: 1.00, descricaoItem: "De Presunto Com Queijo", descricaoResumo: "Croquete Misto", descricaoPopup: "De Presunto Com Queijo" },
        { nome: "Camarão Empanado", min: 20, preco: 1.50, descricaoItem: "", descricaoResumo: "Camarão Empanado", descricaoPopup: "" },
        { nome: "Mini Quibe", min: 20, preco: 1.10, descricaoItem: "De Carne Com Queijo", descricaoResumo: "Mini Quibe de Carne C/ Queijo", descricaoPopup: "De Carne Com Queijo" },
        { nome: "Pastel de Festa", min: 20, preco: 1.30, descricaoItem: "", descricaoResumo: "Pastel de Festa", descricaoPopup: "" },
    ]).map(item => ({...item, id: generateId(item.nome)}));

    const itensSalgadoForno = addGroupKeys([
        { nome: "Canudinho de Frango", min: 20, preco: 1.50, descricaoItem: "Massa Caseira Assada no Forno", descricaoResumo: "Canudinho de Frango", descricaoPopup: "Massa Caseira Assada no Forno" },
        { nome: "Empadinha de Bacalhau", min: 20, preco: 1.30, descricaoItem: "", descricaoResumo: "Empadinha de Bacalhau", descricaoPopup: "" },
        { nome: "Empadinha de Camarão", min: 20, preco: 1.30, descricaoItem: "", descricaoResumo: "Empadinha de Camarão", descricaoPopup: "" },
        { nome: "Empadinha de Carne", min: 20, preco: 1.00, descricaoItem: "", descricaoResumo: "Empadinha de Carne", descricaoPopup: "" },
        { nome: "Empadinha de Frango", min: 20, preco: 1.00, descricaoItem: "", descricaoResumo: "Empadinha de Frango", descricaoPopup: "" },
        { nome: "Mini Folhado de Carne", min: 20, preco: 2.20, descricaoItem: "", descricaoResumo: "Mini Folhado de Carne", descricaoPopup: "" },
        { nome: "Mini Folhado de Frango", min: 20, preco: 2.20, descricaoItem: "", descricaoResumo: "Mini Folhado de Frango", descricaoPopup: "" },
        { nome: "Mini Folhado de Queijo", min: 20, preco: 2.20, descricaoItem: "", descricaoResumo: "Mini Folhado de Queijo", descricaoPopup: "" },
        { nome: "Mini Folhado de Pizza", min: 20, preco: 2.20, descricaoItem: "", descricaoResumo: "Mini Folhado de Pizza", descricaoPopup: "" },
        { nome: "Mini Enroladinho", min: 20, preco: 1.00, descricaoItem: "Com Salsicha", descricaoResumo: "Mini Enroladinho de salsicha", descricaoPopup: "Com Salsicha" },
        { nome: "Pastel de Forno de Bacalhau", min: 20, preco: 1.30, descricaoItem: "", descricaoResumo: "Pastel de Forno de Bacalhau", descricaoPopup: "" },
        { nome: "Pastel de Forno de Camarão", min: 20, preco: 1.40, descricaoItem: "", descricaoResumo: "Pastel de Forno de Camarão", descricaoPopup: "" },
        { nome: "Pastel de Forno de Carne", min: 20, preco: 1.00, descricaoItem: "", descricaoResumo: "Pastel de Forno de Carne", descricaoPopup: "" },
        { nome: "Pastel de Forno de Frango", min: 20, preco: 1.00, descricaoItem: "", descricaoResumo: "Pastel de Forno de Frango", descricaoPopup: "" },
        { nome: "Pastel de Forno de Queijo", min: 20, preco: 1.00, descricaoItem: "", descricaoResumo: "Pastel de Forno de Queijo", descricaoPopup: "" },
        { nome: "Pastel de Forno de Pizza", min: 20, preco: 1.00, descricaoItem: "", descricaoResumo: "Pastel de Forno de Pizza", descricaoPopup: "" },
    ]).map(item => ({...item, id: generateId(item.nome)}));
    
    const itensSalgadoVegetariano = addGroupKeys([
        { nome: "Canudinho de Soja", min: 20, preco: 1.50, descricaoItem: "Massa Caseira Assada no Forno", descricaoResumo: "Canudinho de Soja", descricaoPopup: "Massa Caseira Assada no Forno" },
        { nome: "Coxinha de Soja", min: 20, preco: 1.00, descricaoItem: "", descricaoResumo: "Coxinha de SOJA", descricaoPopup: "" },
        { nome: "Coxinha de Caju *", min: 20, preco: 1.20, descricaoItem: "* CONSULTAR DISPONIBILIDADE *", descricaoResumo: "Coxinha de CAJU", descricaoPopup: "* CONSULTAR DISPONIBILIDADE *" },
        { nome: "Empadinha de Creme de Aborbinha", min: 20, preco: 1.00, descricaoItem: "Com Queijo", descricaoResumo: "Empadinha de Aborbinha Com Queijo", descricaoPopup: "Com Queijo" },
        { nome: "Empadinha de Falso Camarão", min: 20, preco: 1.00, descricaoItem: "A Base de Milho e Leite de Coco", descricaoResumo: "Empadinha de Falso Camarão", descricaoPopup: "A Base de Milho e Leite de Coco" },
        { nome: "Pastel de Festa Vegetariano", min: 20, preco: 1.30, descricaoItem: "De Soja", descricaoResumo: "Pastel de Festa de SOJA", descricaoPopup: "De Soja" },
        { nome: "Pastel de Forno Creme de Abobrinha", min: 20, preco: 1.00, descricaoItem: "Com Queijo", descricaoResumo: "Pastel de Forno Abobrinha C/ Queijo", descricaoPopup: "Com Queijo" },
        { nome: "Pastel de Forno Caju *", min: 20, preco: 1.30, descricaoItem: "* CONSULTAR DISPONIBILIDADE *", descricaoResumo: "Pastel de Forno Caju", descricaoPopup: "* CONSULTAR DISPONIBILIDADE *" },
    ]).map(item => ({...item, id: generateId(item.nome)}));

    const itensPratoSalgado = addGroupKeys([
        { nome: "Empadão de Bacalhau", tamanho: "P (1 KG)", preco: 120.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Bacalhau - P (1 KG)", descricaoPopup: ""},
        { nome: "Empadão de Bacalhau", tamanho: "M (2 KG)", preco: 220.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Bacalhau - M (2 KG)", descricaoPopup: ""},
        { nome: "Empadão de Bacalhau", tamanho: "G (3 KG)", preco: 340.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Bacalhau - G (3 KG)", descricaoPopup: ""},
        { nome: "Empadão de Carne", tamanho: "P (1 KG)", preco: 70.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Carne - P (1 KG)", descricaoPopup: ""},
        { nome: "Empadão de Carne", tamanho: "M (2 KG)", preco: 140.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Carne - M (2 KG)", descricaoPopup: ""},
        { nome: "Empadão de Carne", tamanho: "G (3 KG)", preco: 210.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Carne - G (3 KG)", descricaoPopup: ""},
        { nome: "Empadão de Camarão", tamanho: "P (1 KG)", preco: 120.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Camarão - P (1 KG)", descricaoPopup: ""},
        { nome: "Empadão de Camarão", tamanho: "M (2 KG)", preco: 220.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Camarão - M (2 KG)", descricaoPopup: ""},
        { nome: "Empadão de Camarão", tamanho: "G (3 KG)", preco: 340.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Camarão - G (3 KG)", descricaoPopup: ""},
        { nome: "Empadão de Frango", tamanho: "P (1 KG)", preco: 70.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Frango - P (1 KG)", descricaoPopup: ""},
        { nome: "Empadão de Frango", tamanho: "M (2 KG)", preco: 140.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Frango - M (2 KG)", descricaoPopup: ""},
        { nome: "Empadão de Frango", tamanho: "G (3 KG)", preco: 210.00, min: 1, descricaoItem: "", descricaoResumo: "Empadão de Frango - G (3 KG)", descricaoPopup: ""},
        { nome: "Fricassê de Frango", tamanho: "P (1 KG)", preco: 80.00, min: 1, descricaoItem: "", descricaoResumo: "Fricassê de Frango - P (1 KG)", descricaoPopup: ""},
        { nome: "Fricassê de Frango", tamanho: "M (2 KG)", preco: 160.00, min: 1, descricaoItem: "", descricaoResumo: "Fricassê de Frango - M (2 KG)", descricaoPopup: ""},
        { nome: "Fricassê de Frango", tamanho: "G (3 KG)", preco: 240.00, min: 1, descricaoItem: "", descricaoResumo: "Fricassê de Frango - G (3 KG)", descricaoPopup: ""},
        { nome: "Quiche de Camarão", tamanho: "P (1 KG)", preco: 120.00, min: 1, descricaoItem: "", descricaoResumo: "Quiche de Camarão - P (1 KG)", descricaoPopup: ""},
        { nome: "Quiche de Camarão", tamanho: "M (2 KG)", preco: 240.00, min: 1, descricaoItem: "", descricaoResumo: "Quiche de Camarão - M (2 KG)", descricaoPopup: ""},
        { nome: "Quiche de Camarão", tamanho: "G (3 KG)", preco: 360.00, min: 1, descricaoItem: "", descricaoResumo: "Quiche de Camarão - G (3 KG)", descricaoPopup: ""},
        { nome: "Quiche de Frango", tamanho: "P (1 KG)", preco: 90.00, min: 1, descricaoItem: "Com Alho Poró", descricaoResumo: "Quiche de Frango - P (1 KG)", descricaoPopup: "Com Alho Poró"},
        { nome: "Quiche de Frango", tamanho: "M (2 KG)", preco: 180.00, min: 1, descricaoItem: "Com Alho Poró", descricaoResumo: "Quiche de Frango - M (2 KG)", descricaoPopup: "Com Alho Poró"},
        { nome: "Quiche de Frango", tamanho: "G (3 KG)", preco: 260.00, min: 1, descricaoItem: "Com Alho Poró", descricaoResumo: "Quiche de Frango - G (3 KG)", descricaoPopup: "Com Alho Poró"},
        { nome: "Rocambole de Bacalhau", tamanho: "P (1 KG)", preco: 120.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Bacalhau - P (1 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Bacalhau", tamanho: "M (2 KG)", preco: 240.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Bacalhau - M (2 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Bacalhau", tamanho: "G (3 KG)", preco: 360.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Bacalhau - G (3 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Camarão", tamanho: "P (1 KG)", preco: 120.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Camarão - P (1 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Camarão", tamanho: "M (2 KG)", preco: 240.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Camarão - M (2 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Camarão", tamanho: "G (3 KG)", preco: 365.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Camarão - G (3 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Carne", tamanho: "P (1 KG)", preco: 70.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Carne - P (1 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Carne", tamanho: "M (2 KG)", preco: 140.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Carne - M (2 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Carne", tamanho: "G (3 KG)", preco: 210.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Carne - G (3 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Frango", tamanho: "P (1 KG)", preco: 70.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Frango - P (1 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Frango", tamanho: "M (2 KG)", preco: 140.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Frango - M (2 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Rocambole de Frango", tamanho: "G (3 KG)", preco: 210.00, min: 1, descricaoItem: "Massa de Batata", descricaoResumo: "Rocambole de Frango - G (3 KG)", descricaoPopup: "Massa de Batata"},
        { nome: "Torta Salgada de Bacalhau", tamanho: "P (1 KG)", preco: 120.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Bacalhau - P (1 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Bacalhau", tamanho: "M (2 KG)", preco: 240.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Bacalhau - M (2 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Bacalhau", tamanho: "G (3 KG)", preco: 360.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Bacalhau - G (3 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Carne", tamanho: "P (1 KG)", preco: 70.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Carne - P (1 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Carne", tamanho: "M (2 KG)", preco: 140.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Carne - M (2 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Carne", tamanho: "G (3 KG)", preco: 210.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Carne - G (3 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Camarão", tamanho: "P (1 KG)", preco: 120.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Camarão - P (1 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Camarão", tamanho: "M (2 KG)", preco: 240.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Camarão - M (2 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Camarão", tamanho: "G (3 KG)", preco: 360.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Camarão - G (3 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Frango", tamanho: "P (1 KG)", preco: 70.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Frango - P (1 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Frango", tamanho: "M (2 KG)", preco: 140.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Frango - M (2 KG)", descricaoPopup: ""},
        { nome: "Torta Salgada de Frango", tamanho: "G (3 KG)", preco: 210.00, min: 1, descricaoItem: "", descricaoResumo: "Torta Salgada de Frango - G (3 KG)", descricaoPopup: ""},
    ]).map(item => ({...item, id: generateId(item.nome, item.tamanho)}));

    const gruposItens = {
        "tabela-bolo-tradicional": { itens: itensBoloTradicional, nomeGrupo: "Bolos Tradicionais", img: "img-bolo-tradicional", minTotal: 0 },
        "tabela-bolo-especial": { itens: itensBoloEspecial, nomeGrupo: "Bolos Especiais", img: "img-bolo-especial", minTotal: 0 },
        "tabela-doces": { itens: itensDoces, nomeGrupo: "Doces", img: "img-doces", minTotal: 0 },
        "tabela-cookies": { itens: itensCookies, nomeGrupo: "Cookies", img: "img-cookies", minTotal: 3, minIndividual: 1 }, 
        "tabela-salfri": { itens: itensSalgadoFrito, nomeGrupo: "Salgados Fritos", img: "img-salfri", minTotal: 0 },
        "tabela-salgado-forno": { itens: itensSalgadoForno, nomeGrupo: "Salgados Assados", img: "img-salgado-forno", minTotal: 0 },
        "tabela-salgado-vegetariano": { itens: itensSalgadoVegetariano, nomeGrupo: "Salgados Vegetarianos", img: "img-salgado-vegetariano", minTotal: 0 },
        "tabela-prato-salgado": { itens: itensPratoSalgado, nomeGrupo: "Pratos Salgados", img: "img-prato-salgado", minTotal: 0 },
    };

    // -----------------------------------------------------
    // INTEGRAÇÃO COM GOOGLE SHEETS
    // -----------------------------------------------------
    const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxg41fkz_lDRKUTcnukG-LmuasWR_W6C7QovJo7Vdll58snz9MknU9f5QZ2KWKOOSA/exec";

    async function verificarCupomNaPlanilha(cupomCode) {
        try {
            const response = await fetch(`${GOOGLE_SHEETS_URL}?action=checkCupom&cupom=${encodeURIComponent(cupomCode)}`);
            const data = await response.json();
            if (data && typeof data.used === 'boolean') { return data.used; }
            console.warn("Resposta inesperada da API de verificação de cupom:", data);
            return false;
        } catch (error) {
            console.error("Erro ao verificar cupom na planilha:", error);
            return false;
        }
    }

    function gerarIdPedido() {
        const agora = new Date();
        const data = agora.toISOString().slice(0,10).replace(/-/g, "");
        const hora = agora.toTimeString().slice(0,8).replace(/:/g, "");
        return `PED-${data}${hora}`;
    }

    function validarEFormatarTelefone(telefone) {
        const numeroLimpo = telefone.replace(/\D/g, '');
        if (numeroLimpo.length === 13) return numeroLimpo;
        if (numeroLimpo.length === 12) return numeroLimpo;
        if (numeroLimpo.length === 11) return '55' + numeroLimpo;
        if (numeroLimpo.length === 10) return '55' + numeroLimpo;
        if (numeroLimpo.length === 9) return '5581' + numeroLimpo;
        if (numeroLimpo.length === 8) return '5581' + numeroLimpo;
        return numeroLimpo;
    }

    function enviarPedidoParaPlanilha(dadosPedido) {
        try {
            const params = new URLSearchParams();
            const action = dadosPedido.action || 'create';
            params.append('action', action);
            
            if (action === 'replacePedido' && dadosPedido.oldId) {
                params.append('oldId', dadosPedido.oldId);
            }
            
            for (const key in dadosPedido) {
                if (key !== 'action' && key !== 'oldId') {
                    params.append(key, dadosPedido[key] || '');
                }
            }
            
            fetch(GOOGLE_SHEETS_URL, {
                method: "POST",
                mode: 'no-cors',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params.toString()
            }).then(() => { console.log("Pedido enviado para a planilha."); })
              .catch(err => { console.error("Erro ao enviar para planilha:", err); });
        } catch (e) { console.error("Erro no preparo do envio:", e); }
    }
    
    // -----------------------------------------------------
    // FUNÇÃO DE CRIAÇÃO DE TABELAS
    // -----------------------------------------------------
    function criarTabelaGrupo(grupo, idTabela, nomeGrupo) {
        const tabelaBase = document.getElementById(idTabela);
        if (!tabelaBase) return;
        const tbodyBase = tabelaBase.querySelector('tbody');
        if (!tbodyBase) return;

        const grupoOrdenado = [...grupo].sort((a, b) => {
            const nomeA = (a.nome || '').toLocaleLowerCase('pt-BR');
            const nomeB = (b.nome || '').toLocaleLowerCase('pt-BR');
            
            if (nomeA !== nomeB) {
                return nomeA.localeCompare(nomeB, 'pt-BR');
            }
            
            // Se o nome é igual, ordena por tamanho
            const tamanhoA = (a.tamanho || '').toLowerCase();
            const tamanhoB = (b.tamanho || '').toLowerCase();
            
            // Extrai apenas a letra (P, M, G, etc)
            const letraA = tamanhoA.match(/^[pmg]/)?.[0] || '';
            const letraB = tamanhoB.match(/^[pmg]/)?.[0] || '';
            
            const ordem = { 'p': 1, 'm': 2, 'g': 3 };
            const ordemA = ordem[letraA] || 99;
            const ordemB = ordem[letraB] || 99;
            
            return ordemA - ordemB;
        });

        let grupoAtual = null;
        let countGrupo = 0;
        const isGroupedTable = idTabela.includes('bolo') || idTabela.includes('prato');
        const isCookieTable = idTabela === 'tabela-cookies';

        for (let i = 0; i < grupoOrdenado.length; i++) {
            const item = grupoOrdenado[i];
            const tr = document.createElement("tr");
            
            const coluna2 = isCookieTable ? (item.min || '') : (item.tamanho || item.min);
            // Manter tamanho na mesma linha: "P (1.5 KG)"
            const coluna2Display = !isCookieTable && item.tamanho ? item.tamanho : coluna2; 
            const precoFormatado = item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const itemId = item.id;
            const isMiniCookieRow = itemId === MINI_COOKIE_ID;
            tr.id = itemId; 
            
            let isFirstInGroup = false;
            let isLastInGroup = false;
            
            if (isGroupedTable) {
                if (item.groupKey !== grupoAtual) {
                    grupoAtual = item.groupKey;
                    isFirstInGroup = true;
                    countGrupo = 1;
                    let j = i + 1;
                    while (j < grupoOrdenado.length && grupoOrdenado[j].groupKey === grupoAtual) {
                        countGrupo++;
                        j++;
                    }
                }
                // Check if this is the last item in the group
                if (i === grupoOrdenado.length - 1 || grupoOrdenado[i + 1].groupKey !== grupoAtual) {
                    isLastInGroup = true;
                }
            }
            
            const inputHtml = `<div class="quantidade-input-group">
                <button type="button" class="qtd-btn-table" onclick="alterarQuantidadeTabela('${itemId}', -1, ${item.min || 1})">-</button>
                <input type="number" value="0" data-min="${item.min || 1}" data-preco="${item.preco}" data-resumo="${item.descricaoResumo}" data-grupo="${nomeGrupo}" data-item-id="${itemId}" class="quantidade-input" readonly>
                <button type="button" class="qtd-btn-table" onclick="alterarQuantidadeTabela('${itemId}', 1, ${item.min || 1})">+</button>
            </div>`;

            let erroHtml = '';
            const isMiniCookie = itemId === MINI_COOKIE_ID;
            const isIndividualMinCheck = (gruposComMinimoIndividual.includes(nomeGrupo) && (item.min && item.min > 1)) || isMiniCookie;
            
            if (isIndividualMinCheck) {
                erroHtml = `<div class="erro-item-unico">Mín ${item.min} Unid.</div>`;
            }

            let celulasComuns;
            if (isCookieTable) {
                if (isMiniCookieRow) {
                    celulasComuns = `
                        <td>
                            <div class="item-nome item-nome-clickable" data-item-nome="${item.nome.replace(/"/g, '&quot;')}" data-item-descricao-popup="${(item.descricaoPopup || item.descricaoItem).replace(/"/g, '&quot;')}" style="cursor: pointer;">${item.nome}</div>
                            ${item.descricaoItem ? `<div class="descricao">${item.descricaoItem}</div>` : ''}
                        </td>
                        <td>${item.min || ''}</td>
                        <td>R$ ${precoFormatado}</td>
                        <td><div class="quantidade-container">${inputHtml}${erroHtml}</div></td>`;
                } else {
                    celulasComuns = `
                        <td>
                            <div class="item-nome item-nome-clickable" data-item-nome="${item.nome.replace(/"/g, '&quot;')}" data-item-descricao-popup="${(item.descricaoPopup || item.descricaoItem).replace(/"/g, '&quot;')}" style="cursor: pointer;">${item.nome}</div>
                            ${item.descricaoItem ? `<div class="descricao">${item.descricaoItem}</div>` : ''}
                        </td>
                        <td>R$ ${precoFormatado}</td>
                        <td><div class="quantidade-container">${inputHtml}${erroHtml}</div></td>`;
                }
            } else {
                celulasComuns = `
                    <td>
                        <div class="item-nome item-nome-clickable" data-item-nome="${item.nome.replace(/"/g, '&quot;')}" data-item-descricao-popup="${(item.descricaoPopup || item.descricaoItem).replace(/"/g, '&quot;')}" style="cursor: pointer;">${item.nome}</div>
                        ${item.descricaoItem ? `<div class="descricao">${item.descricaoItem}</div>` : ''}
                    </td>
                    <td>${coluna2Display}</td>
                    <td>R$ ${precoFormatado}</td>
                    <td><div class="quantidade-container">${inputHtml}${erroHtml}</div></td>`;
            }

            const celulasAgrupadas = `
                <td>${coluna2Display}</td>
                <td>R$ ${precoFormatado}</td>
                <td><div class="quantidade-container">${inputHtml}${erroHtml}</div></td>`;

            if (isGroupedTable && isFirstInGroup) {
                tr.innerHTML = `
                    <td rowspan="${countGrupo}" class="item-group-cell">
                        <div class="item-nome item-nome-clickable" data-item-nome="${item.nome.replace(/"/g, '&quot;')}" data-item-descricao-popup="${(item.descricaoPopup || item.descricaoItem).replace(/"/g, '&quot;')}" style="cursor: pointer;">${item.nome}</div>
                        ${item.descricaoItem ? `<div class="descricao">${item.descricaoItem}</div>` : ''}
                    </td>
                    ${celulasAgrupadas}`;
            } else if (isGroupedTable && !isFirstInGroup) {
                tr.innerHTML = `<td style="display:none;"></td>${celulasAgrupadas}`;
            } else {
                tr.innerHTML = celulasComuns;
            }

            // Add class to show border only at the end of each group
            if (isGroupedTable && isLastInGroup) {
                tr.classList.add('group-separator');
            }

            if (isCookieTable) {
                const tabelaNormais = document.getElementById('tabela-cookies');
                const tbodyNormais = tabelaNormais ? tabelaNormais.querySelector('tbody') : null;
                if (tbodyNormais) tbodyNormais.appendChild(tr);
            } else {
                tbodyBase.appendChild(tr);
            }
        }
    }
    
    // -----------------------------------------------------
    // FUNÇÕES DE POPUP DE IMAGEM DO ITEM
    // -----------------------------------------------------
    // ----------------------------------------------------- 
    // FUNÇÕES DE INTERAÇÃO (GLOBAL SCOPE HACK)
    // ----------------------------------------------------- 
    // Para que o HTML acesse estas funções, vamos atribui-las ao window
    
    window.fecharResumoPopup = function() {
        document.getElementById("popup-resumo").style.display = "none";
    }

    window.fecharPopup = function() {
        document.getElementById("popup-pedido").style.display = "none";
    }

    window.abrirResumoPopup = function() {
        const cupomMessage = document.getElementById('cupom-message');
        cupomMessage.className = 'cupom-message';
        cupomMessage.textContent = cupomAplicado.mensagem;
        
        const totalText = document.getElementById("summary-total").textContent;
        const total = parseFloat(totalText.replace('R$ ', '').replace('.', '').replace(',', '.')) || 0; 
        
        if (total > 0) {
             document.getElementById("popup-resumo").style.display = "flex";
        } else {
             alert("Seu pedido está vazio. Adicione itens para visualizar o resumo!");
        }
    }

    window.abrirPopup = function() {
        fecharResumoPopup(); 
        document.getElementById("popup-pedido").style.display = "flex";
    }

    window.editarPedido = function() {
        fecharPopup();
        abrirResumoPopup();
    }
    
    window.fecharPopupNatal = function() {
        document.getElementById('popup-natal').style.display = 'none';
    }

    window.excluirItem = function(itemId) {
        const inputNoMain = document.querySelector(`.quantidade-input[data-item-id="${itemId}"]`);
        if (inputNoMain) {
            inputNoMain.value = "0"; 
            inputNoMain.dispatchEvent(new Event('input')); 
        }
        if (cupomAplicado.codigo) aplicarCupom();
        
        if (parseFloat(document.getElementById("summary-total").textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) > 0) {
            abrirResumoPopup();
        } else {
            fecharResumoPopup();
        }
    }

    window.alterarQuantidadeResumo = function(itemId, delta) {
        const inputResumo = document.querySelector(`#popup-resumo-itens input[data-item-id="${itemId}"]`);
        if (!inputResumo) return;
        let valorAtual = parseInt(inputResumo.value) || 0;
        let novoValor = valorAtual + delta;
        if (novoValor < 0) novoValor = 0;
        inputResumo.value = novoValor;
        atualizarQuantidadeDireta(inputResumo);
    }
    
    window.atualizarQuantidadeDireta = function(inputElement) {
        const itemId = inputElement.getAttribute('data-item-id');
        const valorInput = inputElement.value.replace(/[^0-9]/g, ''); 
        let novaQuantidade = parseInt(valorInput) || 0;

        const inputNoMain = document.querySelector(`.quantidade-input[data-item-id="${itemId}"]`);

        if (inputNoMain) {
            if (novaQuantidade <= 0) {
                novaQuantidade = 0; 
                inputElement.value = "0"; 
            } else {
                inputElement.value = novaQuantidade; 
            }
            inputNoMain.value = novaQuantidade;
            atualizarTotal();
            if (cupomAplicado.codigo) aplicarCupom();

            if (parseFloat(document.getElementById("summary-total").textContent.replace('R$ ', '').replace('.', '').replace(',', '.')) > 0) {
                abrirResumoPopup(); 
            } else {
                fecharResumoPopup();
            }
        }
    }

    window.aplicarCupom = async function() {
        const cupomInput = document.getElementById('cupom-input');
        const cupomCode = cupomInput.value.toUpperCase().trim();
        const cupomMessage = document.getElementById('cupom-message');
        const applyBtn = document.getElementById('apply-cupom-btn');
        const textoOriginalBtn = applyBtn.textContent;
        
        cupomAplicado = { codigo: null, desconto: 0, mensagem: '' };
        cupomMessage.className = 'cupom-message';
        
        let totalBrutoPedido = 0;   
        let totalCookies = 0;
        let subtotalCookies = 0;    
        const cookiesGrupos = ["Cookies"];   
        let temErroDeMinimo = false; 

        document.querySelectorAll(".quantidade-input").forEach(input => {
            const grupo = input.getAttribute("data-grupo");
            const quantidade = parseInt(input.value) || 0; 
            const preco = parseFloat(input.getAttribute("data-preco")) || 0;
            const min = parseInt(input.getAttribute("data-min")) || 1;
            const itemId = input.getAttribute("data-item-id");
            
            const isMiniCookieCheck = itemId === MINI_COOKIE_ID;
            const isDocesSalgadosCheck = gruposComMinimoIndividual.includes(grupo) && min > 1;
            const isIndividualMinCheck = isDocesSalgadosCheck || isMiniCookieCheck;
            const isItemValido = quantidade >= min;
            
            if (quantidade > 0 && isIndividualMinCheck && !isItemValido) { temErroDeMinimo = true; }
            if (quantidade > 0 && (!isIndividualMinCheck || isItemValido)) { totalBrutoPedido += quantidade * preco; }

            if (cookiesGrupos.includes(grupo)) {
                const isMiniCookie = itemId === MINI_COOKIE_ID;
                if (!isMiniCookie) {
                    totalCookies += quantidade;
                    subtotalCookies += quantidade * preco;
                } else {
                    subtotalCookies += quantidade * preco;
                }
            }
        });

        const idTabelaCookies = "tabela-cookies";
        const minTotalCookies = gruposItens[idTabelaCookies]?.minTotal || 0;
        const cookiesValidos = totalCookies === 0 || totalCookies >= minTotalCookies;
        if (!cookiesValidos && totalCookies > 0) temErroDeMinimo = true;
        
        if (temErroDeMinimo) {
            cupomAplicado.mensagem = 'Ajuste as quantidades mínimas do seu pedido antes de aplicar um cupom.';
            cupomMessage.classList.add('cupom-error');
            atualizarTotal();
            return;
        }
        
        const cupomDeUsoUnico = CUPONS_GERADOS[cupomCode];
        if (cupomDeUsoUnico) {
            if (cupomDeUsoUnico.aplicaEm === 'cookies') {
                const minCookies = cupomDeUsoUnico.minCookies || 1;
                if (totalCookies < minCookies) {
                    cupomAplicado.mensagem = `CUPOM VÁLIDO APENAS PARA NO MÍNIMO ${minCookies} COOKIES.`;
                    cupomMessage.classList.add('cupom-error');
                    cupomMessage.textContent = cupomAplicado.mensagem;
                    atualizarTotal();
                    return;
                }
            }
            if (totalBrutoPedido === 0) {
                 cupomAplicado.mensagem = 'Adicione itens ao carrinho antes de aplicar o cupom.';
                 cupomMessage.classList.add('cupom-error');
                 atualizarTotal();
                 return;
            }
            if (cupomDeUsoUnico.usoUnico && cupomDeUsoUnico.usado) {
                cupomAplicado.mensagem = 'Este cupom já foi utilizado.';
                cupomMessage.classList.add('cupom-error');
                atualizarTotal();
                return;
            }
            const hoje = new Date().toISOString().split('T')[0];
            if (cupomDeUsoUnico.expiraEm < hoje) {
                cupomAplicado.mensagem = 'Este cupom está expirado.';
                cupomMessage.classList.add('cupom-error');
                cupomMessage.textContent = cupomAplicado.mensagem;
                atualizarTotal();
                return;
            }
            
            applyBtn.textContent = 'Validando...';
            applyBtn.disabled = true;
            
            try {
                const cupomJaUsado = await verificarCupomNaPlanilha(cupomCode);
                applyBtn.textContent = textoOriginalBtn;
                applyBtn.disabled = false;
                
                if (cupomJaUsado) {
                    cupomAplicado.mensagem = 'Este cupom já foi utilizado em um pedido anterior.';
                    cupomMessage.classList.add('cupom-error');
                    cupomMessage.textContent = cupomAplicado.mensagem;
                    atualizarTotal();
                    return;
                }
            } catch (error) {
                applyBtn.textContent = textoOriginalBtn;
                applyBtn.disabled = false;
            }
            
            let baseCalculo = totalBrutoPedido;
            let mensagemDesconto = `OFF no total`;

            if (cupomDeUsoUnico.aplicaEm === 'cookies') {
                baseCalculo = subtotalCookies;
                mensagemDesconto = `OFF em Cookies`;
            }
            
            let descontoTotal = 0;
            if (cupomDeUsoUnico.descontoTipo === 'percentual') {
                descontoTotal = baseCalculo * cupomDeUsoUnico.valor;
                mensagemDesconto = `${(cupomDeUsoUnico.valor * 100).toFixed(0)}% ${mensagemDesconto}`;
            } else if (cupomDeUsoUnico.descontoTipo === 'valorFixo') {
                descontoTotal = cupomDeUsoUnico.valor;
                mensagemDesconto = `R$ ${descontoTotal.toFixed(2).replace('.', ',')} ${mensagemDesconto}`;
            }
            
            cupomAplicado = {
                codigo: cupomCode,
                desconto: descontoTotal, 
                mensagem: `CUPOM ${cupomCode} APLICADO! (${mensagemDesconto})` 
            };
            cupomMessage.classList.add('cupom-success');
            cupomMessage.textContent = cupomAplicado.mensagem;

        } else if (cupomCode) {
            cupomAplicado.mensagem = `Código "${cupomCode}" inválido.`;
            cupomMessage.classList.add('cupom-error');
            cupomMessage.textContent = cupomAplicado.mensagem;
        }
        
        if (applyBtn) { applyBtn.textContent = textoOriginalBtn; applyBtn.disabled = false; }
        if (cupomAplicado.mensagem) { cupomMessage.textContent = cupomAplicado.mensagem; }
        atualizarTotal();
    }

    window.alterarQuantidadeTabela = function(itemId, delta, minimo) {
        const input = document.querySelector(`.quantidade-input[data-item-id="${itemId}"]`);
        if (!input) return;
        
        let novaQtd = parseInt(input.value) || 0;
        const grupo = input.getAttribute('data-grupo');
        const descricao = input.getAttribute('data-resumo');
        const min = minimo || parseInt(input.getAttribute('data-min')) || 1;
        const erroElemento = input.closest('.quantidade-container')?.querySelector('.erro-item-unico');
        
        // Se clica em + e está em 0, vai pro mínimo
        if (delta > 0 && novaQtd === 0) {
            novaQtd = min;
        } else {
            novaQtd += delta;
        }
        
        // Se vai ficar abaixo de 0, zera
        if (novaQtd < 0) novaQtd = 0;
        
        input.value = novaQtd;
        
        // Validação: se quantidade está entre 1 e mínimo-1, mostra aviso
        const isMiniCookie = itemId === MINI_COOKIE_ID;
        const isDocesSalgadosCheck = gruposComMinimoIndividual.includes(grupo) && min > 1;
        const isIndividualMinCheck = isDocesSalgadosCheck || isMiniCookie;
        
        if (isIndividualMinCheck && novaQtd > 0 && novaQtd < min) {
            if (erroElemento) {
                erroElemento.textContent = `Mín ${min} Unid.`;
                erroElemento.style.display = 'block';
            }
        } else {
            if (erroElemento) erroElemento.style.display = 'none';
        }
        
        atualizarTotal();
    };

    function atualizarTotal() {
        let totalBruto = 0;
        let totalItens = 0;
        const resumoItensPopup = document.getElementById("popup-resumo-itens");
        const resumoTotalPopup = document.getElementById("popup-resumo-total");
        const fixedSummary = document.getElementById("fixed-summary");
        const fazerPedidoContainer = document.getElementById("fazer-pedido-button-container");
        
        if (!resumoItensPopup || !fixedSummary || !fazerPedidoContainer) return;
        resumoItensPopup.innerHTML = ''; 

        const gruposResumo = {}; 
        const totaisPorGrupo = {};
        
        document.querySelectorAll(".quantidade-input").forEach(input => {
            const quantidade = parseInt(input.value) || 0;
            const min = parseInt(input.getAttribute("data-min")) || 1;
            const preco = parseFloat(input.getAttribute("data-preco")) || 0;
            const descricaoResumo = input.getAttribute("data-resumo");
            const grupo = input.getAttribute("data-grupo");
            const itemId = input.getAttribute("data-item-id");
            const erroElemento = input.closest('.quantidade-container').querySelector('.erro-item-unico');
            
            const isMiniCookie = itemId === MINI_COOKIE_ID;
            const isDocesSalgadosCheck = gruposComMinimoIndividual.includes(grupo) && min > 1;
            const isIndividualMinCheck = isDocesSalgadosCheck || isMiniCookie; 

            if (!totaisPorGrupo[grupo]) { totaisPorGrupo[grupo] = { quantidade: 0, items: [] }; }
            totaisPorGrupo[grupo].quantidade += quantidade;
            totaisPorGrupo[grupo].items.push({ input, quantidade, min, preco, descricaoResumo, itemId, grupo });

            if (isIndividualMinCheck && quantidade > 0) {
                if (quantidade < min) {
                    if (erroElemento) { erroElemento.textContent = `Mín ${min} Unid.`; erroElemento.style.display = 'block'; }
                } else {
                    if (erroElemento) erroElemento.style.display = 'none';
                }
            } else {
                if (erroElemento) erroElemento.style.display = 'none'; 
            }
        });

        let temErroDeMinimo = false;

        for (const grupo in totaisPorGrupo) {
            const infoGrupo = totaisPorGrupo[grupo];
            const idTabela = `tabela-${grupo.toLowerCase().replace(/\s/g, '-')}`;
            const minTotal = gruposItens[idTabela]?.minTotal || 0;
            const isCookieGroup = grupo === "Cookies";
            const erroCategoriaElemento = !isCookieGroup ? document.getElementById('erro-' + grupo.toLowerCase()) : null;
            
            let grupoValido = true;
            
            if (minTotal > 0) {
                if (isCookieGroup) {
                    let totalCookiesNormais = 0;
                    infoGrupo.items.forEach(item => {
                        const isMiniCookie = item.itemId === MINI_COOKIE_ID;
                        if (!isMiniCookie) { totalCookiesNormais += item.quantidade; }
                    });

                    if (totalCookiesNormais > 0 && totalCookiesNormais < minTotal) {
                        grupoValido = false;
                        temErroDeMinimo = true;
                    }
                } else if (infoGrupo.quantidade > 0 && infoGrupo.quantidade < minTotal) {
                    grupoValido = false;
                    temErroDeMinimo = true;
                    if (erroCategoriaElemento) {
                        erroCategoriaElemento.textContent = `Mínimo de ${minTotal} unidades na categoria ${grupo}.`;
                        erroCategoriaElemento.style.display = 'block';
                    }
                } else {
                    if (erroCategoriaElemento) erroCategoriaElemento.style.display = 'none';
                }
            } else {
                if (erroCategoriaElemento) erroCategoriaElemento.style.display = 'none';
            }

            infoGrupo.items.forEach(item => {
                const isMiniCookie = item.itemId === MINI_COOKIE_ID;
                const isDocesSalgadosCheck = gruposComMinimoIndividual.includes(grupo) && item.min > 1;
                const isIndividualMinCheck = isDocesSalgadosCheck || isMiniCookie;
                const isItemValido = item.quantidade >= item.min;
                
                if (item.quantidade > 0) {
                    let shouldIncludeInTotal = true;
                    if (isIndividualMinCheck && !isItemValido) { shouldIncludeInTotal = false; temErroDeMinimo = true; }
                    if (minTotal > 0 && !grupoValido) { shouldIncludeInTotal = false; }
                    
                    if (shouldIncludeInTotal) {
                        const totalItem = item.quantidade * item.preco;
                        totalBruto += totalItem;
                        totalItens += item.quantidade;
                        if (!gruposResumo[grupo]) gruposResumo[grupo] = [];
                        gruposResumo[grupo].push({ ...item });
                    }
                }
            });
        }

        const descontoTotal = cupomAplicado.desconto;
        let totalLiquido = totalBruto;
        if (descontoTotal > 0) { totalLiquido = totalBruto - descontoTotal; }

        const totalBrutoFormatado = totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const totalLiquidoFormatado = totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        for (const grupo in gruposResumo) {
            resumoItensPopup.innerHTML += `<div class="resumo-grupo-titulo">${grupo}:</div>`;
            gruposResumo[grupo].forEach(item => {
                const precoTotalItem = item.quantidade * item.preco;
                let precoExibicao = `R$ ${precoTotalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                
                resumoItensPopup.innerHTML += `
                    <div class="resumo-item-line">
                        <div class="resumo-item-name">
                            ${item.descricaoResumo} 
                            <small>${precoExibicao}</small>
                        </div>
                        <div class="resumo-item-input-group">
                            <button type="button" class="resumo-qtd-btn" onclick="alterarQuantidadeResumo('${item.itemId}', -1)">-</button>
                            <input type="number" min="0" value="${item.quantidade}" data-item-id="${item.itemId}" readonly>
                            <button type="button" class="resumo-qtd-btn" onclick="alterarQuantidadeResumo('${item.itemId}', 1)">+</button>
                        </div>
                        <button class="btn-excluir" onclick="excluirItem('${item.itemId}')" title="Remover item"><i class="fas fa-trash"></i></button>
                    </div>`;
            });
        }

           if (totalBruto === 0) {
               // nothing to show when no items
               resumoTotalPopup.innerHTML = '';
               resumoTotalPopup.style.display = 'none';
           } else {
               resumoTotalPopup.style.display = '';
               if (descontoTotal > 0) {
                  resumoTotalPopup.classList.remove('compact');
                  resumoTotalPopup.innerHTML = `
                     <div class="resumo-total-line font-display">VALOR DO PEDIDO: R$ ${totalBrutoFormatado}</div>
                     <div class="resumo-total-line font-display" style="color:var(--danger)">DESCONTO CUPOM: R$ ${descontoTotal.toFixed(2).replace('.', ',')}</div>
                     <div class="resumo-total font-display">TOTAL: R$ ${totalLiquidoFormatado}</div>`;
               } else {
                  // only total -> use compact spacing
                  resumoTotalPopup.classList.add('compact');
                  resumoTotalPopup.innerHTML = `<div class="resumo-total font-display">TOTAL: R$ ${totalBrutoFormatado}</div>`;
                  const cupomMessage = document.getElementById('cupom-message');
                  if (cupomMessage) {
                      cupomMessage.textContent = '';
                      // reset coupon only if no total
                  }
               }
           }

        if (totalBruto > 0 && !temErroDeMinimo) {
             fazerPedidoContainer.innerHTML = '<button onclick="abrirPopup()" class="btn-fazer-pedido">FAZER PEDIDO</button>';
        } else {
             fazerPedidoContainer.innerHTML = '';
        }
        
        if (totalBruto > 0) {
            document.getElementById("summary-total").textContent = `R$ ${totalLiquidoFormatado}`;
            document.getElementById("summary-item-count").textContent = ` / ${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`;
            fixedSummary.style.display = 'flex'; // Flex para alinhar
        } else {
            document.getElementById("summary-total").textContent = `R$ 0,00`;
            fixedSummary.style.display = 'none';
            fecharResumoPopup();
        }
    }

    window.confirmarPedido = function() {
        const linhaSeparadora = "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - -";
        const idPedido = gerarIdPedido();

        let resumoWhatsapp = "Olá, Favu!\nGostaria de saber a disponibilidade para encomendar os itens abaixo:\n\n*ID do Pedido: " + idPedido + "*\n\n" + linhaSeparadora + "\n\n- *Resumo do Pedido:*\n\n";
        let totalPedido = 0; 
        let temErroDeMinimo = false;
        const gruposResumo = {}; 
        const totaisPorGrupo = {};
        
        let temItensNoPedido = false; 
        document.querySelectorAll(".quantidade-input").forEach(input => {
            const quantidade = parseInt(input.value) || 0;
            const min = parseInt(input.getAttribute("data-min")) || 1;
            const preco = parseFloat(input.getAttribute("data-preco")) || 0;
            const descricaoResumo = input.getAttribute("data-resumo");
            const grupo = input.getAttribute("data-grupo");
            const itemId = input.getAttribute("data-item-id");
            
            if (quantidade > 0) { temItensNoPedido = true; }
            if (!totaisPorGrupo[grupo]) { totaisPorGrupo[grupo] = { quantidade: 0, items: [] }; }
            totaisPorGrupo[grupo].quantidade += quantidade;
            totaisPorGrupo[grupo].items.push({ quantidade, min, preco, descricaoResumo, grupo, itemId });
        });

        if (!temItensNoPedido) {
            alert("Seu pedido está vazio. Adicione itens para confirmar.");
            fecharPopup();
            return;
        }

        for (const grupo in totaisPorGrupo) {
            const infoGrupo = totaisPorGrupo[grupo];
            const idTabela = `tabela-${grupo.toLowerCase().replace(/\s/g, '-')}`;
            const minTotal = gruposItens[idTabela]?.minTotal || 0;
            const isCookieGroup = grupo === "Cookies";
            
            let grupoValido = true;
            if (minTotal > 0) {
                if (isCookieGroup) {
                    let totalCookiesNormais = 0;
                    infoGrupo.items.forEach(item => {
                        const isMiniCookie = item.itemId === MINI_COOKIE_ID;
                        if (!isMiniCookie) { totalCookiesNormais += item.quantidade; }
                    });
                    if (totalCookiesNormais > 0 && totalCookiesNormais < minTotal) { grupoValido = false; temErroDeMinimo = true; }
                } else if (infoGrupo.quantidade > 0 && infoGrupo.quantidade < minTotal) {
                    grupoValido = false; temErroDeMinimo = true;
                }
            }

            infoGrupo.items.forEach(item => {
                const isMiniCookie = item.itemId === MINI_COOKIE_ID;
                const isDocesSalgadosCheck = gruposComMinimoIndividual.includes(grupo) && item.min > 1;
                const isIndividualMinCheck = isDocesSalgadosCheck || isMiniCookie;
                const isItemValido = item.quantidade >= item.min;

                let shouldIncludeInTotal = true;
                if (item.quantidade > 0 && isIndividualMinCheck && !isItemValido) { shouldIncludeInTotal = false; temErroDeMinimo = true; }
                if (minTotal > 0 && !grupoValido) { shouldIncludeInTotal = false; }

                if (item.quantidade > 0 && shouldIncludeInTotal) {
                    const totalItem = item.quantidade * item.preco;
                    totalPedido += totalItem;
                    if (!gruposResumo[grupo]) { gruposResumo[grupo] = []; }
                    gruposResumo[grupo].push({ descricao: item.descricaoResumo, quantidade: item.quantidade, preco: item.preco });
                }
            });
        }
        
        if (totalPedido === 0 && temItensNoPedido) { temErroDeMinimo = true; }

        if (temErroDeMinimo) {
             alert("Por favor, ajuste as quantidades mínimas do seu pedido antes de confirmar.");
             atualizarTotal(); 
             abrirResumoPopup();
             return;
        }

        const desconto = cupomAplicado.desconto;
        const totalLiquido = totalPedido - desconto;

        let resumoItensTexto = "";
        for (const grupo in gruposResumo) {
            resumoWhatsapp += `⤷${grupo}:\n`;
            resumoItensTexto += `${grupo}:\n`;
            gruposResumo[grupo].forEach(item => {
                const precoUnitario = item.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const totalItem = (item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const linhaItem = `${item.descricao} - ${item.quantidade} unidades (R$ ${precoUnitario} cada) = R$ ${totalItem}`;
                resumoWhatsapp += `${linhaItem}\n`;
                resumoItensTexto += `${linhaItem}\n`;
            });
            resumoWhatsapp += `\n`; 
            resumoItensTexto += `\n`;
        }

        const nome = document.getElementById("nome").value;
        const telefoneRaw = document.getElementById("telefone").value;
        const data = document.getElementById("data").value;
        const horario = document.getElementById("horario").value;
        const pagamento = document.getElementById("pagamento").value;

        if (!nome || !telefoneRaw || !data || !horario || !pagamento) { alert("Por gentileza, preencha todos os campos!"); return; }

        const telefone = validarEFormatarTelefone(telefoneRaw);
        const dataFormatada = data; // Data already in DD/MM/YY format from Flatpickr
        const horarioLimpo = String(document.getElementById('horario').value).substring(0, 5);

        resumoWhatsapp += "\n" + linhaSeparadora + "\n\n";
        resumoWhatsapp += `- *Informações do Pedido:*\n\nNome: ${nome}\nNúmero: ${telefone}\n\nData da entrega: ${dataFormatada}\nHorário da entrega: ${horarioLimpo}\n\n`;
        resumoWhatsapp += `Forma de pagamento: ${pagamento}\n`;
        resumoWhatsapp += `Total do pedido: R$ ${totalPedido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
        if (desconto > 0 && cupomAplicado && cupomAplicado.codigo) {
            resumoWhatsapp += `Cupom: ${cupomAplicado.codigo} (-R$ ${desconto.toFixed(2).replace('.', ',')})\n`;
        }
        const totalFinalFormatado = totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        resumoWhatsapp += `*Total Final: R$ ${totalFinalFormatado}*\n`;

        const observacoesElement = document.getElementById("observacoes");
        const observacoes = observacoesElement ? observacoesElement.value.trim() : '';
        if (observacoes) { resumoWhatsapp += `\nObservações: ${observacoes}`; }

        const dadosPedido = {
            ID_do_Pedido: idPedido,
            Nome_Cliente: nome,
            Numero: telefone,
            Data_Entrega: dataFormatada,
            Horario_Entrega: horarioLimpo,
            Resumo_dos_Itens: resumoItensTexto.trim(),
            Total_Final: totalFinalFormatado,
            Forma_de_Pagamento: pagamento,
            Cupom: cupomAplicado.codigo || "",
            Status_Pagamento: "Pendente",
            Status_do_Pedido: "Pedido Recebido"
        };
        
        if (observacoes) { dadosPedido.Observacoes = observacoes; }
        dadosPedido.Resumo_WhatsApp = resumoWhatsapp;
        
        if (oldPedidoId !== null) {
            dadosPedido.action = 'replacePedido';
            dadosPedido.oldId = oldPedidoId;
        }
        
        console.log("Enviando pedido para planilha:", dadosPedido);
        enviarPedidoParaPlanilha(dadosPedido);

        const whatsappLink = `https://wa.me/558195256641?text=${encodeURIComponent(resumoWhatsapp)}`;
        window.open(whatsappLink, '_blank');

        if (CUPONS_GERADOS[cupomAplicado.codigo]) { CUPONS_GERADOS[cupomAplicado.codigo].usado = true; }
        alert("Pedido realizado com sucesso!");
        resetarCampos();
    }

    function resetarCampos() {
        document.querySelectorAll(".quantidade-input").forEach(input => {
            input.value = "0"; 
            const erroElemento = input.closest('.quantidade-container').querySelector('.erro-item-unico');
            if (erroElemento) erroElemento.style.display = 'none';
        });
        document.querySelectorAll('.erro-categoria').forEach(el => el.style.display = 'none');
        const resumoItens = document.getElementById("popup-resumo-itens");
        const resumoTotal = document.getElementById("popup-resumo-total");
        if (resumoItens) resumoItens.innerHTML = '';
        if (resumoTotal) resumoTotal.textContent = '';
        cupomAplicado = { codigo: null, desconto: 0, mensagem: '' };
        const cupomInput = document.getElementById('cupom-input');
        if(cupomInput) cupomInput.value = '';

        fecharPopup();
        fecharResumoPopup();
        atualizarTotal();
        window.scrollTo(0, 0);
    }
    
    // -----------------------------------------------------
    // INICIALIZAÇÃO E EVENTOS
    // -----------------------------------------------------
    // 0. Verifica parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const nomeParam = urlParams.get('nome');
    const telParam = urlParams.get('tel');
    const oldIdParam = urlParams.get('oldId');
    if (nomeParam) document.getElementById('nome').value = decodeURIComponent(nomeParam);
    if (telParam) document.getElementById('telefone').value = decodeURIComponent(telParam);
    if (oldIdParam) oldPedidoId = decodeURIComponent(oldIdParam);
    
    // 1. Cria as tabelas
    for (const idTabela in gruposItens) {
        criarTabelaGrupo(gruposItens[idTabela].itens, idTabela, gruposItens[idTabela].nomeGrupo);
    }

    // 2. Eventos de input
    document.querySelectorAll(".quantidade-input").forEach(input => {
        input.addEventListener("input", atualizarTotal);
        input.addEventListener("blur", function() {
            const quantidade = parseInt(this.value) || 0;
            if (this.value === "" || quantidade <= 0) { this.value = "0"; } 
            else { this.value = quantidade.toString(); }
            atualizarTotal();
        });
    });
    
    // 3. Navegação por abas
    const links = document.querySelectorAll('#categorias-horizontal a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove active de todos
            links.forEach(l => l.classList.remove('active-link'));
            document.querySelectorAll('.categoria-group').forEach(group => group.classList.remove('active-group'));
            
            // Adiciona active no clicado
            this.classList.add('active-link');
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active-group');
            
            // Scroll suave (com offset do header)
            const imgId = this.getAttribute('data-img');
            const targetElement = document.getElementById(imgId);
            if (targetElement) {
                 const offset = document.getElementById('sticky-nav-container').offsetHeight + 100;
                 const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                 window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
            }
        });
    });

    // 4. Inicia com a primeira aba
    const primeiroLink = document.querySelector('#categorias-horizontal a[data-target="grupo-bolo-tradicional"]');
    if (primeiroLink) primeiroLink.click();
    
    // 5. Fechamento de popups ao clicar fora
    document.addEventListener('click', function(event) {
        const popupResumo = document.getElementById('popup-resumo');
        const popupPedido = document.getElementById('popup-pedido');
        const popupNatal = document.getElementById('popup-natal');
        
        if (popupResumo && popupResumo.style.display === 'flex' && event.target === popupResumo) { fecharResumoPopup(); }
        if (popupPedido && popupPedido.style.display === 'flex' && event.target === popupPedido) { fecharPopup(); }
        if (popupNatal && popupNatal.style.display === 'flex' && event.target === popupNatal) { fecharPopupNatal(); }
    });

    // 6. Popup de Natal (Lógica de data com período configurável)
    function abrirPopupNatal() {
        const hojeISO = new Date().toISOString().split('T')[0];
        const dataInicio = POPUP_NATAL_CONFIG.dataInicio;
        const dataFim = POPUP_NATAL_CONFIG.dataFim;
        
        // Mostra o popup apenas se a data atual estiver dentro do período definido
        if (hojeISO >= dataInicio && hojeISO <= dataFim) { 
            document.getElementById('popup-natal').style.display = 'flex'; 
        }
    }
    abrirPopupNatal();

    atualizarTotal();
});