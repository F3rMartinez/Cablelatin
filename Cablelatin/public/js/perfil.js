function initSidebarEvents() {
    
    // --- Referencias del DOM del Sidebar (se buscan DESPUÉS del fetch) ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleMobile = document.getElementById('sidebar-toggle-mobile'); // En el sidebar
    const sidebarToggleMain = document.getElementById('sidebar-toggle-mobile-main'); // En el header principal
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
            // Evita que el clic en un item del submenú cierre el submenú
            if (e.target.closest('.submenu-item')) return; 

            const submenu = toggle.nextElementSibling;
            const arrow = toggle.querySelector('.submenu-arrow');
            const wasOpen = submenu && submenu.classList.contains('open');
            
            setAllInactive(); // Cierra todo primero
            
            if (!wasOpen && submenu) {
                submenu.classList.add('open');
                toggle.classList.add('open', 'active'); // Marca el padre como activo también
                if (arrow) arrow.style.transform = 'rotate(90deg)';
            }
        });
    });

    nonParentItems.forEach(item => {
        item.addEventListener('click', () => {
            setAllInactive();
            item.classList.add('active');
            // Cierra el sidebar en móvil si se hace clic en un item sin submenú
            if (window.innerWidth <= 1023 && sidebar) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Activa el item inicial (ej: Configuración > Mi Perfil)
    // NOTA: Debes añadir 'initial-active' al LI de 'Configuración'
    // y 'initial-active-sub' al 'a' de 'Mi Perfil' en sidebar.html
    const initialActiveParent = document.querySelector('#sidebar .initial-active');
    const initialActiveSub = document.querySelector('#sidebar .initial-active-sub');
    
    if (initialActiveParent) {
         initialActiveParent.classList.add('active', 'open');
         const initialSubmenu = initialActiveParent.nextElementSibling;
         const initialArrow = initialActiveParent.querySelector('.submenu-arrow');
         if(initialSubmenu) initialSubmenu.classList.add('open');
         if(initialArrow) initialArrow.style.transform = 'rotate(90deg)';
         
         if (initialActiveSub) {
             initialActiveSub.classList.add('active'); // Marca el subitem
         }
    } else if (initialActiveSub) { // Si solo hay subitem activo (raro)
        initialActiveSub.classList.add('active');
        // Intenta activar el padre si existe
        const parentLi = initialActiveSub.closest('.submenu-container')?.previousElementSibling;
        if(parentLi) parentLi.classList.add('active');
    }


    // --- Lógica para botones móviles (Toggle Sidebar) ---
    const toggleSidebar = () => sidebar?.classList.toggle('open');
    if (sidebarToggleMobile) sidebarToggleMobile.addEventListener('click', toggleSidebar);
    if (sidebarToggleMain) sidebarToggleMain.addEventListener('click', toggleSidebar);
}


// --- Lógica del Formulario y Modal de Perfil (Fuera de initSidebarEvents) ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos Lucide AHORA, porque están en el HTML principal
    lucide.createIcons();

    // Referencias del Formulario y Modal
    const profileForm = document.getElementById('profileForm');
    const profileModal = document.getElementById('profileSuccessModal');
    const closeProfileModalBtn = document.getElementById('closeProfileModal');
    const passCurrentInput = document.getElementById('passCurrent');
    const passNewInput = document.getElementById('passNew');

    // Función para CERRAR el modal
    const closeProfileModal = () => {
        if (profileModal) {
            profileModal.classList.remove('open');
            setTimeout(() => {
                profileModal.classList.add('hidden');
            }, 300); // Esperar animación
            
            // Limpiar campos de contraseña
            if(passCurrentInput) passCurrentInput.value = '';
            if(passNewInput) passNewInput.value = '';
        }
    }
    
    // Evento al ENVIAR el formulario
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Aquí iría la lógica para guardar los datos...
            console.log("Formulario enviado (simulación)");
            
            // Mostrar el modal
            if (profileModal) {
                profileModal.classList.remove('hidden');
                // Pequeño delay para asegurar que no esté hidden antes de la transición
                requestAnimationFrame(() => {
                    profileModal.classList.add('open');
                });
                lucide.createIcons(); // Recargar icono del modal si es necesario
            }
        });
    }
    
    // Evento para CERRAR con el botón "Aceptar"
    if (closeProfileModalBtn) {
        closeProfileModalBtn.addEventListener('click', closeProfileModal);
    }
    
    // Evento para CERRAR haciendo clic en el fondo
    if (profileModal) {
        profileModal.addEventListener('click', (e) => {
            // Cierra solo si se hace clic DIRECTAMENTE en el fondo (no en el contenido)
            if (e.target === profileModal) { 
                closeProfileModal();
            }
        });
    }

    // --- EL FETCH (Carga el menú lateral) ---
    // Esto se ejecuta después de que el DOM esté listo
    fetch("siderbar.html") // Asegúrate que siderbar.html esté en la misma carpeta que perfil.html
        .then(res => {
            if (!res.ok) throw new Error('No se encontró siderbar.html'); 
            return res.text();
        })
        .then(html => {
            // 1. Inserta el HTML del menú
            const sidebarContainer = document.getElementById("sidebar-container");
            if(sidebarContainer) {
                sidebarContainer.innerHTML = html;
                
                // 2. ¡IMPORTANTE! Ahora que el HTML del menú existe, inicializa sus eventos
                initSidebarEvents();
                
                // 3. Inicializa los iconos Lucide DENTRO del sidebar cargado
                lucide.createIcons({
                    // Busca iconos solo dentro del contenedor del sidebar
                    nodes: [sidebarContainer], 
                });
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