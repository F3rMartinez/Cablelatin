// --- Importaciones de Firebase ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Configuración Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyDHrAEU4HI2onL1bRZpRfB5GAbsbD6_XBE",
  authDomain: "cablelatin-prueba.firebaseapp.com",
  projectId: "cablelatin-prueba",
  storageBucket: "cablelatin-prueba.firebasestorage.app",
  messagingSenderId: "370823325775",
  appId: "1:370823325775:web:cbd9142e612bc0a979623a",
  measurementId: "G-PV3NRMJBW2"
};

// --- Variables Globales ---
const appId = firebaseConfig.projectId;
let app, auth, db;
let userId = null;

// Almacenes de datos globales
let allClientes = [];
let allServicios = [];
let allPagos = [];
let allReportes = [];

// Estado de carga
const loadStatus = {
    clientes: false,
    servicios: false,
    pagos: false,
    reportes: false
};

// --- Referencias a Elementos DOM ---
const btnGenerarExcel = document.getElementById('btnGenerarExcel');
const fechaDesdeInput = document.getElementById('fechaDesde');
const fechaHastaInput = document.getElementById('fechaHasta');
const loaderIcon = document.getElementById('loader-icon');
const excelIcon = document.getElementById('excel-icon');
const btnExcelText = document.getElementById('btn-excel-text');

// Objetos de librerías
const XLSX = window.XLSX;

// --- Inicialización Firebase ---
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase inicializado");
    initAuth();
} catch (e) {
    console.error("Error inicializando Firebase:", e);
    btnExcelText.textContent = "Error de Conexión";
}

// --- Autenticación ---
function initAuth() {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
            console.log("Autenticado:", userId);
            
            // Empezar a cargar todas las colecciones
            loadAllCollections();

        } else {
            console.log("No autenticado, intentando anónimo...");
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Error auth anónima:", error);
            }
        }
    });
}

/**
 * Inicia la carga de todas las colecciones de datos
 */
function loadAllCollections() {
    if (!userId) return;

    // Definir las 4 referencias
    const clientesRef = collection(db, 'artifacts', appId, 'public', 'data', 'clientes');
    const serviciosRef = collection(db, 'artifacts', appId, 'public', 'data', 'servicios_clientes');
    const pagosRef = collection(db, 'artifacts', appId, 'public', 'data', 'pagos');
    const reportesRef = collection(db, 'artifacts', appId, 'public', 'data', 'reportes_tecnicos');

    // Iniciar los 4 "listeners"
    listenForData(clientesRef, allClientes, "clientes", "Clientes");
    listenForData(serviciosRef, allServicios, "servicios", "Servicios");
    listenForData(pagosRef, allPagos, "pagos", "Pagos");
    listenForData(reportesRef, allReportes, "reportes", "Reportes Técnicos");
}

/**
 * Función genérica para escuchar una colección y llenar un array
 */
function listenForData(collectionRef, targetArray, statusKey, logName) {
    onSnapshot(collectionRef, (snapshot) => {
        targetArray.length = 0; // Limpiar el array
        snapshot.forEach(doc => {
            targetArray.push({ id: doc.id, ...doc.data() });
        });
        console.log(`${logName} cargados: ${targetArray.length}`);
        
        // Marcar como cargado y revisar si ya terminamos
        loadStatus[statusKey] = true;
        checkAllDataLoaded();
        
    }, (error) => {
        console.error(`Error al cargar ${logName}:`, error);
        // Marcar como cargado (incluso con error) para no bloquear el botón
        loadStatus[statusKey] = true;
        checkAllDataLoaded();
    });
}

/**
 * Revisa si las 4 colecciones ya respondieron (con datos o vacías)
 */
function checkAllDataLoaded() {
    if (loadStatus.clientes && loadStatus.servicios && loadStatus.pagos && loadStatus.reportes) {
        console.log("Toda la data ha sido cargada.");
        btnGenerarExcel.disabled = false;
        btnExcelText.textContent = "Generar Excel";
        loaderIcon.style.display = 'none';
        excelIcon.style.display = 'inline-block';
    }
}

/**
 * Función de ayuda para filtrar un array por un campo de fecha
 */
function filterDataByDate(data, dateField, startDate, endDate) {
    // Si no hay fechas, devolver todos los datos
    if (!startDate || !endDate) {
        return data;
    }

    try {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');

        if (start > end) {
            return data; // Si el rango es inválido, devolver todo
        }

        return data.filter(item => {
            const itemDateStr = item[dateField];
            if (!itemDateStr) return false; // No incluir si no tiene fecha
            
            // Asegurarse que la fecha sea válida antes de crear el objeto Date
            // Modificado: Acepta Timestamp o string YYYY-MM-DD
            let itemDate;
            if (itemDateStr && typeof itemDateStr.seconds === 'number') { // Es Timestamp
                 itemDate = new Date(itemDateStr.seconds * 1000);
            } else if (typeof itemDateStr === 'string' && itemDateStr.length >= 10) { // Es String
                 itemDate = new Date(itemDateStr.substring(0, 10) + 'T00:00:00');
            } else {
                 return false; // Formato no reconocido
            }
            
            // Ajustar la fecha del item a medianoche para comparar solo días
            itemDate.setHours(0, 0, 0, 0); 
            
            return itemDate >= start && itemDate <= end;
        });
    } catch (e) {
        console.error("Error al filtrar fechas:", e);
        return data; // Devolver todo si hay error
    }
}

