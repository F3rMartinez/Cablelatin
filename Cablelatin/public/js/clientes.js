// ==============================================
// DATOS DE PRUEBA (Nuestra "Base de Datos" estática)
// ==============================================
let clientesPrueba = [
    { id: 'TEST001A', dni: '47123456', nombre: 'Juan', apellido: 'Pérez', telefono: '987654321', direccion: 'Calle Falsa 123', estado: 'Activo' },
    { id: 'TEST002B', dni: '93456789', nombre: 'María', apellido: 'Gómez', telefono: '912345678', direccion: 'Av. Siempre Viva 742', estado: 'Suspendido' },
    { id: 'TEST003C', dni: '10987654', nombre: 'Carlos', apellido: 'Rodríguez', telefono: '955554444', direccion: 'Jr. Luna Nueva 200', estado: 'Inactivo' }
];

// ==============================================
// REFERENCIAS DOM
// ==============================================
const tableBody = document.getElementById('clients-table-body');
const footerInfo = document.getElementById('footer-info');

// ==============================================
// 1. FUNCIONES DE MANEJO DE MODALES
// ==============================================

/**
 * Abre un modal específico.
 * @param {string} modalId - ID del modal a abrir.
 */
window.openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.add('open');
};

/**
 * Cierra un modal específico.
 * @param {string} modalId - ID del modal a cerrar.
 */
window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if(modal) modal.classList.remove('open');
};


/**
 * Muestra el modal de notificación de éxito o eliminación.
 * @param {string} title - Título del mensaje.
 * @param {string} message - Contenido del mensaje.
 * @param {string} type - 'success' o 'delete' para cambiar estilos y el icono.
 */
window.showNotificationModal = (title, message, type = 'success') => {
    const modal = document.getElementById('modal-notification');
    const contentEl = modal.querySelector('.modal-content');
    const iconEl = document.getElementById('notification-icon');
    
    // Limpiar clases y establecer el tipo
    contentEl.className = 'modal-content';
    
    if (type === 'delete') {
        contentEl.classList.add('notification-delete');
        iconEl.innerHTML = '<i class="fas fa-trash-alt"></i>';
    } else {
        contentEl.classList.add('notification-success');
        iconEl.innerHTML = '<i class="fas fa-check-circle"></i>';
    }

    // Establecer contenido
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-message').innerHTML = message;

    // Abrir
    openModal('modal-notification');
};

/**
 * Muestra el modal de confirmación de eliminación.
 * @param {string} clienteId - ID del cliente.
 * @param {string} clienteNombre - Nombre completo del cliente.
 */
window.showConfirmModal = (clienteId, clienteNombre) => {
    const messageEl = document.getElementById('confirm-message');
    const actionButton = document.getElementById('confirm-action-button');
    
    // Establecer el mensaje de advertencia
    messageEl.innerHTML = `Está a punto de **eliminar permanentemente** al cliente **${clienteNombre}** (ID: ${clienteId}). ¿Desea continuar?`;

    // Asignar la acción al botón "Eliminar"
    actionButton.onclick = () => {
        deleteConfirmed(clienteId, clienteNombre);
        closeModal('modal-confirm');
    };

    openModal('modal-confirm');
};


// ==============================================
// 2. LÓGICA DE CARGA DE DATOS PARA EDICIÓN
// ==============================================

/**
 * Carga los datos de un cliente en el modal de edición de datos personales.
 */
