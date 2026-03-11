"""
16 Use Cases with full frontend snapshot format for E-Commerce Platform.
"""

def _actor(n, rid, name, role, ptype="primario", scope="total", crud=None):
    c = crud or {"create":False,"read":True,"update":False,"delete":False,"execute":False}
    return {"id":f"actor-{n}","roleId":rid,"name":name,"role":role,"participationType":ptype,"accessScope":scope,"crudImpact":c}

def _pre(n, desc):
    return {"id":f"pre-{n}","description":desc}

def _post(n, desc):
    return {"id":f"post-{n}","description":desc}

def _br(n, desc, active=True, level="mandatory", expr=None, emsg=None, ecode=None):
    r = {"id":f"br-{n}","description":desc,"isActive":active,"enforcementLevel":level}
    if expr: r["logic"]={"expression":expr,"errorMsg":emsg or "","errorCode":ecode or ""}
    return r

def _exc(n, desc, trigger=None, http=500, recovery="", umsg=""):
    r = {"id":f"exc-{n}","description":desc}
    if trigger: r["triggerCondition"]=trigger
    r["response"]={"httpStatus":http,"recoveryAction":recovery,"userMessage":umsg}
    return r

def _step(n, order, aid, action, stype="SYSTEM_PROCESS"):
    return {"id":f"step-{n}","order":order,"actorId":f"actor-{aid}","action":action,"type":stype}

def _af(n, code, title, steps, trigger=None, ctype=None, clogic=None):
    r = {"id":f"af-{n}","code":code,"title":title,"steps":steps}
    if trigger: r["triggerStepId"]=trigger
    if ctype: r["condition"]={"type":ctype,"logic":clogic or ""}
    return r

# ══════════════════════════════════════════════════════════════════════════════

