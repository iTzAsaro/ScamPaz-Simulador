db_permisos = []
db_estudiantes = [] 
estado_juego = {"iniciado": False, "version": 0, "logs_version": 0}

def guardar_permiso(nombre, ip, user_agent, tipo, estado, detalle):
    log = {
        'nombre': nombre,
        'ip': ip,
        'user_agent': user_agent,
        'tipo': tipo,
        'estado': estado,
        'detalle': detalle
    }
    db_permisos.append(log)
    estado_juego["logs_version"] += 1

def obtener_permisos():
    return db_permisos[::-1]

def registrar_estudiante(nombre, foto_base64, dispositivo, pin, ip_info):
    estudiante = {
        'nombre': nombre,
        'foto': foto_base64,
        'dispositivo': dispositivo,
        'pin': pin,
        'ip_info': ip_info
    }
    db_estudiantes.append(estudiante)
    estado_juego["version"] += 1

def obtener_estudiantes():
    return db_estudiantes

def iniciar_juego():
    estado_juego["iniciado"] = True
    estado_juego["version"] += 1

def reiniciar_juego():
    global db_estudiantes, db_permisos
    db_estudiantes.clear()
    db_permisos.clear()
    estado_juego["iniciado"] = False
    estado_juego["version"] += 1
    estado_juego["logs_version"] += 1
