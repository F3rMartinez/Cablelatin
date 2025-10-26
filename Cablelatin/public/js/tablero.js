function initSidebarEvents() {
    
    // --- Referencias del DOM del Sidebar (se buscan DESPUÉS del fetch) ---
    const sidebar = document.getElementById('sidebar'); // Asume que ID="sidebar" está en siderbar.html
    const sidebarToggleInternal = document.getElementById('sidebar-toggle-internal'); // Asume ID en siderbar.html
    //const sidebarToggleMain = document.getElementById('sidebar-toggle-main'); // No parece existir en tu HTML
    const allNavItems = document.querySelectorAll('#sidebar .nav-item'); // Busca dentro del sidebar cargado
    const menuToggles = document.querySelectorAll('#sidebar .nav-item.has-submenu'); // Usa clase has-submenu
    const nonParentItems = document.querySelectorAll('#sidebar .nav-item:not(.has-submenu)'); // Los que NO tienen la clase

    // --- Lógica del Menú Lateral (Sidebar) ---
    const setAllInactive = () => {
        allNavItems.forEach(item => {
            item.classList.remove('active', 'open');
        });
        menuToggles.forEach(toggle => {
            const submenu = toggle.querySelector('.submenu'); // Busca submenú DENTRO del item
            if (submenu) {
                submenu.style.maxHeight = null; // O usar classList.remove('open') si usas clases para animar
            }
            const arrow = toggle.querySelector('.arrow-icon');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        });
    };

    menuToggles.forEach(toggle => {
        // El elemento clickeable es el DIV dentro del LI
        const header = toggle.querySelector('.submenu-header');
        if (header) {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                const submenu = toggle.querySelector('.submenu');
                const arrow = header.querySelector('.arrow-icon'); // Flecha dentro del header
                const wasOpen = toggle.classList.contains('open'); // Comprueba el LI padre
                
                // Cierra los otros padres antes de abrir/cerrar este
                if (!wasOpen) {
                    menuToggles.forEach(otherToggle => {
                        if (otherToggle !== toggle) {
                            otherToggle.classList.remove('open', 'active');
                            const otherSubmenu = otherToggle.querySelector('.submenu');
                            const otherArrow = otherToggle.querySelector('.submenu-header .arrow-icon');
                            if(otherSubmenu) otherSubmenu.style.maxHeight = null;
                            if(otherArrow) otherArrow.style.transform = 'rotate(0deg)';
                        }
                    });
                     // Quitar active de los items simples
                    nonParentItems.forEach(item => item.classList.remove('active'));
                }
                
                // Abre/Cierra el actual
                toggle.classList.toggle('open');
                toggle.classList.add('active'); // Siempre activa el padre al interactuar
                if (submenu) {
                    if (toggle.classList.contains('open')) {
                         submenu.style.maxHeight = submenu.scrollHeight + "px"; // Calcula altura para animación
                    } else {
                        submenu.style.maxHeight = null;
                    }
                }
                if (arrow) arrow.style.transform = toggle.classList.contains('open') ? 'rotate(90deg)' : 'rotate(0deg)';
            });
        }
    });

    nonParentItems.forEach(item => {
        item.addEventListener('click', () => {
            setAllInactive(); // Cierra submenús
            item.classList.add('active'); // Activa el item simple
             // Cierra sidebar en móvil
            if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    });
    
    // Activa el item inicial (el Dashboard)
    // NOTA: Añade 'initial-active' al LI del Dashboard en sidebar.html
    const initialActiveItem = document.querySelector('#sidebar .initial-active');
    if (initialActiveItem) {
        initialActiveItem.classList.add('active'); 
        if (initialActiveItem.classList.contains('has-submenu')) {
            initialActiveItem.classList.add('open');
            const initialSubmenu = initialActiveItem.querySelector('.submenu');
            const initialArrow = initialActiveItem.querySelector('.submenu-header .arrow-icon');
            if (initialSubmenu) initialSubmenu.style.maxHeight = initialSubmenu.scrollHeight + "px";
            if (initialArrow) initialArrow.style.transform = 'rotate(90deg)';
        }
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
                    // Cierra submenús antes de colapsar
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
                 // En móvil, el botón interno cierra el menú overlay
                sidebar.classList.remove('open');
            }
        });
    }
    
    // --- Lógica para botón de abrir sidebar en móvil (externo, si existiera) ---
    // const sidebarToggleMain = document.getElementById('sidebar-toggle-main'); // No lo tienes
    // if (sidebarToggleMain && sidebar) {
    //     sidebarToggleMain.addEventListener('click', () => {
    //         sidebar.classList.add('open');
    //     });
    // }
    
     // --- Cerrar sidebar en móvil al hacer clic fuera ---
    document.addEventListener('click', function(event) {
        const isMobileView = window.innerWidth <= 768;
        if (isMobileView && sidebar && sidebar.classList.contains('open')) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            //const isClickOnToggleButton = sidebarToggleMain && sidebarToggleMain.contains(event.target); // Si tuvieras botón externo
            
            // Si el clic NO fue dentro del sidebar NI en el botón que lo abre
            if (!isClickInsideSidebar /* && !isClickOnToggleButton */) {
                sidebar.classList.remove('open');
            }
        }
    });

} // --- FIN de initSidebarEvents ---


