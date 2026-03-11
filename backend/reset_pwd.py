import os
import sys

# Agregar la ruta apropiada
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.services.auth import hash_password

def reset_pwd():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "test@herman.com").first()
        if user:
            user.password_hash = hash_password("123456")
            db.commit()
            print("Contraseña de test@herman.com restablecida a 123456")
        else:
            print("Usuario test@herman.com no encontrado.")
    finally:
        db.close()

if __name__ == "__main__":
    reset_pwd()
