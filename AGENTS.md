# ScamPaz-Simulador

Aplicación Flask educativa que simula un entorno de phishing/Ingeniería Social (estilo Kahoot).

## Arquitectura y Estado
- **Punto de Entrada:** `python main.py` (puerto 5000, `0.0.0.0`).
- **Estado (In-Memory):** Todo el progreso (estudiantes, logs de permisos, estado del juego) vive en variables globales en `app/database.py`. Reiniciar la app borra todo. Existe un endpoint (`/admin/reset`) para limpiar estado en caliente sin reiniciar.
- **Sincronización (SSE):** Se usa Server-Sent Events (`/api/stream_lobby` y `/api/stream_logs`) para empujar eventos a los clientes. El backend usa un sistema de control por `version` (`estado_juego["version"]`) para emitir los JSON solo cuando hay cambios.

## Flujo Frontend (Plantillas y JS Separado)
El HTML está en `app/templates` y la lógica exclusiva en `app/static/js/`:
- **Unirse (`index.html` / `join.js`):** Pide cámara, captura foto en Base64, detecta OS por User-Agent y roba un PIN señuelo.
- **Lobby Alumnos (`espera.html` / `espera.js`):** Espera el inicio. Al presionar el botón trampa, lanza un modal falso de *Social Engineering* secuencial (Micrófono -> Ubicación -> Notificaciones) antes de mostrar la calavera.
- **Admin (`admin.html` / `admin.js`):** Panel en vivo. Al dar "Empezar", cambia el estado de la sala. Permite exportar a CSV (`/admin/export`).
- **Estilos:** Paleta "Cyber Neon" estricta definida como variables en el `:root` de `style.css`.

## Quirks / Gotchas
- **Navegadores y Permisos:** `getUserMedia` (Cámara/Micrófono) falla silenciosamente si no se sirve bajo HTTPS (Vercel lo provee) o `localhost`.
- **Interacción (User Gesture):** Las APIS de notificaciones y geolocalización requieren un clic real del usuario (por eso el botón trampa "¡HAZ CLIC PARA JUGAR!" en el lobby).
- **Tracking IP:** El endpoint `/join` hace request a `ip-api.com` usando `urllib`. Cuidado con rate limits si se prueba masivamente desde la misma IP.
