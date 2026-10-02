db_registros = [] # Ya no se usa para la tabla separada, pero se mantiene por compatibilidad
db_permisos = []

def guardar_registro(nombre, user_agent, ip, idioma):
    # Función heredada de la primera versión
    pass

def obtener_registros():
    return db_registros[::-1]

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

def obtener_permisos():
    return db_permisos[::-1]