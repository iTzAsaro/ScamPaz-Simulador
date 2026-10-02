from app import create_app

# Punto de entrada principal (Entry Point)
app = create_app()

if __name__ == '__main__':
    # Ejecuta el servidor en todas las interfaces, puerto 5000
    app.run(host='0.0.0.0', port=5000, debug=True)