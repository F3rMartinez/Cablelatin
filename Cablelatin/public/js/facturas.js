// --- Importaciones de Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc,
    updateDoc,
    onSnapshot,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Configuración Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyDHrAEU4HI2onL1bRZpRfB5GAbsbD6_XBE", // Reemplaza si es necesario
    authDomain: "cablelatin-prueba.firebaseapp.com",
    projectId: "cablelatin-prueba",
    storageBucket: "cablelatin-prueba.firebasestorage.app",
    messagingSenderId: "370823325775",
    appId: "1:370823325775:web:cbd9142e612bc0a979623a",
    measurementId: "G-PV3NRMJBW2"
};

// --- Variables Globales de Firebase ---
let app, auth, db;
let userId = null;
let isAuthReady = false;
// Usamos el projectId de la config si __app_id no está definido
const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;

let serviciosCollectionRef;
let clientesCollectionRef;
let clientesMap = new Map(); // Mapa para guardar los clientes

// --- Elementos del DOM ---
const modal = document.getElementById('payment-modal');
const closeModalBtn = document.querySelector('.modal-close');
const cancelModalBtn = document.getElementById('modal-cancel-btn');
const confirmModalBtn = document.getElementById('modal-confirm-btn');
const tableBody = document.getElementById('facturas-table-body');

const modalClientName = document.getElementById('modal-client-name');
const modalPaymentAmount = document.getElementById('modal-payment-amount');

const filterCliente = document.getElementById('buscar-cliente');
const filterDesde = document.getElementById('date-from');
const filterHasta = document.getElementById('date-to');
const filterResetBtn = document.querySelector('.btn-outline-primary');

let currentRowToProcess = null;

// ==========================================================
// --- ¡NUEVA FUNCIÓN PARA CARGAR TU SIDEBAR! ---
// ==========================================================
/**
 * Carga el contenido de sidebar.html en el contenedor
 */
async function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (!sidebarContainer) {
        console.error("No se encontró #sidebar-container");
        return;
    }
    
    try {
        const response = await fetch('sidebar.html');
        if (!response.ok) {
            throw new Error(`Error al cargar sidebar: ${response.statusText}`);
        }
        const html = await response.text();
        sidebarContainer.innerHTML = html;
        console.log("Sidebar cargado correctamente.");
    } catch (error) {
        console.error("Error al cargar sidebar.html:", error);
        sidebarContainer.innerHTML = '<p style="color:red; padding: 10px;">Error al cargar el menú.</p>';
    }
}
// ==========================================================


/**
 * Formatea un objeto Date a un string YYYY-MM-DD
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Calcula una fecha límite por defecto (ej. +5 días) si no existe
 */
function calcularFechaLimite(fechaBaseStr) {
    const tempDate = new Date(fechaBaseStr);
    tempDate.setDate(tempDate.getDate() + 5); // Default +5 días
    return formatDate(tempDate);
}

/**
 * Procesa el pago y actualiza el documento en Firebase
 */
