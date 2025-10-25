function initSidebarEvents() {
    
    // --- LOGIC 1: Acordeón (para los submenús) ---
    document.querySelectorAll(".has-submenu").forEach(item => {
        const header = item.querySelector(".submenu-header");
        if (header) { 
            header.addEventListener("click", () => {
                
                // Cierra otros submenús abiertos
                document.querySelectorAll(".has-submenu.open").forEach(openItem => {
                    if (openItem !== item) {
                        openItem.classList.remove("open");
                    }
                });
                
                // Abre/cierra el submenú actual
                item.classList.toggle("open");
            });
        }
    });

    // --- LOGIC 2: Botón de Colapsar (el de la flecha) ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleInternal = document.getElementById('sidebar-toggle-internal');

    if (sidebarToggleInternal && sidebar) {
        sidebarToggleInternal.addEventListener('click', () => {
            const isMobileView = window.innerWidth <= 768;
            if (!isMobileView) { // El toggle no funciona en móvil
                const isCollapsed = sidebar.style.width === '80px';
                if (isCollapsed) {
                    sidebar.style.width = '250px';
                } else {
                    // Cierra submenús antes de colapsar
                    document.querySelectorAll(".has-submenu.open").forEach(item => item.classList.remove("open"));
                    sidebar.style.width = '80px';
                }
            }
        });
    }

    // --- LOGIC 3: Estado Activo (Marcar el link con fondo azul) ---
    const allNavItems = document.querySelectorAll('.sidebar-nav > ul > li.nav-item');
    
    allNavItems.forEach(item => {
        
        // Define el elemento 'clickable' (el header o el item entero)
        const clickableElement = item.querySelector(".submenu-header") || item;
        
        clickableElement.addEventListener('click', function() {
            const isMobileView = window.innerWidth <= 768;
            if (isMobileView) return; // No hacer nada en móvil

            // Quita 'active' de todos
            allNavItems.forEach(i => i.classList.remove('active'));
            
            // Añade 'active' solo al LI principal
            item.classList.add('active');
        });
    });

    // --- LOGIC 4: Estado Inicial (Activa "Planes" al cargar) ---
    // NOTA: Tu HTML no tenía un 'initial-active' para esta página,
    // así que tendrás que añadirlo en el 'siderbar.html' si quieres
    // que "Administración" aparezca activo por defecto.
    const initialActive = document.querySelector('.nav-item.initial-active');
    if (initialActive) {
        initialActive.classList.add('active');
        if (initialActive.classList.contains('has-submenu')) {
            initialActive.classList.add('open');
        }
    }
}

// --- EL FETCH (Esto es lo que carga el menú) ---
// Se ejecuta apenas carga la página
fetch("siderbar.html") // Asumiendo que siderbar.html está en la misma carpeta
    .then(res => {
        if (!res.ok) throw new Error('No se encontró siderbar.html'); 
        return res.text();
    })
    .then(html => {
        // 1. Inserta el HTML del menú en el div
        document.getElementById("sidebar-container").innerHTML = html;

        // 2. ¡IMPORTANTE!
        // Ahora que el HTML del menú SÍ EXISTE, 
        // llamamos a nuestra función para que encuentre los botones.
        initSidebarEvents();
    })
    .catch(err => {
        // Muestra un error si el fetch falla
        console.error("Error al cargar el sidebar:", err);
        document.getElementById("sidebar-container").innerHTML = 
            `<p style="color: red; padding: 20px;">Error al cargar el menú: ${err.message}</p>`;
    });