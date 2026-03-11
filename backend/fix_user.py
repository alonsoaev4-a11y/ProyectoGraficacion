from sqlalchemy import create_engine, text

engine = create_engine('mysql+pymysql://root:root@localhost/soft_evolved')
with engine.connect() as ctx:
    # Obtener nuestro ID
    res = ctx.execute(text("SELECT id FROM users WHERE email='test@herman.com'")).fetchone()
    if res:
        our_id = res[0]
        # Dar permisos
        ctx.execute(text(f"UPDATE projects SET owner_id={our_id} WHERE owner_id=1"))
        ctx.commit()
        print(f'Proyectos asignados a ID {our_id}')