USE_CASES = [
    # ── CU-01: Busqueda y filtrado ────────────────────────────────────────────
    {
        "title": "Busqueda y filtrado de productos",
        "description": "El usuario busca productos usando texto libre con autocompletado y aplica filtros por categoria, precio, marca y valoracion para encontrar el producto deseado.",
        "preconditions": ["El catalogo tiene al menos 1 producto activo", "El servicio de busqueda esta disponible"],
        "postconditions": ["Se muestran resultados paginados", "Los filtros aplicados se reflejan en la URL"],
        "snapshot": {
            "id": "uc-1", "code": "CU-01", "title": "Busqueda y filtrado de productos",
            "description": "El usuario busca productos usando texto libre con autocompletado y aplica filtros por categoria, precio, marca y valoracion para encontrar el producto deseado.",
            "type": "principal", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-cliente","Cliente","Usuario final",crud={"create":False,"read":True,"update":False,"delete":False,"execute":True}),
                _actor(2,"role-sistema","Motor de Busqueda","Sistema interno","soporte",crud={"create":False,"read":True,"update":False,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El catalogo tiene al menos 1 producto activo"),_pre(2,"El servicio de busqueda (Elasticsearch/Meilisearch) esta operativo")],
            "postconditions": [_post(1,"Se muestran resultados paginados ordenados por relevancia"),_post(2,"Los filtros aplicados se reflejan en la URL para compartir")],
            "businessRules": [
                _br(1,"El autocompletado se activa tras 3 caracteres con debounce de 300ms",expr="input.length >= 3 && debounce(300)"),
                _br(2,"Los resultados se paginan a 24 productos por pagina",expr="pageSize == 24"),
                _br(3,"Productos inactivos o sin stock no aparecen en resultados",expr="product.is_active && product.stock > 0",emsg="Producto no disponible")
            ],
            "exceptions": [
                _exc(1,"Servicio de busqueda no disponible","Elasticsearch/Meilisearch down",503,"Fallback a busqueda SQL LIKE","Busqueda temporalmente limitada. Intente de nuevo."),
                _exc(2,"Sin resultados para la busqueda","query.results.length == 0",200,"Mostrar sugerencias alternativas","No encontramos productos. Prueba con otros terminos.")
            ],
            "steps": [
                _step(1,1,1,"Ingresa termino de busqueda en la barra superior","USER_INPUT"),
                _step(2,2,2,"Muestra hasta 8 sugerencias de autocompletado","SYSTEM_PROCESS"),
                _step(3,3,1,"Selecciona sugerencia o presiona Enter","USER_INPUT"),
                _step(4,4,2,"Ejecuta busqueda full-text y retorna resultados paginados","DB_OPERATION"),
                _step(5,5,1,"Aplica filtros (categoria, precio, marca, valoracion)","USER_INPUT"),
                _step(6,6,2,"Filtra resultados y actualiza paginacion","SYSTEM_PROCESS"),
                _step(7,7,1,"Selecciona orden (relevancia, precio, popularidad, fecha)","USER_INPUT"),
                _step(8,8,2,"Reordena resultados y actualiza vista","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Busqueda por voz",[
                    _step(1,1,1,"Activa microfono para busqueda por voz","USER_INPUT"),
                    _step(2,2,2,"Transcribe audio a texto via Web Speech API","EXTERNAL_CALL"),
                    _step(3,3,2,"Ejecuta busqueda con texto transcrito","SYSTEM_PROCESS")
                ],"step-1","alternative","Browser soporta Web Speech API")
            ]
        }
    },
    # ── CU-02: Detalle de producto ────────────────────────────────────────────
    {
        "title": "Ver detalle de producto",
        "description": "El usuario accede a la pagina de detalle de un producto para ver imagenes, descripcion, variantes, precio, disponibilidad y resenas antes de decidir la compra.",
        "preconditions": ["El producto existe y esta activo", "El usuario accede desde catalogo o URL directa"],
        "postconditions": ["Se muestra toda la informacion del producto", "Se registra la visita para analitica"],
        "snapshot": {
            "id": "uc-2", "code": "CU-02", "title": "Ver detalle de producto",
            "description": "El usuario accede a la pagina de detalle de un producto para ver imagenes, descripcion, variantes, precio, disponibilidad y resenas antes de decidir la compra.",
            "type": "principal", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-cliente","Cliente","Usuario final",crud={"create":False,"read":True,"update":False,"delete":False,"execute":False}),
                _actor(2,"role-sistema","Sistema","Backend API","soporte",crud={"create":False,"read":True,"update":True,"delete":False,"execute":False})
            ],
            "preconditions": [_pre(1,"El producto existe y esta activo en el catalogo"),_pre(2,"El usuario tiene conexion a internet estable")],
            "postconditions": [_post(1,"Se muestra toda la informacion del producto incluyendo galeria, variantes y resenas"),_post(2,"Se registra page view para analitica de comportamiento")],
            "businessRules": [
                _br(1,"La galeria muestra hasta 10 imagenes con zoom al pasar mouse",expr="product.images.length <= 10"),
                _br(2,"El precio mostrado incluye IVA y se actualiza al seleccionar variante",expr="displayPrice = variant.price * 1.16"),
                _br(3,"Las resenas se muestran ordenadas por utilidad con paginacion de 5",expr="reviews.orderBy('helpful_count').limit(5)")
            ],
            "exceptions": [
                _exc(1,"Producto no encontrado o inactivo","product == null || !product.is_active",404,"Redirigir a catalogo con mensaje","Este producto ya no esta disponible."),
                _exc(2,"Imagenes no cargan","CDN timeout > 5s",200,"Mostrar placeholder con retry","Las imagenes estan cargando. Intente refrescar.")
            ],
            "steps": [
                _step(1,1,1,"Hace clic en producto desde catalogo o accede por URL","USER_INPUT"),
                _step(2,2,2,"Carga datos del producto: info, imagenes, variantes, resenas","DB_OPERATION"),
                _step(3,3,2,"Renderiza pagina con galeria, descripcion, selectores de variante","SYSTEM_PROCESS"),
                _step(4,4,1,"Navega galeria de imagenes (thumbnails, zoom, fullscreen)","USER_INPUT"),
                _step(5,5,1,"Selecciona variante de producto (talla, color)","USER_INPUT"),
                _step(6,6,2,"Actualiza precio, stock y galeria segun variante seleccionada","SYSTEM_PROCESS"),
                _step(7,7,1,"Lee resenas y valoraciones de otros compradores","USER_INPUT")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Producto agotado",[
                    _step(1,1,2,"Detecta stock = 0 para variante seleccionada","VALIDATION"),
                    _step(2,2,2,"Deshabilita boton 'Agregar al carrito'","SYSTEM_PROCESS"),
                    _step(3,3,1,"Puede suscribirse a notificacion de restock","USER_INPUT"),
                    _step(4,4,2,"Registra email para alerta de disponibilidad","DB_OPERATION")
                ],"step-6","exception","variant.stock == 0")
            ]
        }
    },
    # ── CU-03: Registro de usuario ────────────────────────────────────────────
    {
        "title": "Registro de usuario",
        "description": "Un visitante crea una cuenta nueva proporcionando email, contrasena y datos basicos. El sistema valida unicidad del email, fortaleza de contrasena, y envia email de verificacion.",
        "preconditions": ["El usuario no tiene cuenta existente", "El servicio de email esta operativo"],
        "postconditions": ["Se crea la cuenta en estado pendiente de verificacion", "Se envia email con enlace de verificacion"],
        "snapshot": {
            "id": "uc-3", "code": "CU-03", "title": "Registro de usuario",
            "description": "Un visitante crea una cuenta nueva proporcionando email, contrasena y datos basicos.",
            "type": "principal", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-visitante","Visitante","Usuario no registrado",crud={"create":True,"read":False,"update":False,"delete":False,"execute":False}),
                _actor(2,"role-sistema","Sistema","Backend API","soporte",crud={"create":True,"read":True,"update":False,"delete":False,"execute":True}),
                _actor(3,"role-email","Servicio de Email","SendGrid","soporte",crud={"create":False,"read":False,"update":False,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El visitante no tiene cuenta con el email proporcionado"),_pre(2,"El servicio de email (SendGrid) esta operativo"),_pre(3,"El formulario de registro es accesible")],
            "postconditions": [_post(1,"Se crea cuenta en estado 'pending_verification'"),_post(2,"Se envia email con token de verificacion valido por 24h")],
            "businessRules": [
                _br(1,"Email debe ser unico en el sistema",expr="!users.exists(email)",emsg="Este email ya esta registrado",ecode="EMAIL_EXISTS"),
                _br(2,"Contrasena minimo 8 caracteres con mayuscula, minuscula y numero",expr="password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/)",emsg="La contrasena no cumple requisitos minimos",ecode="WEAK_PASSWORD"),
                _br(3,"Rate limit: max 3 registros por IP por hora",expr="registrations_per_ip_hour < 3",emsg="Demasiados intentos. Espere 1 hora.",ecode="RATE_LIMITED")
            ],
            "exceptions": [
                _exc(1,"Email ya registrado","users.exists(email)",409,"Sugerir recuperar contrasena","Este email ya tiene cuenta. Deseas recuperar tu contrasena?"),
                _exc(2,"Servicio de email no disponible","sendgrid.status != 200",503,"Crear cuenta sin verificacion, reintentar envio en 5min","Cuenta creada. El email de verificacion llegara pronto."),
                _exc(3,"Rate limit excedido","registrations_per_ip >= 3",429,"Mostrar captcha como alternativa","Demasiados intentos. Intente mas tarde.")
            ],
            "steps": [
                _step(1,1,1,"Hace clic en 'Crear cuenta' desde header o checkout","USER_INPUT"),
                _step(2,2,2,"Muestra formulario de registro con campos requeridos","SYSTEM_PROCESS"),
                _step(3,3,1,"Completa nombre, email y contrasena","USER_INPUT"),
                _step(4,4,2,"Valida formato de email y fortaleza de contrasena en tiempo real","VALIDATION"),
                _step(5,5,1,"Acepta terminos y condiciones y hace clic en 'Registrarse'","USER_INPUT"),
                _step(6,6,2,"Verifica unicidad del email en base de datos","DB_OPERATION"),
                _step(7,7,2,"Crea usuario con password hasheado (bcrypt) y estado pending","DB_OPERATION"),
                _step(8,8,3,"Envia email de verificacion con token JWT de 24h","NOTIFICATION"),
                _step(9,9,2,"Muestra pantalla de confirmacion: 'Revisa tu email'","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Registro con Google OAuth",[
                    _step(1,1,1,"Hace clic en 'Continuar con Google'","USER_INPUT"),
                    _step(2,2,2,"Redirige a Google OAuth consent screen","EXTERNAL_CALL"),
                    _step(3,3,1,"Autoriza acceso a perfil basico en Google","USER_INPUT"),
                    _step(4,4,2,"Recibe token de Google, extrae email y nombre","EXTERNAL_CALL"),
                    _step(5,5,2,"Crea usuario verificado automaticamente (email de Google es confiable)","DB_OPERATION")
                ],"step-1","alternative","Usuario elige OAuth en lugar de email/password")
            ]
        }
    },
    # ── CU-04: Login ──────────────────────────────────────────────────────────
    {
        "title": "Inicio de sesion (Login)",
        "description": "El usuario inicia sesion con email y contrasena o via OAuth. El sistema valida credenciales, genera tokens JWT y crea la sesion.",
        "preconditions": ["El usuario tiene cuenta verificada", "El servicio de autenticacion esta disponible"],
        "postconditions": ["Se genera JWT access + refresh token", "Se crea registro de sesion con IP y user-agent"],
        "snapshot": {
            "id": "uc-4", "code": "CU-04", "title": "Inicio de sesion (Login)",
            "description": "El usuario inicia sesion con email y contrasena o via OAuth.",
            "type": "principal", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-cliente","Usuario","Usuario registrado",crud={"create":False,"read":True,"update":False,"delete":False,"execute":True}),
                _actor(2,"role-sistema","Auth Service","Servicio de autenticacion","soporte",crud={"create":True,"read":True,"update":True,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El usuario tiene una cuenta verificada en el sistema"),_pre(2,"El servicio de autenticacion esta disponible")],
            "postconditions": [_post(1,"Se genera par de tokens JWT (access 15min + refresh 7d)"),_post(2,"Se registra sesion con IP, user-agent y timestamp")],
            "businessRules": [
                _br(1,"Max 5 intentos fallidos en 15 minutos antes de bloqueo temporal",expr="failed_attempts < 5 in 15min",emsg="Cuenta bloqueada temporalmente. Intente en 15 minutos.",ecode="ACCOUNT_LOCKED"),
                _br(2,"Sesiones concurrentes limitadas a 5 dispositivos",expr="active_sessions.count <= 5",emsg="Maximo de dispositivos alcanzado. Cierre sesion en otro dispositivo.",ecode="MAX_SESSIONS"),
                _br(3,"Refresh token se rota en cada uso (rotation policy)",expr="refreshToken.rotateOnUse == true")
            ],
            "exceptions": [
                _exc(1,"Credenciales invalidas","!bcrypt.verify(password, hash)",401,"Incrementar contador de intentos fallidos","Email o contrasena incorrectos."),
                _exc(2,"Cuenta no verificada","user.status == 'pending_verification'",403,"Reenviar email de verificacion","Tu cuenta no esta verificada. Revisa tu email."),
                _exc(3,"Cuenta bloqueada por intentos","failed_attempts >= 5",429,"Enviar email de desbloqueo","Cuenta bloqueada por seguridad. Revisa tu email.")
            ],
            "steps": [
                _step(1,1,1,"Accede a la pagina de login","USER_INPUT"),
                _step(2,2,1,"Ingresa email y contrasena","USER_INPUT"),
                _step(3,3,2,"Valida formato de email y campos no vacios","VALIDATION"),
                _step(4,4,2,"Busca usuario por email en base de datos","DB_OPERATION"),
                _step(5,5,2,"Verifica contrasena con bcrypt.verify()","VALIDATION"),
                _step(6,6,2,"Genera JWT access token (15min) y refresh token (7d)","SYSTEM_PROCESS"),
                _step(7,7,2,"Crea registro de sesion (IP, user-agent, expires_at)","DB_OPERATION"),
                _step(8,8,2,"Retorna tokens y redirige al dashboard o pagina anterior","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Recuperar contrasena",[
                    _step(1,1,1,"Hace clic en 'Olvidaste tu contrasena?'","USER_INPUT"),
                    _step(2,2,1,"Ingresa email de la cuenta","USER_INPUT"),
                    _step(3,3,2,"Genera token temporal (1h) y envia email de recuperacion","NOTIFICATION"),
                    _step(4,4,1,"Hace clic en enlace del email y define nueva contrasena","USER_INPUT"),
                    _step(5,5,2,"Actualiza password hash e invalida sesiones anteriores","DB_OPERATION")
                ],"step-1","alternative","Usuario no recuerda contrasena")
            ]
        }
    },
    # ── CU-05: Gestion del carrito ────────────────────────────────────────────
    {
        "title": "Gestion del carrito de compras",
        "description": "El usuario agrega, modifica cantidades y elimina productos del carrito. El carrito persiste entre sesiones y se sincroniza entre dispositivos al iniciar sesion.",
        "preconditions": ["El producto a agregar esta activo y tiene stock", "El carrito esta accesible (cookie o sesion)"],
        "postconditions": ["El carrito refleja los cambios del usuario", "El stock se reserva temporalmente"],
        "snapshot": {
            "id": "uc-5", "code": "CU-05", "title": "Gestion del carrito de compras",
            "description": "El usuario agrega, modifica cantidades y elimina productos del carrito.",
            "type": "principal", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-cliente","Cliente","Comprador",crud={"create":True,"read":True,"update":True,"delete":True,"execute":False}),
                _actor(2,"role-sistema","Sistema","Backend + Cache","soporte",crud={"create":True,"read":True,"update":True,"delete":True,"execute":False})
            ],
            "preconditions": [_pre(1,"El producto esta activo y tiene stock disponible"),_pre(2,"Existe un carrito asociado al usuario o sesion anonima")],
            "postconditions": [_post(1,"El carrito refleja todos los cambios del usuario"),_post(2,"Los precios en carrito se actualizan si cambian en catalogo")],
            "businessRules": [
                _br(1,"Cantidad maxima por item: 10 unidades (configurable)",expr="item.quantity <= 10",emsg="Maximo 10 unidades por producto",ecode="MAX_QTY"),
                _br(2,"Carrito expira en 30 dias de inactividad",expr="cart.updatedAt > now() - 30d"),
                _br(3,"Al hacer login, carrito anonimo se fusiona con carrito del usuario",expr="mergeCart(anonymous, authenticated)")
            ],
            "exceptions": [
                _exc(1,"Producto sin stock al agregar","product.stock == 0",409,"Sugerir productos similares","Este producto esta agotado. Mira estas alternativas."),
                _exc(2,"Stock insuficiente para cantidad solicitada","requested_qty > product.stock",409,"Ajustar a stock disponible","Solo quedan {stock} unidades. Ajustamos tu carrito.")
            ],
            "steps": [
                _step(1,1,1,"Hace clic en 'Agregar al carrito' desde detalle o catalogo","USER_INPUT"),
                _step(2,2,2,"Valida stock disponible para producto/variante y cantidad","VALIDATION"),
                _step(3,3,2,"Agrega item al carrito (o incrementa cantidad si ya existe)","DB_OPERATION"),
                _step(4,4,2,"Muestra notificacion de confirmacion con mini-carrito","SYSTEM_PROCESS"),
                _step(5,5,1,"Accede al carrito para revisar items","USER_INPUT"),
                _step(6,6,2,"Muestra lista de items con imagen, nombre, variante, precio, cantidad","SYSTEM_PROCESS"),
                _step(7,7,1,"Modifica cantidad o elimina items","USER_INPUT"),
                _step(8,8,2,"Recalcula subtotal, impuestos y total estimado","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Carrito vacio",[
                    _step(1,1,1,"Accede al carrito sin productos","USER_INPUT"),
                    _step(2,2,2,"Muestra estado vacio con CTA a catalogo","SYSTEM_PROCESS"),
                    _step(3,3,2,"Sugiere productos populares o vistos recientemente","SYSTEM_PROCESS")
                ],"step-5","exception","cart.items.length == 0")
            ]
        }
    },
    # ── CU-06: Checkout invitado ──────────────────────────────────────────────
    {
        "title": "Checkout como invitado",
        "description": "Un usuario no registrado completa la compra proporcionando email, datos de envio y pago sin necesidad de crear una cuenta. Al finalizar se ofrece crear cuenta.",
        "preconditions": ["El carrito tiene al menos 1 producto", "Los servicios de pago estan operativos"],
        "postconditions": ["Se crea el pedido asociado al email del invitado", "Se ofrece crear cuenta con datos ya ingresados"],
        "snapshot": {
            "id": "uc-6", "code": "CU-06", "title": "Checkout como invitado",
            "description": "Un usuario no registrado completa la compra proporcionando email, datos de envio y pago sin necesidad de crear una cuenta.",
            "type": "principal", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-invitado","Invitado","Comprador anonimo",crud={"create":True,"read":True,"update":False,"delete":False,"execute":True}),
                _actor(2,"role-sistema","Sistema","Backend","soporte",crud={"create":True,"read":True,"update":True,"delete":False,"execute":True}),
                _actor(3,"role-pasarela","Pasarela de Pago","Stripe/PayPal","soporte",crud={"create":True,"read":False,"update":False,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El carrito tiene al menos 1 producto con stock disponible"),_pre(2,"Los servicios de pago (Stripe/PayPal) estan operativos"),_pre(3,"El modulo de checkout esta habilitado")],
            "postconditions": [_post(1,"Se crea pedido asociado al email del invitado"),_post(2,"Se ofrece crear cuenta con un solo clic (solo agregar contrasena)")],
            "businessRules": [
                _br(1,"Email obligatorio para recibir confirmacion y tracking",expr="guest.email.isValid()",emsg="Email requerido para continuar",ecode="EMAIL_REQUIRED"),
                _br(2,"Si el email ya tiene cuenta, sugerir login antes de continuar",expr="!users.exists(guest.email)",emsg="Ya tienes cuenta. Inicia sesion para una mejor experiencia."),
                _br(3,"Validar direccion de envio contra catalogo de codigos postales",expr="postalCode.isValid(country)",emsg="Codigo postal no valido para la region seleccionada")
            ],
            "exceptions": [
                _exc(1,"Email ya tiene cuenta registrada","users.exists(email)",200,"Mostrar opcion de login inline","Ya tienes cuenta con este email. Deseas iniciar sesion?"),
                _exc(2,"Direccion fuera de zona de envio","!shippingZones.covers(address)",422,"Mostrar zonas disponibles","No realizamos envios a esta zona. Consulta nuestra cobertura.")
            ],
            "steps": [
                _step(1,1,1,"Hace clic en 'Continuar como invitado' en pantalla de checkout","USER_INPUT"),
                _step(2,2,1,"Ingresa email de contacto","USER_INPUT"),
                _step(3,3,2,"Valida formato de email y verifica si ya tiene cuenta","VALIDATION"),
                _step(4,4,1,"Completa datos de direccion de envio","USER_INPUT"),
                _step(5,5,2,"Valida direccion y calcula opciones de envio disponibles","EXTERNAL_CALL"),
                _step(6,6,1,"Selecciona metodo de envio y revisa resumen","USER_INPUT"),
                _step(7,7,1,"Procede al pago (ver CU-07)","USER_INPUT"),
                _step(8,8,2,"Crea pedido con user_id=null y email del invitado","DB_OPERATION"),
                _step(9,9,2,"Muestra confirmacion y ofrece crear cuenta","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Invitado decide registrarse post-compra",[
                    _step(1,1,1,"Hace clic en 'Crear cuenta' en pagina de confirmacion","USER_INPUT"),
                    _step(2,2,1,"Define contrasena (email y datos ya estan pre-llenados)","USER_INPUT"),
                    _step(3,3,2,"Crea usuario y asocia pedido al nuevo user_id","DB_OPERATION"),
                    _step(4,4,2,"Envia email de bienvenida","NOTIFICATION")
                ],"step-9","alternative","Invitado acepta crear cuenta")
            ]
        }
    },
    # ── CU-07: Pago con tarjeta ───────────────────────────────────────────────
    {
        "title": "Pago con tarjeta de credito/debito",
        "description": "El usuario realiza el pago de su pedido con tarjeta de credito o debito a traves de Stripe. El formulario usa Stripe Elements (iframe) para cumplir PCI DSS. Soporta 3D Secure cuando el banco lo requiere.",
        "preconditions": ["El pedido tiene monto total > 0", "Stripe esta configurado y operativo"],
        "postconditions": ["El pago se registra como completado o pendiente de 3DS", "El pedido cambia a estado 'confirmed'"],
        "snapshot": {
            "id": "uc-7", "code": "CU-07", "title": "Pago con tarjeta de credito/debito",
            "description": "El usuario realiza el pago con tarjeta via Stripe Elements con soporte 3D Secure.",
            "type": "principal", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-cliente","Comprador","Cliente con tarjeta",crud={"create":True,"read":True,"update":False,"delete":False,"execute":True}),
                _actor(2,"role-sistema","Sistema","Backend API","soporte",crud={"create":True,"read":True,"update":True,"delete":False,"execute":True}),
                _actor(3,"role-pasarela","Stripe","Pasarela de pagos","soporte",crud={"create":True,"read":False,"update":True,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El pedido tiene un monto total mayor a $0"),_pre(2,"Stripe esta configurado con API keys validas"),_pre(3,"El usuario ha completado datos de envio")],
            "postconditions": [_post(1,"El pago se registra en tabla payments con gateway_transaction_id"),_post(2,"El pedido cambia a estado 'confirmed' y payment_status='paid'")],
            "businessRules": [
                _br(1,"Nunca almacenar datos de tarjeta en nuestros servidores",expr="cardData.storedLocally == false",emsg="Violacion PCI: datos de tarjeta no deben almacenarse",ecode="PCI_VIOLATION"),
                _br(2,"3D Secure obligatorio para transacciones > $5,000 MXN",expr="amount > 5000 => require3DS",emsg="Autenticacion 3D Secure requerida"),
                _br(3,"Reintentos de pago limitados a 3 por sesion de checkout",expr="payment_attempts < 3",emsg="Demasiados intentos. Intente con otro metodo de pago.",ecode="MAX_RETRIES")
            ],
            "exceptions": [
                _exc(1,"Tarjeta declinada por fondos insuficientes","stripe.error.code == 'insufficient_funds'",402,"Sugerir otro metodo de pago","Tu tarjeta fue declinada por fondos insuficientes. Intenta con otra tarjeta."),
                _exc(2,"3D Secure falla o es cancelado","stripe.paymentIntent.status == 'requires_action' && cancelled",402,"Ofrecer reintento o metodo alternativo","La autenticacion 3D Secure fallo. Intenta de nuevo."),
                _exc(3,"Error de comunicacion con Stripe","stripe.timeout || stripe.status >= 500",503,"Reintentar en 5 segundos (max 3 veces)","Error temporal en el procesamiento. Reintentando...")
            ],
            "steps": [
                _step(1,1,1,"Selecciona 'Pagar con tarjeta' como metodo de pago","USER_INPUT"),
                _step(2,2,2,"Carga Stripe Elements iframe con formulario de tarjeta","SYSTEM_PROCESS"),
                _step(3,3,1,"Ingresa datos de tarjeta en el iframe seguro de Stripe","USER_INPUT"),
                _step(4,4,2,"Crea PaymentIntent en Stripe con monto y moneda","EXTERNAL_CALL"),
                _step(5,5,3,"Tokeniza datos de tarjeta y confirma PaymentIntent","EXTERNAL_CALL"),
                _step(6,6,3,"Verifica si requiere 3D Secure","VALIDATION"),
                _step(7,7,2,"Registra pago exitoso en tabla payments","DB_OPERATION"),
                _step(8,8,2,"Actualiza estado del pedido a 'confirmed'","DB_OPERATION"),
                _step(9,9,2,"Muestra pagina de confirmacion de compra","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Flujo 3D Secure",[
                    _step(1,1,3,"Banco requiere autenticacion adicional (3DS)","VALIDATION"),
                    _step(2,2,2,"Muestra modal/redirect de verificacion del banco","SYSTEM_PROCESS"),
                    _step(3,3,1,"Completa verificacion en portal del banco","USER_INPUT"),
                    _step(4,4,3,"Confirma autenticacion y procesa pago","EXTERNAL_CALL"),
                    _step(5,5,2,"Continua con paso 7 del flujo principal","SYSTEM_PROCESS")
                ],"step-6","exception","paymentIntent.status == 'requires_action'")
            ]
        }
    },
    # ── CU-08: Seguimiento de pedido ──────────────────────────────────────────
    {
        "title": "Seguimiento de pedido",
        "description": "El cliente consulta el estado de su pedido en un timeline visual que muestra cada etapa: confirmado, en preparacion, enviado, en camino, entregado. Incluye numero de guia con enlace al tracker de la paqueteria.",
        "preconditions": ["El usuario tiene al menos 1 pedido", "El pedido tiene estado 'confirmed' o posterior"],
        "postconditions": ["Se muestra timeline con estado actual y fechas de cada transicion"],
        "snapshot": {
            "id": "uc-8", "code": "CU-08", "title": "Seguimiento de pedido",
            "description": "El cliente consulta el estado de su pedido en un timeline visual con tracking de paqueteria.",
            "type": "secundario", "priority": "media", "status": "approved",
            "actors": [
                _actor(1,"role-cliente","Cliente","Comprador",crud={"create":False,"read":True,"update":False,"delete":False,"execute":False}),
                _actor(2,"role-sistema","Sistema","Backend","soporte",crud={"create":False,"read":True,"update":True,"delete":False,"execute":True}),
                _actor(3,"role-paqueteria","Paqueteria","DHL/FedEx/Estafeta","soporte",crud={"create":False,"read":True,"update":False,"delete":False,"execute":False})
            ],
            "preconditions": [_pre(1,"El cliente tiene al menos 1 pedido en estado confirmed o posterior"),_pre(2,"Si el pedido esta enviado, existe numero de guia asociado")],
            "postconditions": [_post(1,"Se muestra timeline con estado actual y fechas de transicion"),_post(2,"El enlace de tracking redirige al portal de la paqueteria")],
            "businessRules": [
                _br(1,"El timeline muestra todos los estados aunque no se hayan alcanzado",expr="timeline.showAll == true"),
                _br(2,"Tracking se actualiza automaticamente via webhooks cada 2h",expr="tracking.autoRefresh == true && interval == '2h'"),
                _br(3,"Pedidos no entregados en 15 dias activan alerta al equipo de soporte",expr="daysSinceShipped > 15 => alertSupport()")
            ],
            "exceptions": [
                _exc(1,"Numero de guia aun no asignado","shipment.tracking_number == null",200,"Mostrar mensaje de espera","Tu pedido esta en preparacion. El numero de guia se asignara pronto."),
                _exc(2,"Error al consultar API de paqueteria","carrier_api.timeout",200,"Mostrar ultimo estado conocido","No pudimos actualizar el tracking. Ultimo estado conocido: {lastStatus}")
            ],
            "steps": [
                _step(1,1,1,"Accede a 'Mis pedidos' desde su perfil","USER_INPUT"),
                _step(2,2,2,"Muestra lista de pedidos con estado resumido","DB_OPERATION"),
                _step(3,3,1,"Selecciona un pedido para ver detalle","USER_INPUT"),
                _step(4,4,2,"Carga detalle del pedido y timeline de estados","DB_OPERATION"),
                _step(5,5,2,"Si tiene tracking, consulta API de paqueteria para estado actual","EXTERNAL_CALL"),
                _step(6,6,2,"Renderiza timeline visual con estado actual destacado","SYSTEM_PROCESS"),
                _step(7,7,1,"Hace clic en numero de guia para ir al tracker externo","USER_INPUT")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Consulta por invitado con email + order number",[
                    _step(1,1,1,"Accede a pagina publica de tracking","USER_INPUT"),
                    _step(2,2,1,"Ingresa numero de pedido y email","USER_INPUT"),
                    _step(3,3,2,"Valida combinacion y muestra timeline","VALIDATION")
                ],"step-1","alternative","Usuario no tiene cuenta (compro como invitado)")
            ]
        }
    },
    # ── CU-09: Escribir resena ────────────────────────────────────────────────
    {
        "title": "Escribir resena de producto",
        "description": "Un cliente que compro un producto deja una resena con valoracion de 1-5 estrellas, titulo y comentario. Las resenas de compra verificada reciben un badge especial.",
        "preconditions": ["El usuario ha comprado el producto y el pedido fue entregado", "El usuario no ha dejado resena previa para este producto"],
        "postconditions": ["La resena se guarda como pendiente de moderacion", "La valoracion promedio se recalcula"],
        "snapshot": {
            "id": "uc-9", "code": "CU-09", "title": "Escribir resena de producto",
            "description": "Un cliente deja una resena con estrellas y comentario tras recibir un producto.",
            "type": "secundario", "priority": "media", "status": "approved",
            "actors": [
                _actor(1,"role-cliente","Cliente verificado","Comprador con pedido entregado",crud={"create":True,"read":True,"update":True,"delete":True,"execute":False}),
                _actor(2,"role-sistema","Sistema","Backend","soporte",crud={"create":True,"read":True,"update":True,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El usuario tiene un pedido entregado que incluye este producto"),_pre(2,"No existe resena previa del mismo usuario para este producto")],
            "postconditions": [_post(1,"La resena se guarda con estado pending (moderacion)"),_post(2,"La valoracion promedio del producto se recalcula al aprobar")],
            "businessRules": [
                _br(1,"Solo 1 resena por usuario por producto",expr="!reviews.exists(userId, productId)",emsg="Ya dejaste una resena para este producto"),
                _br(2,"Resenas de compra verificada reciben badge 'Compra Verificada'",expr="order.items.includes(productId) => badge='verified'"),
                _br(3,"Texto de resena minimo 20 caracteres",expr="review.comment.length >= 20",emsg="Tu resena debe tener al menos 20 caracteres")
            ],
            "exceptions": [
                _exc(1,"Intento de resena sin compra verificada","!orders.hasPurchased(userId, productId)",403,"Deshabilitar formulario de resena","Solo puedes opinar sobre productos que hayas comprado."),
                _exc(2,"Contenido inapropiado detectado","contentFilter.flagged(comment)",422,"Solicitar revision del texto","Tu resena contiene contenido que no cumple nuestras politicas.")
            ],
            "steps": [
                _step(1,1,1,"Accede a la pagina de producto comprado y hace clic en 'Dejar resena'","USER_INPUT"),
                _step(2,2,2,"Valida que el usuario tiene compra verificada del producto","VALIDATION"),
                _step(3,3,2,"Muestra formulario: estrellas (1-5), titulo, comentario","SYSTEM_PROCESS"),
                _step(4,4,1,"Selecciona valoracion en estrellas y escribe comentario","USER_INPUT"),
                _step(5,5,2,"Valida longitud minima y filtro de contenido","VALIDATION"),
                _step(6,6,2,"Guarda resena con estado 'pending' y badge si aplica","DB_OPERATION"),
                _step(7,7,2,"Muestra confirmacion: 'Gracias! Tu resena sera revisada'","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Editar resena existente",[
                    _step(1,1,1,"Hace clic en 'Editar' en su resena publicada","USER_INPUT"),
                    _step(2,2,2,"Carga resena existente en formulario editable","SYSTEM_PROCESS"),
                    _step(3,3,1,"Modifica estrellas, titulo o comentario","USER_INPUT"),
                    _step(4,4,2,"Actualiza resena y la pone en estado 'pending' nuevamente","DB_OPERATION")
                ],"step-1","alternative","El usuario ya tiene resena y quiere editarla")
            ]
        }
    },
    # ── CU-10: Wishlist ───────────────────────────────────────────────────────
    {
        "title": "Gestion de wishlist (lista de deseos)",
        "description": "El usuario registrado guarda productos en sus listas de deseos para comprar despues. Puede crear multiples listas, hacerlas publicas (compartibles por URL) y recibir notificaciones de cambio de precio.",
        "preconditions": ["El usuario esta autenticado", "El producto existe y esta activo"],
        "postconditions": ["El producto se agrega a la wishlist seleccionada", "Se configura alerta de precio si el usuario lo solicita"],
        "snapshot": {
            "id": "uc-10", "code": "CU-10", "title": "Gestion de wishlist (lista de deseos)",
            "description": "El usuario guarda productos en wishlists personalizadas con opcion de compartir y alertas de precio.",
            "type": "secundario", "priority": "baja", "status": "review",
            "actors": [
                _actor(1,"role-cliente","Cliente","Usuario registrado",crud={"create":True,"read":True,"update":True,"delete":True,"execute":False}),
                _actor(2,"role-sistema","Sistema","Backend","soporte",crud={"create":True,"read":True,"update":True,"delete":True,"execute":True})
            ],
            "preconditions": [_pre(1,"El usuario esta autenticado en el sistema"),_pre(2,"El producto a agregar esta activo en el catalogo")],
            "postconditions": [_post(1,"El producto se agrega a la wishlist seleccionada"),_post(2,"Se activa monitoreo de precio para alertas por email")],
            "businessRules": [
                _br(1,"Maximo 5 wishlists por usuario",expr="user.wishlists.count <= 5",emsg="Has alcanzado el maximo de listas permitidas"),
                _br(2,"Maximo 50 productos por wishlist",expr="wishlist.items.count <= 50",emsg="Esta lista esta llena. Crea una nueva."),
                _br(3,"Alerta de precio se envia cuando baja >10% del precio al agregar",expr="currentPrice < addedPrice * 0.9 => sendAlert()")
            ],
            "exceptions": [
                _exc(1,"Producto ya esta en la wishlist","wishlist.items.includes(productId)",409,"Mostrar mensaje informativo","Este producto ya esta en tu lista."),
                _exc(2,"Usuario no autenticado intenta agregar","!isAuthenticated",401,"Redirigir a login con redirect back","Inicia sesion para guardar en tu lista de deseos.")
            ],
            "steps": [
                _step(1,1,1,"Hace clic en icono de corazon en producto (catalogo o detalle)","USER_INPUT"),
                _step(2,2,2,"Verifica autenticacion del usuario","VALIDATION"),
                _step(3,3,2,"Muestra selector de wishlist si tiene multiples listas","SYSTEM_PROCESS"),
                _step(4,4,1,"Selecciona wishlist destino (o crea nueva)","USER_INPUT"),
                _step(5,5,2,"Agrega producto a la wishlist y registra precio actual","DB_OPERATION"),
                _step(6,6,2,"Muestra confirmacion: 'Agregado a [nombre lista]'","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Compartir wishlist publica",[
                    _step(1,1,1,"Accede a sus wishlists y activa 'Hacer publica'","USER_INPUT"),
                    _step(2,2,2,"Genera URL publica unica para la lista","SYSTEM_PROCESS"),
                    _step(3,3,1,"Comparte URL por redes sociales, email o mensajeria","USER_INPUT")
                ],"step-4","alternative","Usuario quiere compartir su lista")
            ]
        }
    },
    # ── CU-11: Gestion inventario/variantes (Admin) ──────────────────────────
    {
        "title": "Gestion de inventario y variantes (Admin)",
        "description": "El administrador gestiona el inventario de productos y sus variantes. Puede crear variantes con atributos (talla, color, material), asignar stock independiente, configurar alertas de bajo stock, y ver historial de movimientos.",
        "preconditions": ["El admin esta autenticado con permisos de gestion de productos", "El producto existe en el sistema"],
        "postconditions": ["El inventario y variantes quedan actualizados", "Se registra movimiento en audit log"],
        "snapshot": {
            "id": "uc-11", "code": "CU-11", "title": "Gestion de inventario y variantes (Admin)",
            "description": "El admin gestiona inventario y variantes de productos con stock independiente y alertas.",
            "type": "administracion", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-admin","Administrador","Admin con permisos de producto",crud={"create":True,"read":True,"update":True,"delete":True,"execute":True}),
                _actor(2,"role-sistema","Sistema","Backend + DB","soporte",crud={"create":True,"read":True,"update":True,"delete":True,"execute":True})
            ],
            "preconditions": [_pre(1,"El admin tiene rol con permiso 'products.manage'"),_pre(2,"El producto base ya existe en el catalogo")],
            "postconditions": [_post(1,"Las variantes y stock quedan actualizados en tiempo real"),_post(2,"Se registra cada cambio de inventario en audit_logs")],
            "businessRules": [
                _br(1,"SKU de variante debe ser unico en todo el catalogo",expr="!variants.exists(sku)",emsg="Este SKU ya esta en uso",ecode="DUPLICATE_SKU"),
                _br(2,"Alerta de bajo stock cuando qty < low_stock_threshold",expr="variant.stock < product.low_stock_threshold => alertAdmin()"),
                _br(3,"No se puede eliminar variante con stock > 0 o pedidos pendientes",expr="variant.stock == 0 && !variant.hasPendingOrders()",emsg="No se puede eliminar variante con stock o pedidos pendientes")
            ],
            "exceptions": [
                _exc(1,"SKU duplicado","variants.exists(sku)",409,"Sugerir SKU alternativo","El SKU ya existe. Se sugiere: {suggestedSku}"),
                _exc(2,"Intento de stock negativo","newStock < 0",422,"Establecer en 0","El stock no puede ser negativo. Se establecio en 0.")
            ],
            "steps": [
                _step(1,1,1,"Accede al panel de admin > Productos > Selecciona producto","USER_INPUT"),
                _step(2,2,2,"Carga producto con todas sus variantes y stock actual","DB_OPERATION"),
                _step(3,3,1,"Crea nueva variante: define atributos, SKU, precio, stock","USER_INPUT"),
                _step(4,4,2,"Valida unicidad de SKU y datos requeridos","VALIDATION"),
                _step(5,5,2,"Guarda variante y actualiza indices de busqueda","DB_OPERATION"),
                _step(6,6,1,"Ajusta stock de variantes existentes (entrada/salida)","USER_INPUT"),
                _step(7,7,2,"Registra movimiento de inventario en audit log","DB_OPERATION"),
                _step(8,8,2,"Verifica alertas de bajo stock y notifica si aplica","NOTIFICATION")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Ajuste masivo de stock via CSV",[
                    _step(1,1,1,"Sube archivo CSV con columnas: SKU, ajuste, motivo","USER_INPUT"),
                    _step(2,2,2,"Valida formato y SKUs existentes","VALIDATION"),
                    _step(3,3,2,"Aplica ajustes en batch y genera reporte","DB_OPERATION"),
                    _step(4,4,2,"Registra todos los movimientos en audit log","DB_OPERATION")
                ],"step-6","alternative","Admin necesita ajustar muchas variantes")
            ]
        }
    },
    # ── CU-12: Promociones y cupones (Admin) ──────────────────────────────────
    {
        "title": "Gestion de promociones y cupones (Admin)",
        "description": "El administrador crea y gestiona promociones (porcentaje, monto fijo, 2x1, envio gratis) y genera cupones con codigos unicos, limites de uso y vigencia. Incluye reportes de uso y ROI por campana.",
        "preconditions": ["El admin tiene permiso de gestion de promociones", "El sistema de cupones esta habilitado"],
        "postconditions": ["La promocion/cupon queda activo segun configuracion", "Los cupones son aplicables en checkout"],
        "snapshot": {
            "id": "uc-12", "code": "CU-12", "title": "Gestion de promociones y cupones (Admin)",
            "description": "El admin crea promociones con reglas y genera cupones con limites configurables.",
            "type": "administracion", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-admin","Administrador","Admin de marketing",crud={"create":True,"read":True,"update":True,"delete":True,"execute":True}),
                _actor(2,"role-sistema","Sistema","Motor de promociones","soporte",crud={"create":True,"read":True,"update":True,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El admin tiene rol con permiso 'promotions.manage'"),_pre(2,"El modulo de promociones esta habilitado en configuracion")],
            "postconditions": [_post(1,"La promocion queda activa y aplicable en checkout"),_post(2,"Los cupones generados son validables por codigo")],
            "businessRules": [
                _br(1,"Solo 1 cupon por pedido a menos que la promocion sea stackable",expr="!order.hasCoupon() || promotion.isStackable",emsg="Ya hay un cupon aplicado a este pedido"),
                _br(2,"Descuento no puede exceder el subtotal del carrito",expr="discount <= cart.subtotal",emsg="El descuento excede el total del carrito"),
                _br(3,"Cupones expirados no son aplicables",expr="coupon.endDate > now()",emsg="Este cupon ha expirado",ecode="COUPON_EXPIRED")
            ],
            "exceptions": [
                _exc(1,"Codigo de cupon duplicado","coupons.exists(code)",409,"Generar codigo alternativo","Este codigo ya existe. Se genero: {alternativeCode}"),
                _exc(2,"Limite de uso alcanzado","coupon.usageCount >= coupon.maxUses",422,"Informar al cliente","Este cupon ya alcanzo su limite de usos.")
            ],
            "steps": [
                _step(1,1,1,"Accede a Admin > Marketing > Promociones","USER_INPUT"),
                _step(2,2,1,"Crea nueva promocion: tipo, valor, vigencia, restricciones","USER_INPUT"),
                _step(3,3,2,"Valida reglas de negocio y fechas de vigencia","VALIDATION"),
                _step(4,4,2,"Guarda promocion en base de datos","DB_OPERATION"),
                _step(5,5,1,"Genera cupones: codigo, limite de usos, vincula a promocion","USER_INPUT"),
                _step(6,6,2,"Genera codigos unicos y los asocia a la promocion","DB_OPERATION"),
                _step(7,7,2,"Muestra resumen con codigos generados y reglas activas","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Generar cupones masivos para campana",[
                    _step(1,1,1,"Selecciona 'Generar lote' e indica cantidad (ej: 10,000)","USER_INPUT"),
                    _step(2,2,2,"Genera codigos unicos en batch (prefijo + aleatorio)","SYSTEM_PROCESS"),
                    _step(3,3,2,"Exporta lista de codigos como CSV descargable","SYSTEM_PROCESS"),
                    _step(4,4,2,"Registra campana en audit log","DB_OPERATION")
                ],"step-5","alternative","Admin necesita cupones para campana masiva")
            ]
        }
    },
    # ── CU-13: Importacion CSV (Admin) ────────────────────────────────────────
    {
        "title": "Importacion masiva CSV de productos (Admin)",
        "description": "El administrador importa productos masivamente desde un archivo CSV o Excel. El sistema valida formato, campos requeridos, SKUs duplicados, y presenta reporte de errores antes de confirmar la importacion.",
        "preconditions": ["El admin tiene permiso de importacion", "El archivo tiene formato CSV o XLSX valido"],
        "postconditions": ["Los productos se crean/actualizan segun el archivo", "Se genera reporte de importacion"],
        "snapshot": {
            "id": "uc-13", "code": "CU-13", "title": "Importacion masiva CSV de productos",
            "description": "El admin importa productos desde CSV/Excel con validacion y reporte de errores.",
            "type": "administracion", "priority": "media", "status": "review",
            "actors": [
                _actor(1,"role-admin","Administrador","Admin de catalogo",crud={"create":True,"read":True,"update":True,"delete":False,"execute":True}),
                _actor(2,"role-sistema","Sistema","Import Engine","soporte",crud={"create":True,"read":True,"update":True,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El admin tiene permiso 'products.import'"),_pre(2,"El archivo CSV/XLSX tiene headers validos"),_pre(3,"El archivo no excede 10,000 filas")],
            "postconditions": [_post(1,"Los productos validos se crean o actualizan en la base de datos"),_post(2,"Se genera reporte descargable con resultados por fila")],
            "businessRules": [
                _br(1,"Maximo 10,000 filas por archivo de importacion",expr="file.rows <= 10000",emsg="El archivo excede el limite de 10,000 filas",ecode="FILE_TOO_LARGE"),
                _br(2,"SKU existente actualiza producto; SKU nuevo crea producto",expr="products.exists(sku) ? update : create"),
                _br(3,"Campos requeridos: name, sku, base_price, category_id",expr="row.hasAll(['name','sku','base_price','category_id'])",emsg="Faltan campos requeridos en fila {row}")
            ],
            "exceptions": [
                _exc(1,"Formato de archivo invalido","!['csv','xlsx'].includes(ext)",422,"Mostrar formatos aceptados","Formato no soportado. Usa CSV o XLSX."),
                _exc(2,"Error de validacion en multiples filas","errors.length > 0",422,"Mostrar reporte de errores descargable","Se encontraron {count} errores. Descarga el reporte para corregir."),
                _exc(3,"Timeout por archivo muy grande","processTime > 120s",504,"Procesar en background y notificar por email","El archivo es muy grande. Se procesara en segundo plano.")
            ],
            "steps": [
                _step(1,1,1,"Accede a Admin > Productos > Importar","USER_INPUT"),
                _step(2,2,1,"Descarga template CSV con campos y ejemplos","USER_INPUT"),
                _step(3,3,1,"Completa template y sube archivo CSV/XLSX","USER_INPUT"),
                _step(4,4,2,"Parsea archivo y valida headers requeridos","VALIDATION"),
                _step(5,5,2,"Valida cada fila: tipos de datos, SKUs, categorias","VALIDATION"),
                _step(6,6,2,"Muestra preview: X productos nuevos, Y actualizaciones, Z errores","SYSTEM_PROCESS"),
                _step(7,7,1,"Revisa preview y confirma importacion","USER_INPUT"),
                _step(8,8,2,"Ejecuta importacion en transaccion (rollback si falla)","DB_OPERATION"),
                _step(9,9,2,"Genera reporte final descargable con resultados","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Importacion con errores parciales",[
                    _step(1,1,2,"Detecta errores en algunas filas pero no todas","VALIDATION"),
                    _step(2,2,2,"Muestra opcion: importar solo validas o cancelar todo","SYSTEM_PROCESS"),
                    _step(3,3,1,"Elige importar solo filas validas","USER_INPUT"),
                    _step(4,4,2,"Importa validas y genera reporte de rechazadas","DB_OPERATION")
                ],"step-6","exception","Algunas filas tienen errores de validacion")
            ]
        }
    },
    # ── CU-14: Devoluciones/reembolso ─────────────────────────────────────────
    {
        "title": "Solicitud de devolucion/reembolso",
        "description": "El cliente solicita la devolucion de un producto dentro de los 30 dias desde la entrega. Selecciona motivo, adjunta fotos opcionales, y el admin aprueba/rechaza. El reembolso se procesa automaticamente por la via de pago original.",
        "preconditions": ["El pedido fue entregado hace menos de 30 dias", "El producto cumple politica de devolucion"],
        "postconditions": ["Se crea solicitud de devolucion en estado pendiente", "El admin es notificado para revision"],
        "snapshot": {
            "id": "uc-14", "code": "CU-14", "title": "Solicitud de devolucion/reembolso",
            "description": "El cliente solicita devolucion y el sistema procesa reembolso automatico tras aprobacion.",
            "type": "principal", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-cliente","Cliente","Comprador con pedido entregado",crud={"create":True,"read":True,"update":False,"delete":False,"execute":True}),
                _actor(2,"role-admin","Administrador","Soporte/Admin",crud={"create":False,"read":True,"update":True,"delete":False,"execute":True}),
                _actor(3,"role-pasarela","Pasarela de Pago","Stripe/PayPal","soporte",crud={"create":True,"read":False,"update":False,"delete":False,"execute":True}),
                _actor(4,"role-sistema","Sistema","Backend","soporte",crud={"create":True,"read":True,"update":True,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El pedido tiene status 'delivered' y la entrega fue hace menos de 30 dias"),_pre(2,"El producto no esta en la lista de exclusiones de devolucion"),_pre(3,"No existe solicitud de devolucion previa para este item")],
            "postconditions": [_post(1,"Se crea registro en tabla refunds con estado 'pending'"),_post(2,"El admin recibe notificacion para revisar la solicitud")],
            "businessRules": [
                _br(1,"Plazo de devolucion: 30 dias desde fecha de entrega",expr="daysSinceDelivery <= 30",emsg="El plazo de devolucion de 30 dias ha expirado",ecode="RETURN_EXPIRED"),
                _br(2,"Fotos opcionales: max 5 imagenes, max 5MB cada una",expr="photos.length <= 5 && photos.each.size <= 5MB",emsg="Maximo 5 fotos de hasta 5MB cada una"),
                _br(3,"Reembolso automatico al aprobar si monto <= $5,000 MXN",expr="refundAmount <= 5000 => autoProcess()",emsg="Reembolsos mayores a $5,000 requieren aprobacion senior"),
                _br(4,"Reembolso parcial permitido con monto configurable",expr="refundAmount <= orderItem.totalPrice")
            ],
            "exceptions": [
                _exc(1,"Plazo de devolucion expirado","daysSinceDelivery > 30",422,"Sugerir contactar soporte","El plazo de devolucion ha expirado. Contacta soporte para casos especiales."),
                _exc(2,"Error al procesar reembolso en pasarela","stripe.refund.failed",500,"Reintentar en 24h y notificar admin","Hubo un error al procesar tu reembolso. Lo resolveremos en 24-48h."),
                _exc(3,"Producto excluido de devoluciones","product.category.noReturns",422,"Informar politica","Este tipo de producto no acepta devoluciones segun nuestra politica.")
            ],
            "steps": [
                _step(1,1,1,"Accede a 'Mis pedidos' y selecciona pedido entregado","USER_INPUT"),
                _step(2,2,1,"Hace clic en 'Solicitar devolucion' en el item deseado","USER_INPUT"),
                _step(3,3,4,"Valida plazo (30 dias) y elegibilidad del producto","VALIDATION"),
                _step(4,4,1,"Selecciona motivo de devolucion del catalogo predefinido","USER_INPUT"),
                _step(5,5,1,"Adjunta fotos del producto (opcional, max 5)","USER_INPUT"),
                _step(6,6,4,"Crea solicitud de devolucion en estado 'pending'","DB_OPERATION"),
                _step(7,7,4,"Notifica al equipo de soporte/admin por email y dashboard","NOTIFICATION"),
                _step(8,8,2,"Admin revisa solicitud, fotos y motivo","USER_INPUT"),
                _step(9,9,2,"Admin aprueba o rechaza con comentarios","USER_INPUT"),
                _step(10,10,3,"Si aprobado, procesa reembolso via pasarela de pago original","EXTERNAL_CALL")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Reembolso parcial",[
                    _step(1,1,2,"Admin determina que aplica reembolso parcial","USER_INPUT"),
                    _step(2,2,2,"Ingresa monto de reembolso y justificacion","USER_INPUT"),
                    _step(3,3,4,"Registra reembolso parcial en refunds","DB_OPERATION"),
                    _step(4,4,3,"Procesa reembolso parcial en pasarela","EXTERNAL_CALL"),
                    _step(5,5,4,"Notifica al cliente con detalle del reembolso parcial","NOTIFICATION")
                ],"step-9","alternative","El producto tiene dano parcial o uso evidente")
            ]
        }
    },
    # ── CU-15: Dashboard ventas (Admin) ───────────────────────────────────────
    {
        "title": "Dashboard de ventas y analitica (Admin)",
        "description": "El administrador accede al dashboard de analitica con KPIs de ventas en tiempo real: ingresos, ticket promedio, tasa de conversion, top productos, embudo de conversion. Con filtros por periodo, categoria y segmento.",
        "preconditions": ["El admin tiene permiso de visualizacion de reportes", "Existen datos de ventas en el sistema"],
        "postconditions": ["Se muestran metricas actualizadas", "Los filtros se aplican en tiempo real"],
        "snapshot": {
            "id": "uc-15", "code": "CU-15", "title": "Dashboard de ventas y analitica (Admin)",
            "description": "Dashboard con KPIs de ventas, graficas interactivas y exportacion de reportes.",
            "type": "administracion", "priority": "alta", "status": "approved",
            "actors": [
                _actor(1,"role-admin","Administrador","Admin/Gerencia",crud={"create":False,"read":True,"update":False,"delete":False,"execute":True}),
                _actor(2,"role-sistema","Sistema","Analytics Engine","soporte",crud={"create":False,"read":True,"update":False,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El admin tiene permiso 'reports.view'"),_pre(2,"Existen al menos 1 pedido completado en el sistema")],
            "postconditions": [_post(1,"Se muestran metricas actualizadas cada 5 minutos"),_post(2,"Los filtros aplicados persisten en la sesion del admin")],
            "businessRules": [
                _br(1,"Datos se actualizan cada 5 minutos (no en tiempo real para performance)",expr="refreshInterval == 300000"),
                _br(2,"Comparativa siempre muestra periodo anterior equivalente",expr="comparison = previousPeriod(selectedRange)"),
                _br(3,"Exports limitados a 100,000 registros por descarga",expr="exportRows <= 100000",emsg="Demasiados datos. Aplica filtros para reducir.")
            ],
            "exceptions": [
                _exc(1,"Sin datos para el periodo seleccionado","results.length == 0",200,"Mostrar estado vacio con sugerencia de periodo","No hay datos de ventas para este periodo. Prueba con un rango mas amplio."),
                _exc(2,"Export timeout por volumen de datos","exportTime > 30s",504,"Enviar reporte por email","El reporte es muy grande. Lo enviaremos a tu email en minutos.")
            ],
            "steps": [
                _step(1,1,1,"Accede al panel de administracion > Dashboard","USER_INPUT"),
                _step(2,2,2,"Carga KPIs principales: ingresos, ordenes, ticket promedio, conversion","DB_OPERATION"),
                _step(3,3,2,"Renderiza graficas de ventas con comparativa vs periodo anterior","SYSTEM_PROCESS"),
                _step(4,4,1,"Aplica filtros: rango de fechas, categoria, segmento","USER_INPUT"),
                _step(5,5,2,"Recalcula metricas con filtros aplicados","DB_OPERATION"),
                _step(6,6,1,"Hace clic en 'Top 10 productos' para ver detalle","USER_INPUT"),
                _step(7,7,2,"Muestra ranking con revenue, unidades vendidas y tendencia","SYSTEM_PROCESS"),
                _step(8,8,1,"Exporta reporte a PDF o CSV","USER_INPUT"),
                _step(9,9,2,"Genera archivo descargable con los datos filtrados","SYSTEM_PROCESS")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Ver embudo de conversion detallado",[
                    _step(1,1,1,"Hace clic en widget de embudo de conversion","USER_INPUT"),
                    _step(2,2,2,"Muestra embudo: visitas > catalogo > carrito > checkout > compra","SYSTEM_PROCESS"),
                    _step(3,3,2,"Muestra tasa de abandono en cada etapa con drill-down","SYSTEM_PROCESS")
                ],"step-3","alternative","Admin quiere analizar donde se pierden clientes")
            ]
        }
    },
    # ── CU-16: Notificaciones ─────────────────────────────────────────────────
    {
        "title": "Gestion de notificaciones",
        "description": "El sistema envia notificaciones multicanal (email, push, WhatsApp) a los usuarios segun eventos del sistema. El usuario configura sus preferencias de canal por tipo de notificacion desde su perfil.",
        "preconditions": ["El usuario tiene cuenta activa", "Al menos un canal de notificacion esta configurado"],
        "postconditions": ["La notificacion se envia por los canales configurados", "Se registra en la tabla notifications"],
        "snapshot": {
            "id": "uc-16", "code": "CU-16", "title": "Gestion de notificaciones",
            "description": "Sistema de notificaciones multicanal con preferencias configurables por usuario.",
            "type": "soporte", "priority": "media", "status": "review",
            "actors": [
                _actor(1,"role-cliente","Usuario","Receptor de notificaciones",crud={"create":False,"read":True,"update":True,"delete":True,"execute":False}),
                _actor(2,"role-sistema","Sistema","Notification Engine","soporte",crud={"create":True,"read":True,"update":True,"delete":False,"execute":True}),
                _actor(3,"role-email","SendGrid","Servicio de email","soporte",crud={"create":False,"read":False,"update":False,"delete":False,"execute":True}),
                _actor(4,"role-whatsapp","Twilio WhatsApp","Servicio de mensajeria","soporte",crud={"create":False,"read":False,"update":False,"delete":False,"execute":True})
            ],
            "preconditions": [_pre(1,"El usuario tiene cuenta activa con email verificado"),_pre(2,"Al menos un servicio de notificacion (SendGrid, FCM, Twilio) esta operativo"),_pre(3,"El usuario tiene al menos un canal habilitado en preferencias")],
            "postconditions": [_post(1,"La notificacion se envia por todos los canales habilitados por el usuario"),_post(2,"Se crea registro en tabla notifications con estado y metadata")],
            "businessRules": [
                _br(1,"Notificaciones de pedido se envian siempre por email (no desactivable)",expr="notification.type == 'order' => channels.includes('email')",emsg="Las notificaciones de pedido por email no se pueden desactivar"),
                _br(2,"WhatsApp requiere template aprobado por Meta para cada tipo de mensaje",expr="whatsapp.template.isApproved(type)"),
                _br(3,"Max 3 notificaciones push por dia para evitar fatiga",expr="pushNotificationsToday < 3",emsg="Limite diario de push notifications alcanzado"),
                _br(4,"Unsubscribe link obligatorio en todos los emails comerciales",expr="email.hasUnsubscribeLink == true")
            ],
            "exceptions": [
                _exc(1,"Servicio de email no disponible","sendgrid.status >= 500",503,"Encolar y reintentar en 5 minutos","Notificacion pendiente de envio."),
                _exc(2,"WhatsApp template rechazado por Meta","twilio.error == 'template_rejected'",422,"Fallback a SMS o email","Notificacion enviada por canal alternativo."),
                _exc(3,"Token de push expirado","fcm.error == 'invalid_registration'",410,"Remover token y solicitar re-registro","Habilita notificaciones nuevamente en la app.")
            ],
            "steps": [
                _step(1,1,2,"Un evento del sistema dispara notificacion (pedido, envio, promocion)","SYSTEM_PROCESS"),
                _step(2,2,2,"Consulta preferencias de canal del usuario para este tipo de evento","DB_OPERATION"),
                _step(3,3,2,"Renderiza contenido del mensaje segun template y datos del evento","SYSTEM_PROCESS"),
                _step(4,4,3,"Envia email transaccional via SendGrid con template HTML","EXTERNAL_CALL"),
                _step(5,5,4,"Envia mensaje WhatsApp via Twilio con template aprobado","EXTERNAL_CALL"),
                _step(6,6,2,"Envia push notification via FCM","EXTERNAL_CALL"),
                _step(7,7,2,"Registra notificacion en tabla con status por canal","DB_OPERATION"),
                _step(8,8,1,"Usuario ve notificacion en su bandeja in-app y la marca como leida","USER_INPUT")
            ],
            "alternativeFlows": [
                _af(1,"AF-01","Usuario configura preferencias de notificacion",[
                    _step(1,1,1,"Accede a Perfil > Preferencias de notificacion","USER_INPUT"),
                    _step(2,2,2,"Muestra matriz: tipos de notificacion x canales disponibles","SYSTEM_PROCESS"),
                    _step(3,3,1,"Activa/desactiva canales por tipo de notificacion","USER_INPUT"),
                    _step(4,4,2,"Guarda preferencias en perfil del usuario","DB_OPERATION")
                ],"step-1","alternative","Usuario quiere personalizar sus notificaciones"),
                _af(2,"AF-02","Desuscripcion via enlace en email",[
                    _step(1,1,1,"Hace clic en 'Desuscribirse' en el footer del email","USER_INPUT"),
                    _step(2,2,2,"Desactiva canal email para ese tipo de notificacion","DB_OPERATION"),
                    _step(3,3,2,"Muestra pagina de confirmacion con opcion de reactivar","SYSTEM_PROCESS")
                ],"step-4","alternative","Usuario quiere dejar de recibir cierto tipo de emails")
            ]
        }
    }
]
