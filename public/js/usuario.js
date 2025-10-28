function initSidebarEvents() {
    
    // --- Referencias del DOM del Sidebar ---
    const sidebar = document.getElementById('sidebar'); 
    const sidebarToggleInternal = document.getElementById('sidebar-toggle-internal'); 
    const sidebarToggleMain = document.getElementById('sidebar-toggle-main'); // Botón hamburguesa
    const allNavItems = document.querySelectorAll('#sidebar .nav-item'); 
    const menuToggles = document.querySelectorAll('#sidebar .nav-item.has-submenu'); 
    const nonParentItems = document.querySelectorAll('#sidebar .nav-item:not(.has-submenu)'); 

    // --- Lógica del Menú Lateral (Sidebar) ---
    const setAllInactive = () => {
        allNavItems.forEach(item => {
            item.classList.remove('active', 'open');
        });
        menuToggles.forEach(toggle => {
            const submenu = toggle.querySelector('.submenu'); 
            if (submenu) {
                submenu.style.maxHeight = null; 
            }
            const arrow = toggle.querySelector('.arrow-icon');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        });
    };

    menuToggles.forEach(toggle => {
        const header = toggle.querySelector('.submenu-header');
        if (header) {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                const submenu = toggle.querySelector('.submenu');
                const arrow = header.querySelector('.arrow-icon'); 
                const wasOpen = toggle.classList.contains('open'); 
                
                if (!wasOpen) {
                    setAllInactive(); // Cierra todo antes de abrir
                } else {
                    // Si ya estaba abierto, solo quita active de otros simples
                    nonParentItems.forEach(item => item.classList.remove('active'));
                }
                
                // Abre/Cierra el actual
                toggle.classList.toggle('open');
                toggle.classList.add('active'); // Siempre activa el padre
                if (submenu) {
                    submenu.style.maxHeight = toggle.classList.contains('open') ? submenu.scrollHeight + "px" : null;
                }
                if (arrow) arrow.style.transform = toggle.classList.contains('open') ? 'rotate(90deg)' : 'rotate(0deg)';
            });
        }
    });

    nonParentItems.forEach(item => {
        item.addEventListener('click', () => {
            setAllInactive(); 
            item.classList.add('active'); 
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Activa el item inicial (ej: Administración > Usuarios)
    // NOTA: Debes añadir 'initial-active' al LI de 'Administración'
    // y 'initial-active-sub' al 'a' de 'Usuarios' en sidebar.html.
    const initialActiveParent = document.querySelector('#sidebar .initial-active');
    const initialActiveSub = document.querySelector('#sidebar .initial-active-sub');
    
    if (initialActiveParent) {
        initialActiveParent.classList.add('active', 'open');
         const initialSubmenu = initialActiveParent.querySelector('.submenu'); // Busca submenu dentro
         const initialArrow = initialActiveParent.querySelector('.submenu-header .arrow-icon'); // Busca flecha dentro
        if(initialSubmenu) initialSubmenu.style.maxHeight = initialSubmenu.scrollHeight + "px";
        if(initialArrow) initialArrow.style.transform = 'rotate(90deg)';
        if (initialActiveSub) {
             const subItemLi = initialActiveSub.closest('li'); // Aplica active al LI
            if(subItemLi) subItemLi.classList.add('active'); 
        }
    } else if (initialActiveSub) { 
        const subItemLi = initialActiveSub.closest('li');
        if(subItemLi) subItemLi.classList.add('active');
        const parentLi = initialActiveSub.closest('.has-submenu'); // Busca el LI padre
        if(parentLi) parentLi.classList.add('active');
    }

    // --- Lógica para botón de colapsar sidebar (interno) ---
    if (sidebarToggleInternal && sidebar) {
        sidebarToggleInternal.addEventListener('click', () => {
            const isMobileView = window.innerWidth <= 768;
            if (!isMobileView) { 
                const isCollapsed = sidebar.style.width === '80px';
                if (isCollapsed) {
                    sidebar.style.width = '250px';
                } else {
                    menuToggles.forEach(toggle => {
                        toggle.classList.remove('open');
                        const submenu = toggle.querySelector('.submenu');
                        const arrow = toggle.querySelector('.submenu-header .arrow-icon');
                        if(submenu) submenu.style.maxHeight = null;
                        if(arrow) arrow.style.transform = 'rotate(0deg)';
                    });
                    sidebar.style.width = '80px';
                }
            } else {
                 sidebar.classList.remove('open'); // Cierra en móvil
            }
        });
    }
    
    // --- Lógica para botón hamburguesa (móvil) ---
    if (sidebarToggleMain && sidebar) {
        sidebarToggleMain.addEventListener('click', (e) => {
             e.stopPropagation(); // Evita que el clic se propague al document
            sidebar.classList.toggle('open');
        });
    }
    
     // --- Cerrar sidebar en móvil al hacer clic fuera ---
    document.addEventListener('click', function(event) {
        const isMobileView = window.innerWidth <= 768;
        if (isMobileView && sidebar && sidebar.classList.contains('open')) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnToggleButton = sidebarToggleMain && sidebarToggleMain.contains(event.target);
            
            if (!isClickInsideSidebar && !isClickOnToggleButton) {
                sidebar.classList.remove('open');
            }
        }
    });

} // --- FIN de initSidebarEvents ---


// --- Carga del Sidebar y Ejecución Inicial ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- EL FETCH (Carga el menú lateral) ---
    fetch("sidebar.html") // Asume que está en la misma carpeta que usuarios.html
        .then(res => {
            if (!res.ok) throw new Error('No se encontró siderbar.html'); 
            return res.text();
        })
        .then(html => {
            const sidebarContainer = document.getElementById("sidebar-container");
            if(sidebarContainer) {
                sidebarContainer.innerHTML = html;
                // Ahora que el HTML existe, inicializa los eventos
                initSidebarEvents(); 
                // No necesitas lucide aquí si no hay iconos lucide
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