/**
 * ¡NUEVO!
 * Función de ayuda para convertir un objeto Timestamp de Firebase
 * en un string de fecha legible (YYYY-MM-DD).
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A'; // Devuelve 'N/A' si es null o undefined

    // Si ya es un string de fecha (como '2025-10-26'), devolverlo tal cual.
    if (typeof timestamp === 'string' && /^\d{4}-\d{2}-\d{2}/.test(timestamp)) {
        return timestamp.substring(0, 10);
    }
    
    // Si es un objeto Timestamp de Firebase
    if (typeof timestamp.seconds === 'number') {
        try {
            // Multiplicar por 1000 para convertir segundos a milisegundos
            const date = new Date(timestamp.seconds * 1000);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            console.error("Error formateando timestamp:", timestamp, e);
            return 'Error Fecha';
        }
    }
    
    // Si no es ninguno de los anteriores, devolver 'N/A' o intentar interpretar
    console.warn("Formato de fecha no reconocido en formatTimestamp:", timestamp);
    return 'Fecha Inválida'; 
}


// ========================================
//    EVENT LISTENER: GENERAR EXCEL
// ========================================
btnGenerarExcel.addEventListener('click', () => {
    console.log("Iniciando generación de Excel...");
    
    // Poner el botón en estado de "cargando"
    btnGenerarExcel.disabled = true;
    btnExcelText.textContent = "Generando...";
    loaderIcon.style.display = 'inline-block';
    excelIcon.style.display = 'none';

    // Obtener las fechas de los filtros
    const fechaDesde = fechaDesdeInput.value;
    const fechaHasta = fechaHastaInput.value;
    
    // Usamos setTimeout para que la UI se actualice (muestre "Generando...")
    // antes de que el procesador se bloquee creando el Excel.
    setTimeout(() => {
        try {
            // 1. Crear el "Libro" (Workbook)
            const wb = XLSX.utils.book_new();

            // 2. Filtrar y añadir las hojas
            
            // Hoja 1: Clientes (sin filtro de fecha, pero con fecha_registro formateada)
            const dataClientes = allClientes.map(c => ({
                ...c,
                fecha_registro: formatTimestamp(c.fecha_registro) // Usar la función de formato
            }));
            const wsClientes = XLSX.utils.json_to_sheet(dataClientes);
            XLSX.utils.book_append_sheet(wb, wsClientes, "Clientes");
            
            
            // Hoja 2: Servicios (filtrado por 'fecha_inicio' Y fecha_creacion formateada)
            const dataServiciosRaw = filterDataByDate(allServicios, 'fecha_inicio', fechaDesde, fechaHasta);
            const dataServicios = dataServiciosRaw.map(s => ({
                ...s,
                fecha_creacion: formatTimestamp(s.fecha_creacion), // Usar la función de formato
                fecha_inicio: formatTimestamp(s.fecha_inicio)   // Formatear también fecha_inicio
            }));
            const wsServicios = XLSX.utils.json_to_sheet(dataServicios);
            XLSX.utils.book_append_sheet(wb, wsServicios, "Servicios");

            
            // Hoja 3: Pagos (filtrado por 'fecha_pago' Y creado_en formateado)
            const dataPagosRaw = filterDataByDate(allPagos, 'fecha_pago', fechaDesde, fechaHasta);
            const dataPagos = dataPagosRaw.map(p => ({
                ...p,
                creado_en: formatTimestamp(p.creado_en), // Usar la función de formato
                fecha_pago: formatTimestamp(p.fecha_pago) // Formatear también fecha_pago
            }));
            const wsPagos = XLSX.utils.json_to_sheet(dataPagos);
            XLSX.utils.book_append_sheet(wb, wsPagos, "Pagos");
            
            
            // Hoja 4: Reportes Técnicos (filtrado por 'fecha' Y creado_en formateado)
            const dataReportesRaw = filterDataByDate(allReportes, 'fecha', fechaDesde, fechaHasta);
            const dataReportes = dataReportesRaw.map(r => ({
                ...r,
                // Asumimos que la fecha de registro se llama 'creado_en'
                creado_en: formatTimestamp(r.creado_en), // Usar la función de formato
                fecha: formatTimestamp(r.fecha) // Formatear también 'fecha'
            }));
            const wsReportes = XLSX.utils.json_to_sheet(dataReportes);
            XLSX.utils.book_append_sheet(wb, wsReportes, "Reportes Tecnicos");

            // 3. Descargar el archivo
            const nombreArchivo = `Reporte_Total_CableLatin_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, nombreArchivo);
            
            console.log("Excel generado y descargado.");

        } catch (error) {
            console.error("Error al generar el Excel:", error);
            alert("Ocurrió un error al generar el archivo Excel.");
        } finally {
            // Restaurar el botón
            btnGenerarExcel.disabled = false;
            btnExcelText.textContent = "Generar Excel";
            loaderIcon.style.display = 'none';
            excelIcon.style.display = 'inline-block';
        }
    }, 50); // 50ms de espera para actualizar la UI
});


// ========================================
//   CARGA INICIAL
// ========================================
// Activa los íconos de Lucide
lucide.createIcons();
// Animamos el loader al inicio
const loader = document.getElementById('loader-icon');
if (loader) {
    loader.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' }
    ], {
        duration: 4000, // Duración más lenta para que se note
        iterations: Infinity
    });
}