async function processPayment() {
    if (!currentRowToProcess || !isAuthReady) return;

    const docId = currentRowToProcess.dataset.docId;
    if (!docId) {
        console.error("No se encontró el ID del documento en la fila.");
        return;
    }
    
    // Deshabilitar botón para evitar doble clic
    if(confirmModalBtn) confirmModalBtn.disabled = true;

    try {
        // 1. Encontrar las celdas
        const vencimientoCell = currentRowToProcess.querySelector('.fecha-vencimiento');
        const limiteCell = currentRowToProcess.querySelector('.fecha-limite');
        
        // 2. Calcular nuevas fechas (basado en tu lógica original)
        const oldVencimiento = new Date(vencimientoCell.textContent);
        const oldLimite = new Date(limiteCell.textContent);

        oldVencimiento.setDate(oldVencimiento.getDate() + 30);
        oldLimite.setDate(oldLimite.getDate() + 32); // Tu lógica era sumar 32 a la fecha límite

        const newVencimientoStr = formatDate(oldVencimiento);
        const newLimiteStr = formatDate(oldLimite);

        // 3. Actualizar el documento en Firebase
        const serviceDocRef = doc(serviciosCollectionRef, docId);
        await updateDoc(serviceDocRef, {
            fecha_vencimiento: newVencimientoStr,
            fecha_limite: newLimiteStr,
            estado: 'Activo'
        });

        // -----------------------------------------------------------------
        // --- ¡INICIO DE LA LÓGICA AÑADIDA PARA CREAR EL PAGO! ---
        // -----------------------------------------------------------------
        
        // 4. Definir la colección de 'pagos' (AQUÍ SÍ TENEMOS 'userId')
        const pagosCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'pagos');

        // 5. Preparar el objeto del nuevo pago (leyendo los datos de la tabla)
        const nuevoPago = {
            n_documento: currentRowToProcess.cells[2].textContent, // Celda DNI
            estado: 'Pagado',
            fecha_pago: new Date().toISOString().split('T')[0], // Hoy
            id_cliente: currentRowToProcess.dataset.clienteId, // Dato guardado en la fila
            id_servicio: docId, // El ID del servicio/factura
            plan_info: {
                nombre: currentRowToProcess.cells[4].textContent, // Celda Plan
                precio: parseFloat(currentRowToProcess.cells[5].textContent) // Celda Precio
            },
            creado_en: serverTimestamp() // Fecha de registro del pago
        };

        // 6. Guardar el nuevo documento en la colección 'pagos'
        await addDoc(pagosCollectionRef, nuevoPago);
        console.log("¡Éxito! Nuevo registro de pago creado en la colección 'pagos'.");
        
        // --- FIN DE LA LÓGICA AÑADIDA ---
        // -----------------------------------------------------------------


        // 7. Ocultar modal
        // onSnapshot se encargará de actualizar la fila en la UI
        hideModal();

    } catch (error) {
        console.error("Error al procesar el pago:", error);
        // Aquí deberías mostrar un modal de error al usuario
    } finally {
        // Volver a habilitar el botón pase lo que pase
        if(confirmModalBtn) confirmModalBtn.disabled = false;
    }
}

/**
 * Revisa todas las filas y actualiza el estado en Firebase si la fecha límite ha pasado
 */
async function checkAllStatuses() {
    if (!isAuthReady) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const allRows = tableBody.querySelectorAll('tr');
    
    // Usamos un bucle for...of para poder usar await dentro
    for (const row of allRows) {
        const docId = row.dataset.docId;
        const limiteCell = row.querySelector('.fecha-limite');
        const estadoCell = row.querySelector('.estado');
        
        if (!docId || !limiteCell || !estadoCell) continue; // Saltar si falta info

        const estadoActual = estadoCell.textContent.trim();

        // Creamos la fecha límite. Sumamos 1 día para que "2025-09-20" venza el "2025-09-21"
        const fechaLimite = new Date(limiteCell.textContent);
        fechaLimite.setDate(fechaLimite.getDate() + 1);
        fechaLimite.setHours(0, 0, 0, 0);

        // Comparamos
        if (today >= fechaLimite && estadoActual === 'Activo') {
            // El estado en la UI es 'Activo' pero está vencido
            // Actualizamos en Firebase
            try {
                const serviceDocRef = doc(serviciosCollectionRef, docId);
                await updateDoc(serviceDocRef, { estado: 'Suspendido' });
                // onSnapshot se encargará de actualizar la UI
            } catch (error) {
                console.error(`Error al suspender el doc ${docId}:`, error);
            }
        }
    }
}

