document.addEventListener('DOMContentLoaded', () => {
lucide.createIcons();

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const btnText = loginBtn.querySelector('.btn-text');
const usuarioInput = document.getElementById('usuario');
const contraseñaInput = document.getElementById('contraseña');
const msgBox = document.getElementById('msg-box');

let intentosFallidos = 0;
const MAX_INTENTOS = 3;
const SEGUNDOS_BLOQUEO = 30;
let enBloqueo = false;

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (enBloqueo) return;

    const usuario = usuarioInput.value.trim();
    const contraseña = contraseñaInput.value.trim();

    if (!usuario || !contraseña) {
    mostrarMensaje('Por favor, ingrese usuario y contraseña.', 'error');
    return;
    }

    setLoading(true);

    setTimeout(() => {
    if (usuario === 'admin' && contraseña === '12345') {
        mostrarMensaje('¡Inicio de sesión exitoso!', 'success');
        intentosFallidos = 0;
        setTimeout(() => {
        window.location.href = '/Cablelatin/public/html/tablero.html';
        }, 1000);
    } else {
        intentosFallidos++;
        if (intentosFallidos >= MAX_INTENTOS) {
        iniciarBloqueo();
        } else {
        const restantes = MAX_INTENTOS - intentosFallidos;
        mostrarMensaje(
            `Datos incorrectos. Quedan ${restantes} ${restantes === 1 ? 'intento' : 'intentos'}.`,
            'error'
        );
        setLoading(false);
        }
    }
    }, 1500);
});

function iniciarBloqueo() {
    enBloqueo = true;
    setLoading(false);
    setFormDisabled(true);

    let segundosRestantes = SEGUNDOS_BLOQUEO;
    mostrarMensaje(`Demasiados intentos. Espere ${segundosRestantes} segundos.`, 'error');

    const timerInterval = setInterval(() => {
    segundosRestantes--;
    if (segundosRestantes > 0) {
        mostrarMensaje(`Demasiados intentos. Espere ${segundosRestantes} segundos.`, 'error');
    } else {
        clearInterval(timerInterval);
        mostrarMensaje('Puede intentarlo de nuevo.', 'success');
        intentosFallidos = 0;
        enBloqueo = false;
        setFormDisabled(false);
        setTimeout(() => {
        if (!enBloqueo) msgBox.classList.remove('show');
        }, 3000);
    }
    }, 1000);
}

function mostrarMensaje(mensaje, tipo = 'error') {
    msgBox.textContent = mensaje;
    msgBox.classList.add('show');
    msgBox.classList.toggle('success', tipo === 'success');
    msgBox.classList.toggle('error', tipo !== 'success');
}
function setLoading(isLoading) {
    if (isLoading) {
    loginBtn.classList.add('loading');
    btnText.textContent = 'INGRESANDO...';
    } else {
    loginBtn.classList.remove('loading');
    btnText.textContent = 'INGRESAR';
    }
    setFormDisabled(isLoading);
}

function setFormDisabled(disabled) {
    usuarioInput.disabled = disabled;
    contraseñaInput.disabled = disabled;
    loginBtn.disabled = disabled;
    loginBtn.style.cursor = disabled ? 'not-allowed' : 'pointer';
}
});
