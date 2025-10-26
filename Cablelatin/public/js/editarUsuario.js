// Espera a que todo el HTML esté cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SIMULACIÓN DE CARGA DE DATOS ---
    // En una app real, aquí recibirías un ID y buscarías estos datos en tu base de datos.
    // Por ahora, usamos datos fijos.
    const datosUsuarioSimulados = {
        idUsuario: "ID_001",
        nombre: "Ana Torres",
        usuario: "atorres",
        correo: "ana.torres@example.com",
        telefono: "987654321",
        estado: "Activo"
        // Nota: La contraseña NUNCA se debe cargar desde la base de datos al formulario por seguridad.
    };

    // Función para llenar el formulario con los datos
    function cargarDatosEnFormulario(datos) {
        document.getElementById('idUsuario').value = datos.idUsuario;
        document.getElementById('idUsuario').disabled = true; // El ID no se debe poder cambiar
        document.getElementById('nombre').value = datos.nombre;
        document.getElementById('usuario').value = datos.usuario;
        document.getElementById('correo').value = datos.correo;
        document.getElementById('telefono').value = datos.telefono;
        document.getElementById('estado').value = datos.estado;
    }

    // Llama a la función para llenar el formulario
    cargarDatosEnFormulario(datosUsuarioSimulados);

    
    // --- 2. MANEJO DEL ENVÍO (ACTUALIZACIÓN) ---
    const form = document.getElementById('editarUsuarioForm');

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita el envío tradicional

        // Recopila los datos (incluyendo los que se hayan modificado)
        const idUsuario = document.getElementById('idUsuario').value; // Sigue siendo el mismo
        const nombre = document.getElementById('nombre').value;
        const usuario = document.getElementById('usuario').value;
        const contrasena = document.getElementById('contrasena').value;
        const correo = document.getElementById('correo').value;
        const telefono = document.getElementById('telefono').value;
        const estado = document.getElementById('estado').value;

        // Mostramos en consola lo que se "enviaría" para actualizar
        console.log('Datos del usuario actualizados:');
        console.log('ID Usuario:', idUsuario);
        console.log('Nombre:', nombre);
        console.log('Usuario:', usuario);
        
        // Lógica para la contraseña: si el campo no está vacío, se actualiza.
        if (contrasena) {
            console.log('Nueva Contraseña:', contrasena);
        } else {
            console.log('Contraseña: (Sin cambios)');
        }
        
        console.log('Correo:', correo);
        console.log('Teléfono:', telefono);
        console.log('Estado:', estado);

        alert('Usuario actualizado con éxito (simulado)!');
        
        // Opcionalmente, redirigir de vuelta a la lista de usuarios
        // window.location.href = 'usuario.html'; 
    });
});