// --- Funciones del Modal (sin cambios) ---
function showModal(row) {
    currentRowToProcess = row;
    
    const clientName = row.cells[3].textContent; // Columna "Cliente"
    const paymentAmount = row.querySelector('.precio-plan').textContent; 

    modalClientName.textContent = clientName;
    modalPaymentAmount.textContent = `S/ ${parseFloat(paymentAmount).toFixed(2)}`;
    
    modal.style.display = 'block';
}
function hideModal() {
    modal.style.display = 'none';
    currentRowToProcess = null;
    modalClientName.textContent = '';
    modalPaymentAmount.textContent = '';
}
// --- Funciones de Filtro (sin cambios, ahora filtran la UI post-render) ---
function applyFilters() {
    const clienteValue = filterCliente.value.toLowerCase().trim();
    const desdeValue = filterDesde.value; 
    const hastaValue = filterHasta.value;
    const allRows = tableBody.querySelectorAll('tr');
    allRows.forEach(row => {
        if (!row.dataset.docId) return; // Omitir filas de "cargando" o "sin datos"
        const clienteText = row.cells[3].textContent.toLowerCase().trim();
        const fechaRegistroText = row.cells[1].textContent.trim(); // 'YYYY-MM-DD'
        let show = true;
        if (clienteValue && !clienteText.includes(clienteValue)) {
            show = false;
        }
        if (desdeValue && fechaRegistroText < desdeValue) {
            show = false;
        }
        if (hastaValue && fechaRegistroText > hastaValue) {
            show = false;
        }
        row.style.display = show ? '' : 'none';
    });
}
function resetFilters() {
    filterCliente.value = '';
    filterDesde.value = '';
    filterHasta.value = '';
    applyFilters();
}
// --- Nuevas Funciones de Firebase ---
/**
 * Carga todos los clientes en un Mapa para referencia rápida
 */
async function loadClientes() {
    if (!isAuthReady) return;
    try {
        const querySnapshot = await getDocs(clientesCollectionRef);
        clientesMap.clear();
        querySnapshot.forEach(doc => {
            clientesMap.set(doc.id, doc.data());
        });
        console.log("Clientes cargados en el mapa:", clientesMap.size);
    } catch (error) {
        console.error("Error cargando clientes:", error);
    }
}
/**
 * Renderiza la tabla con los datos de servicios y el mapa de clientes
 */
function renderTable(serviciosDocs, clientes) {
    tableBody.innerHTML = ''; // Limpiar tabla
    if (serviciosDocs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 20px;">No se encontraron servicios registrados.</td></tr>`;
        return;
    }
    serviciosDocs.forEach(doc => {
        const servicio = doc.data();
        const cliente = clientes.get(servicio.id_cliente);
        // Preparar datos
        const clienteNombre = cliente ? `${cliente.nombre || ''} ${cliente.apellido || ''}`.trim() : 'Cliente Desconocido';
        const clienteDNI = cliente ? cliente.dni : 'N/A';
        
        const fechaInicio = servicio.fecha_inicio || 'N/A';
        
        // --- Lógica para manejar fechas faltantes ---
        const fechaVencimiento = servicio.fecha_vencimiento || fechaInicio; // Default a fecha_inicio
        const fechaLimite = servicio.fecha_limite || calcularFechaLimite(fechaVencimiento); // Default a vencimiento + 5 días
        const estado = servicio.estado || 'N/A';
        const estadoClass = estado.toLowerCase() === 'activo' ? 'active' : 'inactive';
        
        // Crear fila
        const row = tableBody.insertRow();
        row.dataset.docId = doc.id; // ¡Importante! Guardamos el ID del doc
        // --- ¡CAMBIO IMPORTANTE! ---
        // Guardamos también el ID del cliente para usarlo en el pago
        row.dataset.clienteId = servicio.id_cliente; 
        
        row.innerHTML = `
            <td><i class="fas fa-folder" style="color: #ffc107; margin-right: 5px;"></i> ${doc.id.substring(0, 6)}...</td>
            <td class="fecha-registro">${fechaInicio}</td>
            <td>${clienteDNI}</td>
            <td>${clienteNombre}</td>
            <td>${servicio.plan_info ? servicio.plan_info.nombre : 'N/A'}</td>
            <td class="precio-plan">${servicio.plan_info ? parseFloat(servicio.plan_info.precio || 0).toFixed(2) : '0.00'}</td>
            <td class="fecha-vencimiento">${fechaVencimiento}</td>
            <td class="fecha-limite">${fechaLimite}</td>
            <td class="estado"><span class="status-pill ${estadoClass}">${estado}</span></td>
            <td class="table-actions">
                <i class="fas fa-dollar-sign icon-success" title="Pagar"></i>
            </td>
        `;
    });
    // Una vez renderizado, aplicamos filtros y revisamos estados
    applyFilters();
    checkAllStatuses();
}
/**
 * Escucha cambios en la colección de servicios
 */
