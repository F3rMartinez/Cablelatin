document.addEventListener('DOMContentLoaded', function() {

    // --- 1. OBTENER LOS ELEMENTOS ---
    const radioResidencia = document.getElementById('tipoResidencia');
    const radioEmpresarial = document.getElementById('tipoEmpresarial');
    const selectTipoDoc = document.getElementById('tipoDoc');
    const labelNumDoc = document.getElementById('labelNumDoc');
    const opcionDni = document.getElementById('opcionDni');
    const opcionRuc = document.getElementById('opcionRuc');
    const opcionCe = document.getElementById('opcionCe');
    
    // Buscamos el formulario de cliente
    const formCliente = document.getElementById('registro-cliente-form');

    // --- 2. FUNCIÓN PARA ACTUALIZAR EL FORMULARIO ---
    function actualizarFormulario() {
        if (radioEmpresarial.checked) {
            labelNumDoc.textContent = 'Número de RUC:'; 
            opcionRuc.hidden = false; 
            selectTipoDoc.value = 'ruc'; 
            selectTipoDoc.disabled = true; 
        } else {
            labelNumDoc.textContent = 'N° de Documento:'; 
            selectTipoDoc.disabled = false; 
            opcionRuc.hidden = true; 
            selectTipoDoc.value = 'dni'; 
        }
    }

    // --- 3. AÑADIR LOS "OYENTES" ---
    radioResidencia.addEventListener('change', actualizarFormulario);
    radioEmpresarial.addEventListener('change', actualizarFormulario);
    
    // Oyente para simular el envío del formulario
    formCliente.addEventListener('submit', function(evento) {
        evento.preventDefault(); 
        
        alert('Cliente (simulado) registrado con éxito. Ahora, asigna el servicio.');
        
        // ¡IMPORTANTE! Revisa que esta línea apunte a TU nombre de archivo
        window.location.href = 'registrarDatosServicio.html';
    });

    // --- 4. EJECUTAR AL INICIO ---
    actualizarFormulario();
});