// --- Importaciones de Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { 
    getAuth, 
    signInAnonymously, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Configuración de Firebase (Manual) ---
const firebaseConfig = {
  apiKey: "AIzaSyDHrAEU4HI2onL1bRZpRfB5GAbsbD6_XBE",
  authDomain: "cablelatin-prueba.firebaseapp.com",
  projectId: "cablelatin-prueba",
  storageBucket: "cablelatin-prueba.firebasestorage.app",
  messagingSenderId: "370823325775",
  appId: "1:370823325775:web:cbd9142e612bc0a979623a",
  measurementId: "G-PV3NRMJBW2"
};

const appId = firebaseConfig.projectId;

let app, auth, db, analytics;
let userId = null;
let isAuthReady = false;

// Referencia a la colección de planes (pública)
let planesCollectionRef;

// --- Inicialización de Firebase ---
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    analytics = getAnalytics(app);
    console.log("Firebase inicializado con éxito en proyecto:", appId);
} catch (e) {
    console.error("Error inicializando Firebase:", e);
}

// --- Autenticación ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("Usuario autenticado:", user.uid);
        userId = user.uid;
        isAuthReady = true;
        
        // Definimos la colección de planes (pública)
        // Ruta: artifacts/{appId}/public/data/planes
        planesCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'planes');
        console.log("Referencia de colección de planes:", planesCollectionRef.path);

        // Empezar a escuchar los planes
        listenForPlans();

    } else {
        console.log("Usuario no autenticado, iniciando sesión anónima...");
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Error en la autenticación anónima:", error);
        }
    }
});

// FUNCIONES DE UTILIDAD (MODAL Y NOTIFICACIÓN)
// (Las funciones que ya tenías 
window.openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('open'), 10);
    }
};
window.closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('open');
        setTimeout(() => modal.style.display = 'none', 300);
        if (modalId === 'modal-registrar-plan') {
            document.getElementById('form-registrar-plan')?.reset();
        }
    }
};
window.showSuccessNotification = (message) => {
    const modal = document.getElementById('success-modal');
    const msgElement = document.getElementById('success-message');
    if (msgElement) msgElement.textContent = message;
    if (modal) {
        modal.classList.remove('hide'); 
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('open'), 10); 
        setTimeout(() => {
            modal.classList.add('hide');
            modal.classList.remove('open');
            setTimeout(() => modal.style.display = 'none', 300); 
        }, 3000);
    }
};

// LÓGICA DE DATOS (REEMPLAZANDO LA SIMULACIÓN)

// --- 1. Escuchar Planes (Leer) ---
function listenForPlans() {
    if (!planesCollectionRef) return;

    onSnapshot(planesCollectionRef, (snapshot) => {
        const plans = [];
        snapshot.forEach(doc => {
            plans.push({ id: doc.id, ...doc.data() });
        });
        // Renderizar la tabla con los datos de Firebase
        renderTable(plans);
    }, (error) => {
        console.error("Error al escuchar planes (onSnapshot):", error);
        const tbody = document.getElementById('planes-table-body');
        if(tbody) tbody.innerHTML = `<tr><td colspan="8" style="color:red;text-align:center;">Error al cargar planes.</td></tr>`;
    });
}

