
        // ==============================================
        //          LÓGICA DE SIDEBAR (Funciones)
        // ==============================================

        /**
         * Función para alternar la visibilidad de los submenús
         */
        function toggleCollapse(menuId, iconId) {
            // Evita el despliegue de submenús si el sidebar está colapsado 
            if (document.getElementById('sidebar-container').classList.contains('collapsed')) {
                return; 
            }
            
            const menu = document.getElementById(menuId);
            const icon = document.getElementById(iconId);

            if (menu.classList.contains('open')) {
                menu.classList.remove('open');
                if (icon) icon.classList.remove('rotate-icon');
            } else {
                menu.classList.add('open');
                if (icon) icon.classList.add('rotate-icon');
            }
        }
        window.toggleCollapse = toggleCollapse; 

        /**
         * Función para alternar el estado colapsado/expandido del sidebar
         */
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar-container');
            const mainContent = document.querySelector('.main-content');
            const icon = document.getElementById('toggle-icon');
            
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            if (sidebar.classList.contains('collapsed')) {
                // Colapsado: Gira el ícono y cierra todos los submenús
                icon.classList.remove('fa-chevron-left');
                icon.classList.add('fa-chevron-right');
                
                document.querySelectorAll('.sidebar-submenu.open').forEach(menu => {
                     menu.classList.remove('open');
                     const iconId = menu.id.replace('-menu', '-icon');
                     const iconToRotate = document.getElementById(iconId);
                     if(iconToRotate) iconToRotate.classList.remove('rotate-icon');
                });

            } else {
                // Expandido: Gira el ícono y vuelve a abrir el menú de Administración (por ser la página actual)
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-left');
                
                document.getElementById('admin-menu').classList.add('open');
                document.getElementById('admin-icon').classList.add('rotate-icon');
            }
        }
        window.toggleSidebar = toggleSidebar; 

        // --- Configuración inicial al cargar la página ---
        document.addEventListener('DOMContentLoaded', () => {
             // Asegura que el menú de Administración esté abierto por defecto
             document.getElementById('admin-menu').classList.add('open');
             document.getElementById('admin-icon').classList.add('rotate-icon');
        });
