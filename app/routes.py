from flask import Blueprint, request, render_template, jsonify, Response
from .database import guardar_registro, obtener_registros, guardar_permiso, obtener_permisos
import json
import time

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def inicio():
    return render_template('base.html')

@main_bp.route('/guardar', methods=['POST'])
def guardar():
    nombre = request.form.get('nombre', 'Anónimo')
    return render_template('exito.html', nombre=nombre)

@main_bp.route('/admin')
def admin():
    permisos = obtener_permisos()
    return render_template('admin.html', permisos=permisos)

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

# Server-Sent Events (SSE) para "Push" en tiempo real sin polling del cliente
@main_bp.route('/api/stream')
def api_stream():
    def event_stream():
        # Cuenta inicial
        last_count = len(obtener_permisos())
        while True:
            # Revisa la base de datos cada segundo en el servidor, no en el cliente
            time.sleep(1)
            current_count = len(obtener_permisos())
            if current_count > last_count:
                # Extrae solo los elementos nuevos (están al principio porque la lista se invierte)
                nuevos_datos = obtener_permisos()[0:current_count - last_count]
                last_count = current_count
                
                # Enviar evento SSE al cliente
                yield f"data: {json.dumps(nuevos_datos)}\n\n"
                
    return Response(event_stream(), mimetype="text/event-stream")