from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

engine = create_engine('mysql+mysqlconnector://root:root@localhost/soft_evolved')
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

try:
    # 1. Obtener mi usuario (el que acabamos de crear test@herman.com)
    res = db.execute(text("SELECT id FROM users WHERE email='test@herman.com'")).fetchone()
    if not res:
        print("Usuario test@herman.com no encontrado.")
    else:
        user_id = res[0]
        # 2. Actualizar Owner de los proyectos
        db.execute(text(f"UPDATE projects SET owner_id = {user_id}"))
        db.commit()
        print(f"Exito: Todos los proyectos fueron reasignados al usuario con ID {user_id}.")
except Exception as e:
    print("Error:", e)
finally:
    db.close()