// --- Lógica de Gráficos (Fuera de initSidebarEvents) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- DATOS DE GRÁFICOS ---
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleFont: { size: 14 },
                bodyFont: { size: 12 },
                padding: 10
            }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                ticks: { color: '#666', font: { size: 10 } }, 
                grid: { color: '#e9ecef', drawBorder: false } 
            },
            x: { 
                ticks: { color: '#666', font: { size: 10 } }, 
                grid: { display: false } 
            }
        }
    };
    
    // 1. Gráfico de Planes Activos (Barras)
    const activePlansCtx = document.getElementById('activePlansChart');
    if (activePlansCtx) {
        new Chart(activePlansCtx, {
            type: 'bar',
            data: {
                labels: ['Plan 10 MB', 'Plan 20 MB', 'Plan 30 MB', 'Plan 40 MB', 'Plan 50 MB', 'Plan 60 MB'],
                datasets: [{
                    label: 'Clientes', data: [45, 55, 80, 30, 25, 40],
                    backgroundColor: 'rgba(0, 123, 255, 0.7)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1, borderRadius: 4, barThickness: 15 // Barras más delgadas
                }]
            },
            options: chartOptions
        });
    }

    // 2. Gráfico de Nuevos Clientes (Barras)
    const newClientsCtx = document.getElementById('newClientsChart');
    if (newClientsCtx) {
        new Chart(newClientsCtx, {
            type: 'bar',
            data: {
                labels: ['ÁNGEL S', 'JULIA R', 'YOEL N', 'SOLICITUD H', 'PRUEBAS'],
                datasets: [{
                    label: 'Nuevos Clientes', data: [30, 35, 70, 40, 30], // Datos ejemplo
                    backgroundColor: 'rgba(23, 162, 184, 0.7)', // Color Cyan
                    borderColor: 'rgba(23, 162, 184, 1)',
                    borderWidth: 1, borderRadius: 4, barThickness: 15
                }]
            },
            options: chartOptions
        });
    }

    // 3. Gráfico de Ingreso Mensual (Líneas con área)
    const monthlyIncomeCtx = document.getElementById('monthlyIncomeChart');
    if(monthlyIncomeCtx) {
        new Chart(monthlyIncomeCtx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct'],
                datasets: [{
                    label: 'Ingresos', data: [65, 59, 80, 81, 56, 55, 40, 60, 50, 120], // Datos ejemplo
                    fill: true, backgroundColor: 'rgba(40, 167, 69, 0.1)', // Verde área
                    borderColor: 'rgba(40, 167, 69, 1)',      // Verde línea
                    tension: 0.3, 
                    pointBackgroundColor: 'rgba(40, 167, 69, 1)', // Puntos verdes
                    pointRadius: 4, pointHoverRadius: 6
                }]
            },
            options: chartOptions
        });
    }

    // 4. Gráfico de Planes Inactivos (Dona) y Lista
    const inactivePlansCtx = document.getElementById('inactivePlansChart');
    const inactivePlansList = document.getElementById('inactivePlansList');
    // Datos ejemplo (ajusta con tus datos reales)
    const inactivePlansData = [
        { name: 'Plan 20MB', value: 1 }, { name: 'GHL', value: 9 },
        { name: 'BVI', value: 0 }, { name: 'Megas', value: 2 },
        { name: 'plan basico', value: 0 }, { name: 'RESDO. ADM.', value: 0 },
        { name: 'e 1.1%', value: 1 }, { name: 'FIBRA AMPERCOM', value: 0 },
        { name: 'BASICO', value: 0 }, { name: 'INTERNET 30MB', value: 0 },
        { name: 'INTERNET 120', value: 0 }, { name: 'SERVICIOS V', value: 0 },
    ];
    // Filtrar los que tienen valor > 0 para el gráfico
    const chartData = inactivePlansData.filter(p => p.value > 0);
    const chartLabels = chartData.map(p => p.name);
    const chartValues = chartData.map(p => p.value);
    
    // Llenar la lista
    if (inactivePlansList) {
        inactivePlansList.innerHTML = ''; // Limpiar lista
        inactivePlansData.forEach(plan => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${plan.name}</span><span>${plan.value}</span>`; // Mostrar valor directo
            inactivePlansList.appendChild(li);
        });
    }
    
    // Crear el gráfico si hay datos
    if (inactivePlansCtx && chartData.length > 0) {
        new Chart(inactivePlansCtx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Planes Inactivos', data: chartValues,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'], // Colores ejemplo
                    hoverOffset: 4,
                    borderWidth: 0 // Sin borde blanco
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                 cutout: '70%', // Más delgado
                plugins: { 
                     legend: { display: false } // Ocultar leyenda
                } 
            }
        });
    } else if (inactivePlansCtx) {
         // Mensaje si no hay datos
        inactivePlansCtx.parentElement.innerHTML = '<p style="text-align:center; color: var(--light-text-color);">No hay planes inactivos.</p>';
    }


    // --- EL FETCH (Carga el menú lateral) ---
    fetch("sidebar.html") // Asume que está en la misma carpeta
        .then(res => {
            if (!res.ok) throw new Error('No se encontró siderbar.html'); 
            return res.text();
        })
        .then(html => {
            const sidebarContainer = document.getElementById("sidebar-container");
            if(sidebarContainer) {
                sidebarContainer.innerHTML = html;
                initSidebarEvents(); // Inicializa eventos del sidebar AHORA
                // No necesitas lucide aquí si no hay iconos en el sidebar
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