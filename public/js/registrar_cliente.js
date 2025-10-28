function initSidebarEvents() {
    
    // --- Referencias del DOM del Sidebar (se buscan DESPUÉS del fetch) ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleMobile = document.getElementById('sidebar-toggle-mobile'); // En el sidebar
    const sidebarToggleMain = document.getElementById('sidebar-toggle-mobile-main'); // En el header principal (si existiera)
    const allNavItems = document.querySelectorAll('#sidebar .nav-item'); // Busca dentro del sidebar cargado
    const menuToggles = document.querySelectorAll('#sidebar .nav-item.is-parent');
    const nonParentItems = document.querySelectorAll('#sidebar .nav-item:not(.is-parent)');

    // --- Lógica del Menú Lateral (Sidebar) ---
    const setAllInactive = () => {
        allNavItems.forEach(item => {
            item.classList.remove('active', 'open');
        });
        menuToggles.forEach(toggle => {
            const submenu = toggle.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu-container')) {
                submenu.classList.remove('open');
            }
            const arrow = toggle.querySelector('.submenu-arrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        });
    };

    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.closest('.submenu-item')) return; 

            const submenu = toggle.nextElementSibling;
            const arrow = toggle.querySelector('.submenu-arrow');
            const wasOpen = submenu && submenu.classList.contains('open');
            
            setAllInactive(); 
            
            if (!wasOpen && submenu) {
                submenu.classList.add('open');
                toggle.classList.add('open', 'active'); 
                if (arrow) arrow.style.transform = 'rotate(90deg)';
            }
        });
    });

    nonParentItems.forEach(item => {
        item.addEventListener('click', () => {
            setAllInactive();
            item.classList.add('active');
            if (window.innerWidth <= 1023 && sidebar) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Activa el item inicial (ej: Clientes > Registrar)
    // NOTA: Debes añadir 'initial-active' al LI de 'Clientes'
    // y 'initial-active-sub' al 'a' de 'Registrar Cliente' en sidebar.html
    const initialActiveParent = document.querySelector('#sidebar .initial-active');
    const initialActiveSub = document.querySelector('#sidebar .initial-active-sub');
    
    if (initialActiveParent) {
         initialActiveParent.classList.add('active', 'open');
         const initialSubmenu = initialActiveParent.nextElementSibling;
         const initialArrow = initialActiveParent.querySelector('.submenu-arrow');
         if(initialSubmenu) initialSubmenu.classList.add('open');
         if(initialArrow) initialArrow.style.transform = 'rotate(90deg)';
         
         if (initialActiveSub) {
             initialActiveSub.classList.add('active'); 
         }
    } else if (initialActiveSub) { 
        initialActiveSub.classList.add('active');
        const parentLi = initialActiveSub.closest('.submenu-container')?.previousElementSibling;
        if(parentLi) parentLi.classList.add('active');
    }

    // --- Lógica para botones móviles (Toggle Sidebar) ---
    const toggleSidebar = () => sidebar?.classList.toggle('open');
    if (sidebarToggleMobile) sidebarToggleMobile.addEventListener('click', toggleSidebar);
    if (sidebarToggleMain) sidebarToggleMain.addEventListener('click', toggleSidebar);
}


// --- Lógica del Formulario y Modal (Fuera de initSidebarEvents) ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos Lucide AHORA
    lucide.createIcons();

    // --- Referencias del Formulario ---
    const tabItems = document.querySelectorAll('.tab-item');
    const multiStepForm = document.getElementById('multiStepForm');
    const steps = document.querySelectorAll('.form-step');
    const successModal = document.getElementById('successModal');
    const closeModalSuccess = document.getElementById('closeModalSuccess');
    const customerNameDisplay = document.getElementById('customerNameDisplay');
    const nameInput = document.getElementById('nombresApellidos');
    const tipoClienteRadios = document.querySelectorAll('input[name="tipoCliente"]');
    const tipoDocumentoSelect = document.getElementById('tipoDocumento');
    const nDocumentoInput = document.getElementById('nDocumento');
    const nDocumentoLabel = document.querySelector('label[for="nDocumento"]');

    // --- Lógica del Formulario Multi-paso ---
    const updateTabsAndSteps = (targetStep) => {
        tabItems.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.step == targetStep) tab.classList.add('active');
        });
        steps.forEach(step => step.classList.remove('active'));
        const targetStepElement = document.querySelector(`.form-step[data-step="${targetStep}"]`);
        if(targetStepElement) targetStepElement.classList.add('active');
    };
    
    // --- Lógica Tipo Cliente / Documento ---
    const actualizarTipoDocumento = () => {
        const tipoClienteSeleccionado = document.querySelector('input[name="tipoCliente"]:checked').value;
        
        if (tipoClienteSeleccionado === 'Empresarial') {
            if (tipoDocumentoSelect) {
                tipoDocumentoSelect.value = 'RUC';
                tipoDocumentoSelect.disabled = true; // Bloquear
            }
            if (nDocumentoLabel) nDocumentoLabel.textContent = 'Nº de RUC:';
        } else { // Residencia
            if (tipoDocumentoSelect) {
                tipoDocumentoSelect.value = 'DNI'; // Volver a DNI por defecto
                tipoDocumentoSelect.disabled = false; // Desbloquear
            }
             if (nDocumentoLabel) nDocumentoLabel.textContent = 'Nº de Documento:';
        }
         // Ocultar RUC si es residencia (opcional pero recomendado)
         const rucOption = tipoDocumentoSelect?.querySelector('option[value="RUC"]');
         if (rucOption) rucOption.hidden = (tipoClienteSeleccionado !== 'Empresarial');
    };
    
    // Ejecutar al inicio y al cambiar
    if (tipoClienteRadios.length > 0) {
        actualizarTipoDocumento(); // Ejecuta al cargar la página
        tipoClienteRadios.forEach(radio => radio.addEventListener('change', actualizarTipoDocumento));
    }


    // --- Lógica Botones Siguiente/Anterior ---
    document.querySelectorAll('.btn-next, .btn-prev').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetStep = button.dataset.targetStep;
            
            // Validar campos del paso 1 antes de avanzar
            if (targetStep == 2) {
                const step1Inputs = document.querySelectorAll('.form-step[data-step="1"] [required]');
                let isValid = true;
                step1Inputs.forEach(input => {
                    if (!input.value) {
                         isValid = false;
                         input.style.borderColor = 'red'; // Marcar campo vacío
                    } else {
                         input.style.borderColor = ''; // Quitar marca si está lleno
                    }
                });
                
                if (!isValid) {
                     alert("Por favor, complete todos los campos requeridos del Paso 1.");
                     return; // No avanzar
                }
                
                // Actualizar nombre en paso 2
                if(customerNameDisplay && nameInput) {
                    customerNameDisplay.textContent = nameInput.value || "(Cliente no especificado)";
                }
            }
            
            updateTabsAndSteps(targetStep);
            window.scrollTo(0, 0); // Subir al inicio
        });
    });

    // --- Lógica Clic en Pestañas ---
    tabItems.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetStep = tab.dataset.step;
            
            // Permite ir al paso 2 solo si el paso 1 está completo
            if(targetStep == 2) {
                 const step1Inputs = document.querySelectorAll('.form-step[data-step="1"] [required]');
                 let isValid = true;
                 step1Inputs.forEach(input => { if (!input.value) isValid = false; });
                 
                 if (isValid) { 
                     if(customerNameDisplay && nameInput) {
                         customerNameDisplay.textContent = nameInput.value || "(Cliente no especificado)";
                     }
                     updateTabsAndSteps(targetStep);
                 } else {
                     alert("Por favor, complete los datos del cliente (Paso 1) antes de continuar.");
                 }
            } else { // Siempre permite volver al paso 1
                 updateTabsAndSteps(targetStep);
            }
        });
    });

    // --- Lógica del Modal de Éxito ---
    const closeTheModal = () => {
        if (successModal) {
            successModal.classList.remove('open');
            setTimeout(() => {
                successModal.classList.add('hidden');
            }, 300); // Esperar animación
        }
        if (multiStepForm) multiStepForm.reset(); // Limpiar formulario
        actualizarTipoDocumento(); // Resetear tipo de documento
        updateTabsAndSteps(1); // Volver al paso 1
        if(customerNameDisplay) customerNameDisplay.textContent = "(Nombre)";
        window.scrollTo(0, 0); 
    }

    if (multiStepForm) {
        multiStepForm.addEventListener('submit', (e) => {
            e.preventDefault(); 
            // Aquí iría la lógica para enviar los datos...
             console.log("Formulario enviado (simulación)");
             
            // Mostrar modal
            if (successModal) {
                successModal.classList.remove('hidden');
                requestAnimationFrame(() => { // Asegura que no esté hidden antes de la transición
                     successModal.classList.add('open');
                });
                lucide.createIcons(); // Recargar icono por si acaso
            }
        });
    }

    if (closeModalSuccess) {
        closeModalSuccess.addEventListener('click', closeTheModal);
    }
    
    if (successModal) {
        // Cerrar al hacer clic fuera del modal
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) { 
                closeTheModal();
            }
        });
    }

    // --- EL FETCH (Carga el menú lateral) ---
    fetch("sidebar.html") // Asumiendo que está en la misma carpeta
        .then(res => {
            if (!res.ok) throw new Error('No se encontró siderbar.html'); 
            return res.text();
        })
        .then(html => {
            const sidebarContainer = document.getElementById("sidebar-container");
            if(sidebarContainer) {
                sidebarContainer.innerHTML = html;
                initSidebarEvents(); // Inicializa eventos del sidebar AHORA
                lucide.createIcons({ nodes: [sidebarContainer] }); // Iconos del sidebar
            }
        })
        .catch(err => {
            console.error("Error al cargar el sidebar:", err);
            const sidebarContainer = document.getElementById("sidebar-container");
            if(sidebarContainer) {
                sidebarContainer.innerHTML = 
                    `<p style="color: red; padding: 20px;">Error al cargar el menú: ${err.message}</p>`;
            }
        });
}); // Fin del DOMContentLoaded