// --- 2. Renderizar la Tabla ---
// (Modificada para aceptar 'plans' como argumento)
function renderTable(plans) {
    const tbody = document.getElementById('planes-table-body');
    const footer = document.getElementById('footer-info');
    if (!tbody) return;

    tbody.innerHTML = ''; // Limpiar filas existentes
    
    if (plans.length === 0) {
         tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:20px;">No se encontraron planes.</td></tr>`;
         if(footer) footer.textContent = "Mostrando 0 de 0 registros";
         return;
    }

    // Ordenar por 'fecha_creacion' si existe, si no por id (simulado)
    plans.sort((a, b) => (b.fecha_creacion?.seconds || 0) - (a.fecha_creacion?.seconds || 0));

    plans.forEach(plan => {
        const newRow = tbody.insertRow();
        const estadoClass = plan.estado === 'Activo' ? 'active' : 'inactive';
        
        // Preparamos los datos para la edición
        // Convertimos los números a float para el formulario
        const planDataForJson = {
            ...plan,
            precio: parseFloat(plan.precio || 0),
            instalacion: parseFloat(plan.precioInstalacion || 0) // El formulario usa 'precioInstalacion'
        };
        const planDataJson = JSON.stringify(planDataForJson).replace(/"/g, '&quot;');
        
        newRow.innerHTML = `
            <td>${plan.id.substring(0, 6)}...</td>
            <td>${plan.nombre}</td>
            <td>${plan.descripcion}</td>
            <td>${parseFloat(plan.precio || 0).toFixed(2)}</td>
            <td>${parseFloat(plan.precioInstalacion || 0).toFixed(2)}</td>
            <td>${plan.condicion}</td>
            <td><span class="status-pill ${estadoClass}">${plan.estado}</span></td>
            <td class="table-actions">
                <button class="btn-icon edit" title="Editar" onclick="openEditModal('${planDataJson}')"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn-icon delete" title="Eliminar" onclick="openConfirmDelete('${plan.id}', '${plan.nombre}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });

    const rowCount = plans.length;
    if(footer) footer.textContent = `Mostrando 1 a ${rowCount} de ${rowCount} registros`;
}

// --- 3. Abrir Modal de Edición ---
// (Tu función original, sin cambios, pero ahora recibe datos de Firebase)
window.openEditModal = (planDataJson) => {
    try {
        const plan = JSON.parse(planDataJson.replace(/&quot;/g, '"'));
        
        document.getElementById('edit-plan-id').value = plan.id;
        document.getElementById('edit-plan-id-display').value = plan.id; 
        document.getElementById('edit-plan-nombre').value = plan.nombre;
        document.getElementById('edit-plan-condicion').value = plan.condicion;
        document.getElementById('edit-plan-precio').value = plan.precio;
        document.getElementById('edit-plan-instalacion').value = plan.instalacion; // 'instalacion'
        document.getElementById('edit-plan-estado').value = plan.estado;
        document.getElementById('edit-plan-descripcion').value = plan.descripcion;

        openModal('modal-editar-plan');

    } catch (e) {
        console.error("Error al parsear datos del plan para edición:", e);
    }
};

// --- 4. Abrir Modal de Confirmar Borrado (Nuevo) ---
window.openConfirmDelete = (id, nombre) => {
    const modal = document.getElementById('confirm-modal');
    const message = document.getElementById('confirm-modal-message');
    const btnConfirm = modal.querySelector('.btn-confirm-delete');
    const btnCancel = modal.querySelector('.btn-cancel-delete');
    
    if (message) message.textContent = `¿Estás seguro de que deseas eliminar el plan "${nombre}" (ID: ...${id.substring(id.length - 6)})?`;
    
    // Pasamos un nuevo 'onclick' al botón de confirmar
    btnConfirm.onclick = () => deletePlan(id, nombre);
    btnCancel.onclick = () => closeModal('confirm-modal');
    
    openModal('confirm-modal');
};

// --- 5. Lógica de Borrado (Nuevo) ---
async function deletePlan(id, nombre) {
    if (!planesCollectionRef) return;
    
    const planDocRef = doc(planesCollectionRef, id);
    
    try {
        await deleteDoc(planDocRef);
        closeModal('confirm-modal');
        showSuccessNotification(`¡Plan "${nombre}" eliminado correctamente!`);
        // onSnapshot se encargará de re-renderizar la tabla
    } catch (error) {
        console.error("Error al eliminar el plan:", error);
        closeModal('confirm-modal');
        // Aquí podrías mostrar un modal de error
    }
}

// MANEJADORES DE EVENTOS
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    const formRegistro = document.getElementById('form-registrar-plan');
    const formEdicion = document.getElementById('form-editar-plan');
    
    // --- Manejador del Formulario de Registro (AÑADIR) ---
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAuthReady || !planesCollectionRef) {
                console.error("Firebase no está listo."); return;
            }
            
            const formData = new FormData(formRegistro);
            const nuevoPlan = Object.fromEntries(formData.entries());
            
            // Convertir a números
            nuevoPlan.precio = parseFloat(nuevoPlan.precio);
            nuevoPlan.precioInstalacion = parseFloat(nuevoPlan.precioInstalacion);
            // Añadir fecha de creación
            nuevoPlan.fecha_creacion = serverTimestamp();
            
            try {
                await addDoc(planesCollectionRef, nuevoPlan);
                // onSnapshot se encargará de re-renderizar
                closeModal('modal-registrar-plan');
                showSuccessNotification(`¡Plan "${nuevoPlan.nombre}" registrado con éxito!`);
            } catch (error) {
                console.error("Error al registrar el plan:", error);
            }
        });
    }

    // --- Manejador del Formulario de Edición (EDITAR) ---
    if (formEdicion) {
        formEdicion.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isAuthReady || !planesCollectionRef) {
                console.error("Firebase no está listo."); return;
            }
            
            const formData = new FormData(formEdicion);
            const planEditado = Object.fromEntries(formData.entries());
            const planId = planEditado.id;
            
            // Quitar el ID del objeto a actualizar
            delete planEditado.id; 
            
            // Convertir a números
            planEditado.precio = parseFloat(planEditado.precio);
            planEditado.precioInstalacion = parseFloat(planEditado.precioInstalacion);
            // Añadir fecha de actualización
            planEditado.fecha_actualizacion = serverTimestamp();

            try {
                const planDocRef = doc(planesCollectionRef, planId);
                await updateDoc(planDocRef, planEditado);

                // onSnapshot se encargará de re-renderizar
                closeModal('modal-editar-plan');
                showSuccessNotification(`¡Plan ID ...${planId.substring(planId.length - 6)} actualizado!`);
            } catch (error) {
                console.error("Error al editar el plan:", error);
            }
        });
    }

    
        });