window.openEditClientModal = (clienteId) => {
    const cliente = clientesPrueba.find(c => c.id === clienteId);
    if (!cliente) return;
    
    // Datos detallados de prueba
    const datosDetalle = {
        tipoCliente: (clienteId === 'TEST001A' || clienteId === 'TEST003C') ? "Residencia/Personal" : "Empresarial(RUC)",
        tipoDocumento: clienteId === 'TEST002B' ? "RUC" : "DNI",
        email: "contacto@cablelatin.com",
        direccionCalle: cliente.direccion,
        distrito: "Lima",
        provincia: "Lima",
        departamento: "Lima",
        referencia: "Casa de color azul, puerta de metal.",
    };

    // Rellenar el formulario
    document.getElementById('edit-cliente-id').value = clienteId; 
    document.getElementById('edit-tipo-residencia').checked = (datosDetalle.tipoCliente === "Residencia/Personal");
    document.getElementById('edit-tipo-empresarial').checked = (datosDetalle.tipoCliente === "Empresarial(RUC)");
    document.getElementById('edit-nombre').value = cliente.nombre;
    document.getElementById('edit-apellido').value = cliente.apellido;
    document.getElementById('edit-tipo-documento').value = datosDetalle.tipoDocumento;
    document.getElementById('edit-numero-documento').value = cliente.dni;
    document.getElementById('edit-email').value = datosDetalle.email;
    document.getElementById('edit-telefono').value = cliente.telefono;
    document.getElementById('edit-direccion-calle').value = datosDetalle.direccionCalle;
    document.getElementById('edit-distrito').value = datosDetalle.distrito;
    document.getElementById('edit-provincia').value = datosDetalle.provincia;
    document.getElementById('edit-departamento').value = datosDetalle.departamento;
    document.getElementById('edit-referencia').value = datosDetalle.referencia;
    
    openModal('modal-editar-cliente');
};

/**
 * Carga los datos del servicio de un cliente en el modal de edición de servicio.
 */
window.openEditServiceModal = (clienteId) => {
    
    // Datos del servicio de prueba
    const servicioDePrueba = {
        planTipo: clienteId === 'TEST001A' ? "Duo" : "Basico TV", 
        cicloFacturacion: clienteId === 'TEST001A' ? "10" : "25", 
        velocidadInternet: clienteId === 'TEST001A' ? "100 Mbps" : "N/A (Solo TV)", 
        fechaInicio: "2024-08-01", 
        precioPlan: clienteId === 'TEST001A' ? "89.90" : "40.00", 
        fechaVencimiento: "2025-08-01", 
        serviciosAdicionales: clienteId === 'TEST001A' ? "IP Fija" : "Ninguno", 
        estadoServicio: clientesPrueba.find(c => c.id === clienteId)?.estado || "Activo", 
        costoAdicional: clienteId === 'TEST001A' ? "10.00" : "0.00", 
        observacionesTecnicas: "Anotar detalles de la instalación...",
    };
    
    // Rellenar el formulario
    document.getElementById('edit-servicio-cliente-id').value = clienteId;
    document.getElementById('edit-plan-tipo').value = servicioDePrueba.planTipo;
    document.getElementById('edit-ciclo-facturacion').value = servicioDePrueba.cicloFacturacion;
    document.getElementById('edit-velocidad-internet').value = servicioDePrueba.velocidadInternet;
    document.getElementById('edit-fecha-inicio').value = servicioDePrueba.fechaInicio;
    document.getElementById('edit-precio-plan').value = servicioDePrueba.precioPlan;
    document.getElementById('edit-fecha-vencimiento').value = servicioDePrueba.fechaVencimiento;
    document.getElementById('edit-servicios-adicionales').value = servicioDePrueba.serviciosAdicionales;
    document.getElementById('edit-estado-servicio').value = servicioDePrueba.estadoServicio;
    document.getElementById('edit-costo-adicional').value = servicioDePrueba.costoAdicional;
    document.getElementById('edit-observaciones-tecnicas').value = servicioDePrueba.observacionesTecnicas;

    openModal('modal-editar-servicio');
};


// ==============================================
// 3. MANEJADORES DE SUBMIT (Simulación de Guardado)
// ==============================================

function handleEditClientSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // 1. Simulación de actualización de datos en la lista y recarga de tabla
    let clienteIndex = clientesPrueba.findIndex(c => c.id === data.id);
    if (clienteIndex !== -1) {
        clientesPrueba[clienteIndex].nombre = data.nombre;
        clientesPrueba[clienteIndex].apellido = data.apellido;
        clientesPrueba[clienteIndex].dni = data.numeroDocumento;
        clientesPrueba[clienteIndex].telefono = data.telefono;
        clientesPrueba[clienteIndex].direccion = data.direccionCalle;
        loadStaticClients(); 
    }

    // 2. Cerrar el modal de edición y mostrar notificación de éxito
    closeModal('modal-editar-cliente');
    showNotificationModal(
        "¡Actualización Exitosa! 🎉",
        `Los datos del cliente se actualizo correctamente.`
    );
}

function handleEditServiceSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // 1. Simulación de actualización del estado del cliente y recarga de tabla
    let clienteIndex = clientesPrueba.findIndex(c => c.id === data.clienteId);
    if (clienteIndex !== -1) {
        clientesPrueba[clienteIndex].estado = data.estadoServicio;
        loadStaticClients(); 
    }

    // 2. Cerrar el modal de edición y mostrar notificación de éxito
    closeModal('modal-editar-servicio');
    showNotificationModal(
        "Servicio Actualizado",
        `El plan de servicio se actualizo correctamente .`
    );
}

// ==============================================
// 4. LÓGICA DE ELIMINACIÓN
// ==============================================

/**
 * Función llamada al pulsar el icono de basura, que muestra el modal de confirmación.
 */
window.deleteClient = (clienteId) => {
    const cliente = clientesPrueba.find(c => c.id === clienteId);
    if (cliente) {
        showConfirmModal(clienteId, `${cliente.nombre} ${cliente.apellido}`);
    }
};

/**
 * Función que ejecuta la eliminación después de la confirmación del usuario.
 */
function deleteConfirmed(clienteId, clienteNombre) {
    
    const initialLength = clientesPrueba.length;
    // Simulación de la eliminación
    clientesPrueba = clientesPrueba.filter(c => c.id !== clienteId);
    
    if (clientesPrueba.length < initialLength) {
        loadStaticClients(); 
        showNotificationModal(
            "Cliente Eliminado",
            `El cliente **${clienteNombre}** ha sido eliminado correctamente.`,
            'delete'
        );
    }
}

<<<<<<< HEAD
=======
// --- EL FETCH (Esto es lo que carga el menú) ---
// Se ejecuta apenas carga la página
fetch("sidebar.html")
    .then(res => {
        // Asegúrate que el archivo siderbar.html exista en la misma carpeta
        if (!res.ok) throw new Error('No se encontró siderbar.html'); 
        return res.text();
    })
    .then(html => {
        // 1. Inserta el HTML del menú en el div
        document.getElementById("sidebar-container").innerHTML = html;
>>>>>>> ce4f311 (planes agregada a la bd y pequeños cambios en otros archivos)

// ==============================================
// 5. CARGA Y RENDERIZADO DE LA TABLA
// ==============================================

function renderClientRow(cliente) {
    const estadoClass = cliente.estado.toLowerCase().replace(/\s/g, '-');
    const estadoBadgeClass = `status-${estadoClass}`;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${cliente.id}</td>
        <td><i class="fas fa-user-circle" style="font-size: 24px; color: #ccc;"></i></td>
        <td>${cliente.dni}</td>
        <td>${cliente.nombre} ${cliente.apellido}</td>
        <td>${cliente.telefono}</td>
        <td>${cliente.direccion}</td>
        <td><span class="status-badge ${estadoBadgeClass}">${cliente.estado}</span></td>
        <td class="action-cell">
            <button class="btn-action" title="Editar Cliente/Datos" onclick="openEditClientModal('${cliente.id}')">
                <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="btn-action" title="Editar Servicio/Plan" onclick="openEditServiceModal('${cliente.id}')">
                <i class="fas fa-satellite-dish"></i>
            </button>
            <button class="btn-action btn-delete" title="Eliminar Cliente" onclick="deleteClient('${cliente.id}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    return row;
}

function loadStaticClients() {
    tableBody.innerHTML = ''; 
    
    clientesPrueba.forEach(cliente => {
        const row = renderClientRow(cliente);
        tableBody.appendChild(row);
    });
    
    // Actualizar el pie de página
    const total = clientesPrueba.length;
    if(footerInfo) footerInfo.textContent = `Mostrando 1 a ${total} de ${total} registros (Prueba)`;
}

// ==============================================
// 6. INICIALIZACIÓN
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar la tabla con datos iniciales
    loadStaticClients(); 

    // 2. Asignar listeners a los formularios de edición
    document.getElementById('form-editar-cliente').addEventListener('submit', handleEditClientSubmit);
    document.getElementById('form-editar-servicio').addEventListener('submit', handleEditServiceSubmit);
});