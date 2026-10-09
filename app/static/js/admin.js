const listaEstudiantes = document.getElementById('lista-estudiantes');
        const contador = document.getElementById('contador');
        const panelLobby = document.getElementById('panel-lobby');
        const panelLogs = document.getElementById('panel-logs');
        const logsBody = document.getElementById('logs-body');

        // Escuchar estudiantes (Lobby)
        const lobbySource = new EventSource('/api/stream_lobby');
        lobbySource.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            listaEstudiantes.innerHTML = '';
            data.estudiantes.forEach(est => {
                const img = est.foto ? `<img src="${est.foto}" alt="foto">` : `<img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'></svg>">`;
                listaEstudiantes.innerHTML += `
                    <div class="estudiante-card">
                        ${img}
                        <div><strong>${est.nombre}</strong></div>
                        <div style="font-size: 0.8em; color: #aaa;">${est.dispositivo || ""}</div>
                        <div style="font-size: 0.9em; color: var(--error-red); margin-top: 5px;">PIN: ${est.pin || ""}</div>
                        <div style="font-size: 0.7em; color: var(--success-green);">${est.ip_info || ""}</div>
                    </div>
                `;
            });
            contador.innerText = data.estudiantes.length;

            if(data.iniciado) {
                // Si alguien reinicia la pagina admin durante el juego, saltar a los logs
                panelLobby.style.display = 'none';
                panelLogs.style.display = 'block';
            } else {
                panelLobby.style.display = 'block';
                panelLogs.style.display = 'none';
            }
        };

        // Escuchar logs de los ataques
        const logsSource = new EventSource('/api/stream_logs');
        logsSource.onmessage = function(event) {
            const logs = JSON.parse(event.data);
            logsBody.innerHTML = '';
            logs.forEach(log => {
                const statusClass = log.estado === 'Concedido' ? 'status-granted' : 'status-denied';
                logsBody.innerHTML += `
                    <tr>
                        <td><strong>${log.nombre}</strong></td>
                        <td>${log.tipo}</td>
                        <td class="${statusClass}">${log.estado}</td>
                        <td>${log.detalle}</td>
                        <td style="font-size: 0.8em; color: #aaa;">${log.ip}</td>
                    </tr>
                `;
            });
        };

        function empezarJuego() {
            fetch('/admin/start', { method: 'POST' }).then(() => {
                panelLobby.style.display = 'none';
                panelLogs.style.display = 'block';
            });
        }

        function reiniciarJuego() {
            if(confirm("¿Seguro que quieres borrar todos los datos y reiniciar la sala?")) {
                fetch('/admin/reset', { method: 'POST' }).then(() => {
                    logsBody.innerHTML = '';
                });
            }
        }