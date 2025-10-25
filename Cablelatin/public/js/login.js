document.addEventListener('DOMContentLoaded', function() {

    // 1. Busca el botón por su ID
    const loginButton = document.getElementById('loginBtn');

    // 2. Añade un "oyente" para cuando el usuario haga clic
    loginButton.addEventListener('click', function() {
        
        // 3. ¡La simulación! Redirige a la página del vendedor
        console.log('Simulando login... Redirigiendo a vendedor.html');
        window.location.href = 'vendedor.html'; 
    });
    
});