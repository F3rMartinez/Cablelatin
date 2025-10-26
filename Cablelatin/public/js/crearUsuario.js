document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crearUsuarioForm');

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita que el formulario se envíe de la forma tradicional

        // Recopila los datos del formulario
        const idUsuario = document.getElementById('idUsuario').value;
        const nombre = document.getElementById('nombre').value;
        
        // --- Datos nuevos ---
        const usuario = document.getElementById('usuario').value;
        const contrasena = document.getElementById('contrasena').value;
        // --- Fin datos nuevos ---
        
        const correo = document.getElementById('correo').value;
        const telefono = document.getElementById('telefono').value;
        const estado = document.getElementById('estado').value;

        // Aquí es donde normalmente enviarías estos datos a un servidor.
        // Por ahora, solo los mostraremos en la consola.
        console.log('Datos del nuevo usuario:');
        console.log('ID Usuario:', idUsuario);
        console.log('Nombre:', nombre);
        console.log('Usuario:', usuario);
        console.log('Contraseña:', contrasena); // Obviamente, en una app real no harías esto
        console.log('Correo:', correo);
        console.log('Teléfono:', telefono);
        console.log('Estado:', estado);

        // Puedes añadir aquí una lógica para, por ejemplo, mostrar un mensaje de éxito
        // y luego redirigir al usuario o limpiar el formulario.
        alert('Usuario creado con éxito (simulado)!');
        form.reset(); // Limpia el formulario después de "crear" el usuario
        
        // Si quieres redirigir a usuario.html después de guardar
        // window.location.href = 'usuario.html'; 
    });
});