function listenForFacturas() {
    if (!isAuthReady) return;

    onSnapshot(serviciosCollectionRef, (snapshot) => {
        console.log("Nuevos datos de servicios recibidos:", snapshot.size);
        renderTable(snapshot.docs, clientesMap);
    }, (error) => {
        console.error("Error al escuchar servicios (onSnapshot):", error);
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red; padding: 20px;">Error al cargar datos.</td></tr>`;
    });
}
// --- Inicialización y Autenticación ---
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase inicializado:", appId);
    
    // --- ¡LLAMADA A LA NUEVA FUNCIÓN! ---
    // Llamamos a la función para cargar el sidebar en cuanto el script inicia
    loadSidebar(); 

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
            isAuthReady = true;
            console.log("Autenticado:", userId);
            // Definir referencias a colecciones (privadas del usuario)
            serviciosCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'servicios_clientes');
            clientesCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'clientes');
            // Iniciar carga de datos
            await loadClientes(); // Esperar a que los clientes carguen primero
            listenForFacturas();  // Luego escuchar servicios
        } else {
            isAuthReady = false;
            console.log("No autenticado, intentando anónimo...");
            try {
                // (Mantenemos tu lógica de auth anónima)
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Error auth anónima:", error);
                tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red; padding: 20px;">Error de autenticación.</td></tr>`;
            }
        }
    });
} catch (e) {
    console.error("Error inicializando Firebase:", e);
    tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: red; padding: 20px;">Error crítico de Firebase.</td></tr>`;
}
// --- Event Listeners de la UI ---
// (Se ejecutan una vez, al cargar el script)
// Listeners para el Modal
tableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('fa-dollar-sign')) {
        const row = e.target.closest('tr');
        if (row && row.dataset.docId) { // Asegurarse que es una fila con datos
            showModal(row);
        }
    }
});
closeModalBtn.addEventListener('click', hideModal);
cancelModalBtn.addEventListener('click', hideModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        hideModal();
    }
});
confirmModalBtn.addEventListener('click', processPayment);
// Listeners para Filtros
filterCliente.addEventListener('input', applyFilters);
filterDesde.addEventListener('change', applyFilters);
filterHasta.addEventListener('change', applyFilters);
filterResetBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetFilters();
});

// ==============================================
//          LÓGICA DE SIDEBAR (Funciones)
// ==============================================

// 🔹 Alternar visibilidad de los submenús (despliegue hacia abajo)
function toggleCollapse(menuId, iconId) {
    // Evita el despliegue si el sidebar está colapsado
    if (document.getElementById('sidebar-container').classList.contains('collapsed')) {
        return;
    }

    const menu = document.getElementById(menuId);
    const icon = document.getElementById(iconId);

    if (!menu) return;

    // Si el submenú está abierto, lo cierra; si está cerrado, lo abre con animación
    if (menu.classList.contains('open')) {
        menu.style.maxHeight = '0px';
        menu.classList.remove('open');
        if (icon) icon.classList.remove('rotate-icon');
    } else {
        menu.classList.add('open');
        menu.style.maxHeight = menu.scrollHeight + 'px';
        if (icon) icon.classList.add('rotate-icon');
    }
}

// 🔹 Alternar colapso del sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar-container');
    const icon = document.getElementById('toggle-icon');

    sidebar.classList.toggle('collapsed');

    if (sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');

        // Cierra submenús al colapsar
        document.querySelectorAll('.sidebar-submenu').forEach(menu => {
            menu.style.maxHeight = '0px';
            menu.classList.remove('open');
        });
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
    }
}

// 🔹 Cerrar sesión con confirmación
function handleSignOut(event) {
    event.preventDefault();
    if (confirm('¿Deseas cerrar sesión?')) {
        window.location.href = '/Cablelatin/public/login.html';
    }
}

// --- Configuración inicial ---
document.addEventListener('DOMContentLoaded', () => {
    // Cierra todos los submenús inicialmente
    document.querySelectorAll('.sidebar-submenu').forEach(menu => {
        menu.style.maxHeight = '0px';
    });

    // Asegura ícono inicial correcto
    const sidebar = document.getElementById('sidebar-container');
    const icon = document.getElementById('toggle-icon');
    if (sidebar.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
    }

    
});


