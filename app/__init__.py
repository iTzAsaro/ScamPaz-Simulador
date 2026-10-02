from flask import Flask

def create_app():
    # Inicializa Flask. Las carpetas templates y static se buscan automáticamente dentro del paquete 'app'
    app = Flask(__name__)
    
    # Importar y registrar Blueprints
    from .routes import main_bp
    app.register_blueprint(main_bp)
    
    return app