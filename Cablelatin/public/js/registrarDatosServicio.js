document.addEventListener('DOMContentLoaded', function() {

    // --- 1. OBTENER LOS ELEMENTOS ---
    const tipoPlan = document.getElementById('tipoPlan');
    const precioPlan = document.getElementById('precio');
    
    const servicioAdicional = document.getElementById('adicional');
    const costoAdicional = document.getElementById('costoAdicional');

    // --- 2. FUNCIÓN PARA ACTUALIZAR EL PRECIO DEL PLAN ---
    function actualizarPrecioPlan() {
        const planSeleccionado = tipoPlan.value;
        
        switch (planSeleccionado) {
            case 'tv':
                precioPlan.value = 40;
                break;
            case 'internet':
                precioPlan.value = 60;
                break;
            case 'combo':
                precioPlan.value = 100;
                break;
            default:
                precioPlan.value = 0;
        }
    }

    // --- 3. FUNCIÓN PARA ACTUALIZAR EL COSTO ADICIONAL ---
    function actualizarCostoAdicional() {
        const adicionalSeleccionado = servicioAdicional.value;
        
        if (adicionalSeleccionado === 'basico-tv') {
            costoAdicional.value = 10;
        } else {
            costoAdicional.value = 0;
        }
    }

    // --- 4. AÑADIR LOS "OYENTES" ---
    // Escuchamos cambios en el "Tipo de Plan"
    tipoPlan.addEventListener('change', actualizarPrecioPlan);
    
    // Escuchamos cambios en "Servicios Adicionales"
    servicioAdicional.addEventListener('change', actualizarCostoAdicional);

    // --- 5. EJECUTAR AL INICIO ---
    // Esto es para que ponga los precios correctos
    // apenas cargue la página.
    actualizarPrecioPlan();
    actualizarCostoAdicional();
});