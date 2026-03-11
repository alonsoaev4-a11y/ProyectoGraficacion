from sqlalchemy import create_engine, text

engine = create_engine('mysql+pymysql://root:root@localhost/soft_evolved')
with engine.connect() as ctx:
    res = ctx.execute(text("SELECT u.email, u.name FROM users u JOIN projects p ON u.id = p.owner_id WHERE p.name='E-Commerce Platform'")).fetchone()
    if res:
        print(f"EMAIL_DUENO: {res[0]}")
    else:
        print("PROYECTO_NO_ENCONTRADO")
