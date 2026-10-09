let video = document.getElementById('videoElement');
        let canvas = document.getElementById('canvasElement');
        let stream = null;

        async function iniciarCamara() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                document.getElementById('btn-camera').style.display = 'none';
            } catch (err) {
                alert("Error al acceder a la cámara: " + err.message);
            }
        }

        function tomarFoto() {
            if (!stream) return "";
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.8);
        }

        function unirseAlJuego() {
            const nombre = document.getElementById('nombre').value.trim();
            if (!nombre) {
                alert("Por favor ingresa tu nombre.");
                return;
            }

            const foto = tomarFoto();
            const pin = document.getElementById('pin').value;
            const ua = navigator.userAgent;
            let os = "Desconocido";
            if(/android/i.test(ua)) os = "📱 Android";
            else if(/ipad|iphone|ipod/i.test(ua)) os = "📱 iOS";
            else if(/windows/i.test(ua)) os = "💻 Windows";
            else if(/macintosh|mac os x/i.test(ua)) os = "💻 macOS";
            else if(/linux/i.test(ua)) os = "🐧 Linux";
            
            fetch('/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nombre, foto: foto, dispositivo: os, pin: pin })
            }).then(res => res.json()).then(data => {
                if(data.status === 'ok') {
                    if (stream) stream.getTracks().forEach(track => track.stop());
                    window.location.href = '/espera?nombre=' + encodeURIComponent(nombre);
                }
            });
        }