// Función para mostrar efecto visual
function mostrarCalavera() {
    const overlay = document.getElementById('skull-overlay');
    overlay.classList.add('active');

    // Ocultar después de 2,5 segundos (antes era 1.5s)
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 2500);
}

// Envía el resultado al servidor
function enviarAlServidor(tipo, estado, detalle) {
    const nombre = document.getElementById('nombre') ? document.getElementById('nombre').value : 'Anónimo';

    // Activa la calavera hacker prolongada
    mostrarCalavera();

    fetch('/log_permiso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre, tipo: tipo, estado: estado, detalle: detalle })
    });
}

function pedirUbicacion() {
    const div = document.getElementById('resultado-ubicacion');
    div.style.display = 'block';
    div.innerText = 'Solicitando permiso... Mira el navegador.';

    if (!("geolocation" in navigator)) {
        div.innerText = 'Geolocalización no soportada en este navegador.';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            div.innerText = 'Riesgo: un sitio ahora sabe tu ubicacion exacta. Lat ' + lat.toFixed(4) + ', Lon ' + lon.toFixed(4);
            div.style.color = "#ff3366";
            enviarAlServidor('Ubicación', 'Concedido', 'Lat: ' + lat + ', Lon: ' + lon);
        },
        function () {
            div.innerText = 'Bien hecho. Denegaste el permiso de ubicación.';
            div.style.color = "#00ffcc";
            enviarAlServidor('Ubicación', 'Denegado', 'Bloqueado');
        }
    );
}

function pedirNotificaciones() {
    const div = document.getElementById('resultado-notif');
    div.style.display = 'block';
    div.innerText = 'Solicitando permiso... Mira el navegador.';

    if (!("Notification" in window)) {
        div.innerText = 'Notificaciones no soportadas.';
        return;
    }

    Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
            div.innerText = 'Riesgo: esta pagina puede enviarte avisos falsos.';
            div.style.color = "#ff3366";
            new Notification("Simulacion", { body: "Aviso de prueba." });
            enviarAlServidor('Notificaciones', 'Concedido', 'Acceso a escritorio');
        } else {
            div.innerText = 'Bien hecho. Denegaste el permiso de notificaciones.';
            div.style.color = "#00ffcc";
            enviarAlServidor('Notificaciones', 'Denegado', 'Bloqueado');
        }
    });
}
