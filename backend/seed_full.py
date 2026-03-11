"""
Mega seed script — populates Project 3 (E-Commerce Platform) with ultra-realistic data.
Modules: Requirements (34), Use Cases (16), Data Model (22 tables), Flow Diagram, Audit Logs.
"""

import requests, json, sys, time

BASE = "http://127.0.0.1:8000"
PROJECT_ID = 3

# ══════════════════════════════════════════════════════════════════════════════
#  AUTH
# ══════════════════════════════════════════════════════════════════════════════

def login():
    r = requests.post(f"{BASE}/api/auth/login", json={
        "email": "test@soft-evolved.dev", "password": "test1234"
    })
    if r.status_code != 200:
        print(f"LOGIN FAILED: {r.status_code} {r.text}")
        sys.exit(1)
    token = r.json()["access_token"]
    print(f"[OK] Logged in")
    return {"Authorization": f"Bearer {token}"}

def api(method, path, headers, json_data=None, expect=None):
    r = getattr(requests, method)(f"{BASE}{path}", headers=headers, json=json_data)
    if expect and r.status_code not in (expect if isinstance(expect, list) else [expect]):
        print(f"[FAIL] {method.upper()} {path} -> {r.status_code}: {r.text[:200]}")
        return None
    return r

# ══════════════════════════════════════════════════════════════════════════════
#  DELETE EXISTING DATA
# ══════════════════════════════════════════════════════════════════════════════

def delete_existing(h):
    print("\n=== Deleting existing requirements ===")
    r = api("get", f"/api/projects/{PROJECT_ID}/requirements", h, expect=[200])
    if r:
        for req in r.json():
            api("delete", f"/api/projects/{PROJECT_ID}/requirements/{req['id']}", h, expect=[204])
            print(f"  Deleted REQ {req['id']}")

    print("\n=== Deleting existing use cases ===")
    r = api("get", f"/api/projects/{PROJECT_ID}/use-cases", h, expect=[200])
    if r:
        for uc in r.json():
            api("delete", f"/api/projects/{PROJECT_ID}/use-cases/{uc['id']}", h, expect=[204])
            print(f"  Deleted UC {uc['id']}")

# ══════════════════════════════════════════════════════════════════════════════
#  REQUIREMENTS (34)
# ══════════════════════════════════════════════════════════════════════════════

REQUIREMENTS = [
    # ── FUNCTIONAL (15) ──────────────────────────────────────────────────────
    {
        "title": "Catalogo con busqueda avanzada y filtros",
        "description": "El sistema debe permitir a los usuarios buscar productos mediante texto libre con autocompletado, y filtrar resultados por categoria, rango de precio, marca, valoracion promedio y disponibilidad. Los resultados deben paginarse y ordenarse por relevancia, precio, popularidad o fecha de publicacion.",
        "type": "funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "La busqueda por texto devuelve resultados en menos de 300ms",
            "Los filtros se combinan con logica AND y se reflejan en la URL",
            "El autocompletado sugiere hasta 8 productos tras escribir 3 caracteres",
            "La paginacion muestra 24 productos por pagina con scroll infinito opcional",
            "Los filtros activos se pueden eliminar individualmente o todos a la vez"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Carlos Mendez", "text": "Considerar Elasticsearch para indexado full-text. Meilisearch tambien es opcion.", "date": "2025-02-10"},
            {"id": "c2", "author": "Diego Fernandez", "text": "El autocompletado debe incluir thumbnail del producto para mejor UX.", "date": "2025-02-12"}
        ],
        "order_index": 1
    },
    {
        "title": "Autenticacion y registro multi-metodo",
        "description": "Implementar sistema de autenticacion con soporte para registro via email/password, Google OAuth 2.0 y Apple Sign-In. Incluir verificacion de email, recuperacion de contrasena con token temporal, y sesiones con JWT y refresh tokens.",
        "type": "funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "El registro por email requiere verificacion antes de acceder a funciones protegidas",
            "OAuth con Google y Apple completa el flujo en menos de 3 clicks",
            "Los tokens JWT expiran en 15 minutos con refresh token de 7 dias",
            "La recuperacion de contrasena envia enlace que expira en 1 hora",
            "Las sesiones concurrentes se limitan a 5 dispositivos por usuario"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Maria Lopez", "text": "Implementar rate limiting en login: max 5 intentos en 15 min.", "date": "2025-01-20"},
            {"id": "c2", "author": "Ana Garcia", "text": "Agregar tests E2E para los 3 flujos de autenticacion.", "date": "2025-01-25"}
        ],
        "order_index": 2
    },
    {
        "title": "Checkout como invitado sin registro obligatorio",
        "description": "Permitir que usuarios no registrados completen una compra proporcionando unicamente email, datos de envio y pago. Al finalizar, ofrecer opcion de crear cuenta con los datos ya ingresados. El carrito de invitado se asocia por session_id.",
        "type": "funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "Un usuario puede completar todo el checkout sin crear cuenta",
            "El email del invitado recibe confirmacion de pedido y tracking",
            "Al finalizar se ofrece crear cuenta con un solo click (password)",
            "Si el invitado ya tiene cuenta por email, se sugiere iniciar sesion"
        ],
        "dependencies": ["REQ-002"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "Critico para conversion. El 30% de abandono es por registro obligatorio.", "date": "2025-02-05"}
        ],
        "order_index": 3
    },
    {
        "title": "Carrito persistente sincronizado entre sesiones",
        "description": "El carrito de compras debe persistir entre sesiones del navegador y sincronizarse entre dispositivos cuando el usuario inicia sesion. Los carritos de invitado (por session_id) se fusionan con el carrito del usuario al autenticarse, priorizando las cantidades mas recientes.",
        "type": "funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "El carrito de invitado persiste hasta 30 dias via localStorage y cookie",
            "Al hacer login, el carrito anonimo se fusiona con el del usuario registrado",
            "Si un producto esta en ambos carritos, se conserva la cantidad mayor",
            "El carrito muestra precio actualizado si el producto cambio de precio"
        ],
        "dependencies": ["REQ-002", "REQ-003"],
        "comments": [
            {"id": "c1", "author": "Carlos Mendez", "text": "La fusion de carritos debe ser atomica para evitar race conditions.", "date": "2025-02-15"}
        ],
        "order_index": 4
    },
    {
        "title": "Integracion pasarela de pagos Stripe",
        "description": "Integrar Stripe como pasarela principal de pagos para tarjetas de credito y debito. Utilizar Stripe Elements para el formulario de pago (PCI compliance), Payment Intents API para el flujo de cobro, y webhooks para confirmar pagos asincronos y manejar disputas.",
        "type": "funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "El formulario de pago usa Stripe Elements embebido (nunca tocar datos de tarjeta)",
            "Se soportan 3D Secure para tarjetas que lo requieran",
            "Los webhooks de Stripe confirman el pago y actualizan el estado del pedido",
            "Se registra cada intento de pago en la tabla payments con gateway_response"
        ],
        "dependencies": ["REQ-003"],
        "comments": [
            {"id": "c1", "author": "Maria Lopez", "text": "Usar Stripe en modo test hasta pasar auditoria PCI.", "date": "2025-02-20"},
            {"id": "c2", "author": "Ana Garcia", "text": "Verificar manejo de pagos declinados y reintentos.", "date": "2025-02-22"}
        ],
        "order_index": 5
    },
    {
        "title": "Integracion PayPal como metodo de pago alternativo",
        "description": "Implementar PayPal Checkout SDK como segunda opcion de pago. Soportar PayPal wallet, debito/credito via PayPal, y flujo de aprobacion en popup sin salir del sitio. Los fondos se capturan al confirmar el envio.",
        "type": "funcional", "priority": "media", "status": "aprobado",
        "acceptance_criteria": [
            "El boton de PayPal aparece junto al formulario de tarjeta",
            "El popup de PayPal no redirige fuera del sitio",
            "La captura del pago se realiza al confirmar envio (authorize + capture)",
            "Reembolsos via PayPal se procesan desde el panel admin"
        ],
        "dependencies": ["REQ-005"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "PayPal representa ~25% de pagos en LatAm. Prioridad media-alta.", "date": "2025-03-01"}
        ],
        "order_index": 6
    },
    {
        "title": "Pago contra entrega y OXXO Pay",
        "description": "Ofrecer metodos de pago alternativos para el mercado mexicano: pago contra entrega (COD) con verificacion de zona de cobertura, y OXXO Pay (via Stripe) que genera un voucher con codigo de barras para pago en tiendas OXXO con vencimiento a 72 horas.",
        "type": "funcional", "priority": "media", "status": "en-revision",
        "acceptance_criteria": [
            "OXXO Pay genera un voucher PDF con codigo de barras unico",
            "El voucher expira en 72 horas y se notifica al usuario 24h antes",
            "Pago contra entrega solo disponible en codigos postales configurados",
            "El pedido COD se marca como pendiente de pago hasta la entrega"
        ],
        "dependencies": ["REQ-005"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "OXXO Pay cubre 40% del mercado sin tarjeta en Mexico.", "date": "2025-03-05"}
        ],
        "order_index": 7
    },
    {
        "title": "Meses sin intereses (MSI) con tarjetas participantes",
        "description": "Implementar opcion de meses sin intereses (3, 6, 9, 12 MSI) en pagos con tarjeta de credito. Las opciones disponibles dependen del banco emisor y el monto minimo. La configuracion de bancos y plazos es administrable desde el panel.",
        "type": "funcional", "priority": "baja", "status": "en-revision",
        "acceptance_criteria": [
            "Las opciones MSI se muestran solo si el monto supera el minimo configurado",
            "El BIN de la tarjeta determina las opciones disponibles por banco",
            "El costo financiero de MSI se absorbe o traslada segun configuracion",
            "El resumen de compra muestra el desglose de pagos mensuales"
        ],
        "dependencies": ["REQ-005"],
        "comments": [
            {"id": "c1", "author": "Maria Lopez", "text": "Stripe soporta installments para Mexico. Revisar documentacion.", "date": "2025-03-10"}
        ],
        "order_index": 8
    },
    {
        "title": "Variantes de producto con inventario independiente",
        "description": "Soportar variantes de producto (talla, color, material, etc.) con SKU, precio y stock independientes por variante. Cada variante puede tener imagenes propias. El inventario se descuenta por variante seleccionada, no por producto base.",
        "type": "funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "Cada variante tiene SKU unico, precio modificador y stock independiente",
            "La seleccion de variante actualiza precio, stock y galeria de imagenes",
            "Variantes sin stock muestran 'Agotado' y no se pueden agregar al carrito",
            "El admin puede crear hasta 100 variantes por producto"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Diego Fernandez", "text": "UI de selector de variantes: chips para color, dropdown para talla.", "date": "2025-02-08"}
        ],
        "order_index": 9
    },
    {
        "title": "Sistema de resenas y valoraciones verificadas",
        "description": "Los usuarios que hayan comprado un producto pueden dejar una resena con valoracion de 1-5 estrellas, titulo y comentario. Las resenas de compra verificada se destacan. Incluir sistema de votos 'util' y moderacion por admin.",
        "type": "funcional", "priority": "media", "status": "aprobado",
        "acceptance_criteria": [
            "Solo usuarios con compra verificada del producto pueden dejar resena",
            "La valoracion promedio se recalcula en tiempo real al agregar/editar resena",
            "Las resenas incluyen badge 'Compra Verificada' cuando aplica",
            "El admin puede aprobar, rechazar o eliminar resenas desde el panel",
            "Los usuarios pueden marcar resenas como 'util' (max 1 voto por usuario)"
        ],
        "dependencies": ["REQ-002"],
        "comments": [
            {"id": "c1", "author": "Ana Garcia", "text": "Prevenir resenas duplicadas del mismo usuario para el mismo producto.", "date": "2025-03-12"}
        ],
        "order_index": 10
    },
    {
        "title": "Lista de deseos (wishlist) con compartir publico",
        "description": "Los usuarios registrados pueden guardar productos en una o multiples listas de deseos. Las listas pueden ser publicas (compartibles por URL) o privadas. Incluir notificacion cuando un producto de la wishlist baje de precio o vuelva a tener stock.",
        "type": "funcional", "priority": "baja", "status": "en-revision",
        "acceptance_criteria": [
            "El usuario puede crear multiples wishlists con nombres personalizados",
            "Las wishlists publicas son accesibles por URL amigable sin login",
            "Se envia email cuando un producto en wishlist baja de precio >10%",
            "Agregar a wishlist esta disponible en catalogo y detalle de producto"
        ],
        "dependencies": ["REQ-002", "REQ-013"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "Feature ideal para campanas de email marketing y retargeting.", "date": "2025-03-15"}
        ],
        "order_index": 11
    },
    {
        "title": "Seguimiento de pedidos en tiempo real",
        "description": "Los clientes pueden ver el estado de sus pedidos en un timeline visual que muestra: confirmado, en preparacion, enviado, en camino, entregado. Integrar con APIs de paqueterias (DHL, FedEx, Estafeta) para tracking automatico. Notificar cada cambio de estado.",
        "type": "funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "El timeline visual muestra todos los estados con fecha/hora de cada transicion",
            "El numero de guia enlaza al tracker de la paqueteria correspondiente",
            "Se envia notificacion push y email en cada cambio de estado",
            "Los pedidos entregados solicitan confirmacion de recepcion al cliente"
        ],
        "dependencies": ["REQ-013"],
        "comments": [
            {"id": "c1", "author": "Carlos Mendez", "text": "Usar webhooks de las paqueterias para actualizar estado automaticamente.", "date": "2025-03-01"},
            {"id": "c2", "author": "Diego Fernandez", "text": "El timeline debe ser responsive y mostrar bien en mobile.", "date": "2025-03-03"}
        ],
        "order_index": 12
    },
    {
        "title": "Notificaciones multicanal (email, push, WhatsApp)",
        "description": "Sistema de notificaciones con soporte para multiples canales: email transaccional (SendGrid), push notifications (FCM), y WhatsApp Business API (Twilio). El usuario puede configurar que canales prefiere para cada tipo de notificacion desde su perfil.",
        "type": "funcional", "priority": "alta", "status": "en-revision",
        "acceptance_criteria": [
            "Cada tipo de notificacion (pedido, promocion, sistema) es configurable por canal",
            "Los emails usan templates HTML responsivos con el branding de la tienda",
            "Push notifications funcionan en PWA y apps nativas",
            "WhatsApp envia confirmacion de pedido y tracking con template aprobado por Meta"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Maria Lopez", "text": "Implementar cola de mensajes (Redis/RabbitMQ) para desacoplar envios.", "date": "2025-02-28"},
            {"id": "c2", "author": "Roberto Sanchez", "text": "WhatsApp tiene tasa de apertura del 98%. Priorizar este canal.", "date": "2025-03-02"}
        ],
        "order_index": 13
    },
    {
        "title": "Panel de administracion con RBAC",
        "description": "Dashboard administrativo con control de acceso basado en roles (RBAC). Roles predefinidos: Super Admin, Admin, Editor, Soporte. Cada rol tiene permisos granulares sobre modulos (productos, pedidos, usuarios, reportes). Incluir audit trail de todas las acciones administrativas.",
        "type": "funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "Existen al menos 4 roles con permisos diferenciados",
            "Los permisos se asignan por modulo y accion (CRUD + export)",
            "Cada accion administrativa se registra en el audit log con usuario, IP y timestamp",
            "El Super Admin puede crear/editar roles personalizados"
        ],
        "dependencies": ["REQ-002"],
        "comments": [
            {"id": "c1", "author": "Carlos Mendez", "text": "RBAC via middleware que valida permisos en cada endpoint.", "date": "2025-02-18"}
        ],
        "order_index": 14
    },
    {
        "title": "Sistema de devoluciones y reembolsos automatizado",
        "description": "Flujo completo de devolucion: el cliente solicita devolucion seleccionando motivo y adjuntando fotos opcionales. El sistema valida politica de devolucion (30 dias, producto no usado). El admin aprueba/rechaza y el reembolso se procesa automaticamente por la misma via de pago original.",
        "type": "funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "El cliente puede solicitar devolucion dentro de los 30 dias desde la entrega",
            "Se requiere seleccionar motivo de devolucion de un catalogo predefinido",
            "Fotos opcionales del producto se suben a storage (max 5, max 5MB cada una)",
            "El reembolso aprobado se procesa automaticamente via Stripe/PayPal en 5-10 dias habiles",
            "El admin puede aprobar reembolso parcial (monto configurable)"
        ],
        "dependencies": ["REQ-005", "REQ-006", "REQ-014"],
        "comments": [
            {"id": "c1", "author": "Ana Garcia", "text": "Agregar tests para flujo completo: solicitud -> aprobacion -> reembolso.", "date": "2025-03-20"},
            {"id": "c2", "author": "Roberto Sanchez", "text": "Politica de devolucion configurable por categoria de producto.", "date": "2025-03-22"}
        ],
        "order_index": 15
    },

    # ── NON-FUNCTIONAL (5) ──────────────────────────────────────────────────
    {
        "title": "Rendimiento API: <500ms P95, <200ms P50",
        "description": "Todos los endpoints de la API deben responder en menos de 500ms en el percentil 95 y menos de 200ms en el percentil 50 bajo carga normal (hasta 500 req/s). Las consultas a base de datos no deben exceder 100ms. Implementar cache con Redis para endpoints de lectura frecuente.",
        "type": "no-funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "Load test con k6 confirma P95 < 500ms y P50 < 200ms a 500 req/s",
            "Queries a DB monitoreadas via slow query log (umbral: 100ms)",
            "Endpoints de catalogo y detalle de producto cacheados en Redis (TTL 5min)",
            "Dashboard de metricas APM con alertas automaticas si P95 > 500ms"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Carlos Mendez", "text": "Configurar k6 en CI para regression testing de performance.", "date": "2025-02-25"}
        ],
        "order_index": 16
    },
    {
        "title": "Disponibilidad 99.9% con failover automatico",
        "description": "La plataforma debe garantizar un SLA de 99.9% de disponibilidad (maximo 8.76 horas de downtime al ano). Implementar health checks, auto-scaling horizontal, y failover automatico entre zonas de disponibilidad. Base de datos con replica de lectura y failover automatico.",
        "type": "no-funcional", "priority": "alta", "status": "en-revision",
        "acceptance_criteria": [
            "Health check endpoint /health responde en <50ms",
            "Auto-scaling activa nueva instancia si CPU > 70% por 3 minutos",
            "Failover de base de datos completa en <30 segundos",
            "Uptime monitoreado con alertas a PagerDuty si disponibilidad < 99.9%"
        ],
        "dependencies": ["REQ-022"],
        "comments": [
            {"id": "c1", "author": "Maria Lopez", "text": "Evaluar AWS RDS Multi-AZ vs Aurora para failover automatico.", "date": "2025-03-08"}
        ],
        "order_index": 17
    },
    {
        "title": "Soporte para 1000 usuarios concurrentes",
        "description": "La arquitectura debe soportar al menos 1,000 usuarios concurrentes sin degradacion perceptible del rendimiento. Incluir connection pooling, cache distribuido, y CDN para assets estaticos. Realizar pruebas de estres periodicas.",
        "type": "no-funcional", "priority": "media", "status": "aprobado",
        "acceptance_criteria": [
            "Prueba de carga con 1000 virtual users mantiene P95 < 1s",
            "Connection pool de DB configurado con min 20, max 100 conexiones",
            "Assets estaticos servidos via CDN (CloudFront) con cache 1 anio",
            "WebSockets soportan 1000 conexiones simultanias sin memory leak"
        ],
        "dependencies": ["REQ-016"],
        "comments": [
            {"id": "c1", "author": "Carlos Mendez", "text": "Usar Locust o k6 para simular patrones de trafico realistas.", "date": "2025-03-10"}
        ],
        "order_index": 18
    },
    {
        "title": "Accesibilidad WCAG 2.1 nivel AA",
        "description": "Toda la interfaz de usuario debe cumplir con los criterios de conformidad de WCAG 2.1 nivel AA. Esto incluye navegacion por teclado, lectores de pantalla, contraste de colores, textos alternativos, y formularios accesibles.",
        "type": "no-funcional", "priority": "media", "status": "en-revision",
        "acceptance_criteria": [
            "Auditoria Lighthouse accesibilidad >= 90 en todas las paginas",
            "Navegacion completa posible solo con teclado (tab, enter, escape)",
            "Todas las imagenes tienen alt text descriptivo",
            "Contraste de texto cumple ratio minimo 4.5:1 (AA)"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Diego Fernandez", "text": "Integrar axe-core en tests E2E para validacion automatica.", "date": "2025-03-15"}
        ],
        "order_index": 19
    },
    {
        "title": "Cumplimiento PCI DSS con tokenizacion",
        "description": "Nunca almacenar datos sensibles de tarjeta en nuestros servidores. Toda la captura de datos de pago se realiza via Stripe Elements (iframe aislado). Implementar tokenizacion para pagos recurrentes. Cumplir con SAQ-A de PCI DSS.",
        "type": "no-funcional", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "Cero datos de tarjeta transitan por nuestros servidores (validar con pentest)",
            "Stripe Elements se carga en iframe aislado con CSP restrictivo",
            "Tokens de pago almacenados encriptados (AES-256) para pagos recurrentes",
            "Auditoria PCI SAQ-A completada y documentada anualmente"
        ],
        "dependencies": ["REQ-005"],
        "comments": [
            {"id": "c1", "author": "Maria Lopez", "text": "Stripe Elements nos mantiene en scope SAQ-A (minimo).", "date": "2025-02-28"}
        ],
        "order_index": 20
    },

    # ── TECHNICAL (5) ────────────────────────────────────────────────────────
    {
        "title": "REST API versionada con OpenAPI 3.0",
        "description": "Disenar API REST con versionado en URL (/api/v1/, /api/v2/). Generar documentacion OpenAPI 3.0 automatica con FastAPI. Implementar rate limiting por IP y por API key. Respuestas estandarizadas con codigos HTTP correctos y mensajes de error consistentes.",
        "type": "tecnico", "priority": "alta", "status": "implementado",
        "acceptance_criteria": [
            "Todos los endpoints documentados en /docs con ejemplos de request/response",
            "Rate limiting: 100 req/min por IP, 1000 req/min por API key autenticada",
            "Respuestas de error siguen formato {detail, code, errors[]} consistente",
            "Versionado permite deprecar v1 sin romper clientes existentes"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Carlos Mendez", "text": "FastAPI genera OpenAPI automaticamente. Agregar examples en schemas.", "date": "2025-01-15"}
        ],
        "order_index": 21
    },
    {
        "title": "Infraestructura containerizada Docker + Kubernetes",
        "description": "Toda la aplicacion corre en contenedores Docker. Docker Compose para entorno de desarrollo local (app, db, redis, mailhog). Kubernetes con Helm charts para produccion y staging. Imagenes multi-stage para reducir tamano.",
        "type": "tecnico", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "docker-compose up levanta todo el entorno de desarrollo en <2 minutos",
            "Imagenes Docker multi-stage: builder stage + runtime stage (<200MB final)",
            "Helm chart parametrizable para staging y produccion",
            "Secretos gestionados via Kubernetes Secrets (no hardcoded)"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Maria Lopez", "text": "Usar distroless como base image para produccion.", "date": "2025-02-01"}
        ],
        "order_index": 22
    },
    {
        "title": "CI/CD pipeline con GitHub Actions",
        "description": "Pipeline automatizado: lint (ruff + eslint), unit tests (pytest + vitest), build Docker, push a registry, deploy a staging automatico en PR merge, deploy a produccion con aprobacion manual. Incluir SAST con Snyk y analisis de cobertura.",
        "type": "tecnico", "priority": "alta", "status": "implementado",
        "acceptance_criteria": [
            "PR no se puede mergear sin pasar lint, tests y build",
            "Cobertura de tests minima 80% (backend) y 70% (frontend)",
            "Deploy a staging automatico al mergear a develop",
            "Deploy a produccion requiere aprobacion manual de 2 reviewers",
            "Escaneo de vulnerabilidades Snyk bloquea PR con vulnerabilidades criticas"
        ],
        "dependencies": ["REQ-022"],
        "comments": [
            {"id": "c1", "author": "Carlos Mendez", "text": "Configurar matrix strategy para tests en Python 3.11 y 3.12.", "date": "2025-02-10"}
        ],
        "order_index": 23
    },
    {
        "title": "Database migrations con Alembic y rollback",
        "description": "Todas las modificaciones de esquema de base de datos se gestionan via Alembic. Cada migracion incluye funcion de upgrade y downgrade. Las migraciones se ejecutan automaticamente en el CI/CD antes del deploy. Sistema de rollback automatico si la migracion falla.",
        "type": "tecnico", "priority": "media", "status": "aprobado",
        "acceptance_criteria": [
            "Cada PR que modifica modelos incluye migracion Alembic correspondiente",
            "alembic downgrade -1 revierte la ultima migracion sin perdida de datos",
            "Migraciones se ejecutan en transaccion para rollback automatico si fallan",
            "Script de CI valida que no hay migraciones pendientes antes de deploy"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Maria Lopez", "text": "Agregar pre-commit hook que detecta cambios en modelos sin migracion.", "date": "2025-02-15"}
        ],
        "order_index": 24
    },
    {
        "title": "Structured logging con ELK Stack",
        "description": "Implementar logging estructurado en formato JSON con structlog (Python) y pino (Node.js si aplica). Centralizar logs en ELK Stack (Elasticsearch, Logstash, Kibana). Incluir correlation IDs para trazar requests a traves de microservicios. Alertas configurables en Kibana.",
        "type": "tecnico", "priority": "media", "status": "en-revision",
        "acceptance_criteria": [
            "Todos los logs incluyen timestamp, level, correlation_id, service, y contexto",
            "Kibana dashboard con metricas: errores/min, latencia, requests por endpoint",
            "Logs se retienen 30 dias en hot storage, 90 dias en cold storage",
            "Alertas en Slack/PagerDuty si error rate > 1% en ventana de 5 min"
        ],
        "dependencies": ["REQ-022"],
        "comments": [
            {"id": "c1", "author": "Carlos Mendez", "text": "Evaluar Grafana Loki como alternativa mas ligera a ELK.", "date": "2025-03-18"}
        ],
        "order_index": 25
    },

    # ── BUSINESS (9) ─────────────────────────────────────────────────────────
    {
        "title": "Dashboard de analitica con metricas en tiempo real",
        "description": "Panel de analitica para administradores con KPIs de ventas en tiempo real: ingresos diarios/semanales/mensuales, ticket promedio, tasa de conversion, productos mas vendidos, y embudo de conversion. Graficas interactivas con filtros por periodo, categoria y segmento.",
        "type": "negocio", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "Dashboard muestra al menos 8 KPIs actualizados cada 5 minutos",
            "Graficas de ventas con comparativa vs periodo anterior",
            "Top 10 productos mas vendidos con revenue y unidades",
            "Embudo de conversion: visitas -> catalogo -> carrito -> checkout -> compra",
            "Export a PDF y CSV de cualquier reporte"
        ],
        "dependencies": ["REQ-014"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "Incluir metrica de CLV (Customer Lifetime Value) por segmento.", "date": "2025-03-20"}
        ],
        "order_index": 26
    },
    {
        "title": "Sistema de promociones y cupones configurables",
        "description": "Motor de promociones con reglas configurables: porcentaje de descuento, monto fijo, 2x1, envio gratis. Cupones con codigo unico, limite de usos, vigencia, y restricciones por categoria/producto/monto minimo. Stackable o exclusivas segun configuracion.",
        "type": "negocio", "priority": "alta", "status": "aprobado",
        "acceptance_criteria": [
            "Admin puede crear promociones con 4 tipos: porcentaje, fijo, BOGO, envio gratis",
            "Cupones con codigo unico, limite de usos global y por usuario",
            "Restricciones configurables: monto minimo, categorias, productos especificos",
            "Una sola promocion activa por carrito a menos que sea stackable",
            "Reporte de uso de cupones con ROI por campana"
        ],
        "dependencies": ["REQ-014"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "Campanas de Black Friday y Hot Sale necesitan cupones masivos.", "date": "2025-03-05"}
        ],
        "order_index": 27
    },
    {
        "title": "Importacion masiva de productos via CSV/Excel",
        "description": "Los administradores pueden importar productos masivamente desde archivos CSV o Excel. El sistema valida formato, datos requeridos, y SKUs duplicados antes de importar. Soporta creacion y actualizacion de productos existentes. Incluye template descargable y reporte de errores.",
        "type": "negocio", "priority": "media", "status": "en-revision",
        "acceptance_criteria": [
            "Template CSV/Excel descargable con campos requeridos y opcionales",
            "Validacion pre-importacion con reporte de errores por fila",
            "Importacion de hasta 10,000 productos en una sola operacion (<60s)",
            "Opcion de crear nuevos o actualizar existentes (match por SKU)",
            "Log de importacion con conteo de creados, actualizados y errores"
        ],
        "dependencies": ["REQ-009", "REQ-014"],
        "comments": [
            {"id": "c1", "author": "Ana Garcia", "text": "Test con archivos de 10K filas para validar rendimiento.", "date": "2025-03-25"}
        ],
        "order_index": 28
    },
    {
        "title": "Programa de lealtad con puntos canjeables",
        "description": "Sistema de puntos de lealtad: los clientes acumulan puntos por cada compra (1 punto por cada $10 MXN). Los puntos se pueden canjear como descuento en futuras compras. Niveles de membresia (Bronce, Plata, Oro, Platino) con beneficios progresivos.",
        "type": "negocio", "priority": "baja", "status": "borrador",
        "acceptance_criteria": [
            "Los puntos se acreditan 48h despues de la entrega confirmada",
            "El canje minimo es de 100 puntos ($100 MXN de descuento)",
            "Niveles de membresia se actualizan automaticamente segun compras acumuladas en 12 meses",
            "Los puntos expiran 12 meses despues de su acreditacion"
        ],
        "dependencies": ["REQ-002", "REQ-005"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "Benchmark: Amazon Prime, Mercado Puntos, BBVA Points.", "date": "2025-04-01"}
        ],
        "order_index": 29
    },
    {
        "title": "Margen minimo garantizado del 15% por producto",
        "description": "El sistema debe validar que ningun producto se publique con un margen bruto inferior al 15%. El calculo considera costo de producto (cost_price), comisiones de pasarela de pago (~3.6%), y costos de envio estimados. Alerta al admin si un descuento reduce el margen por debajo del umbral.",
        "type": "negocio", "priority": "media", "status": "aprobado",
        "acceptance_criteria": [
            "Validacion automatica al publicar producto: margen >= 15% considerando costos",
            "Warning visual en panel admin si margen esta entre 15% y 20%",
            "Bloqueo de promocion que reduzca margen por debajo del 15%",
            "Reporte de productos con margen critico (<20%) actualizado diariamente"
        ],
        "dependencies": ["REQ-027"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "Margen ajustable por categoria. Electronica puede ser 10%, ropa 25%.", "date": "2025-03-28"}
        ],
        "order_index": 30
    },
    {
        "title": "Descuentos por volumen configurables por categoria",
        "description": "Ofrecer descuentos automaticos por volumen de compra: 5% a partir de 3 unidades, 10% a partir de 6, 15% a partir de 12. Los umbrales y porcentajes son configurables por categoria desde el panel de admin.",
        "type": "negocio", "priority": "baja", "status": "borrador",
        "acceptance_criteria": [
            "Los descuentos por volumen se aplican automaticamente en el carrito",
            "El admin configura rangos y porcentajes por categoria",
            "El precio unitario con descuento se muestra junto al precio original",
            "Los descuentos por volumen son acumulables con cupones si se configura asi"
        ],
        "dependencies": ["REQ-027", "REQ-030"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "Prioritario para clientes B2B y compras mayoristas.", "date": "2025-04-05"}
        ],
        "order_index": 31
    },
    {
        "title": "Comision marketplace 8-15% configurable por vendedor",
        "description": "En modelo marketplace, el sistema retiene una comision del 8-15% por cada venta de un vendedor tercero. La comision es configurable por vendedor y por categoria. Los pagos a vendedores se procesan semanalmente via transferencia bancaria con corte los lunes.",
        "type": "negocio", "priority": "baja", "status": "borrador",
        "acceptance_criteria": [
            "La comision se calcula automaticamente al confirmar el pedido",
            "El vendedor ve su balance con desglose de ventas, comisiones y pagos",
            "Pagos semanales automaticos con reporte detallado por email",
            "El admin puede ajustar comision por vendedor sin afectar historicos"
        ],
        "dependencies": ["REQ-014", "REQ-005"],
        "comments": [
            {"id": "c1", "author": "Roberto Sanchez", "text": "Fase 2 del proyecto. No incluir en MVP.", "date": "2025-04-10"}
        ],
        "order_index": 32
    },
    {
        "title": "Recuperacion de carritos abandonados",
        "description": "Sistema automatizado de recuperacion de carritos abandonados. Cuando un carrito con productos no completa checkout en 1 hora, se envia primer email recordatorio. Segundo email a las 24h con incentivo de envio gratis. Tercer email a las 72h con cupon 10% descuento.",
        "type": "negocio", "priority": "media", "status": "en-revision",
        "acceptance_criteria": [
            "Email automatico a 1h, 24h y 72h de abandono del carrito",
            "Cada email incluye resumen del carrito con imagenes y precios actualizados",
            "El tercer email incluye cupon de 10% de un solo uso con vigencia 7 dias",
            "Dashboard con tasa de recuperacion por email (objetivo: 15% de conversion)",
            "El usuario puede desuscribirse de recordatorios de carrito"
        ],
        "dependencies": ["REQ-004", "REQ-013", "REQ-027"],
        "comments": [
            {"id": "c1", "author": "Ana Garcia", "text": "Validar cumplimiento con regulacion anti-spam (CAN-SPAM, GDPR).", "date": "2025-04-02"},
            {"id": "c2", "author": "Roberto Sanchez", "text": "La recuperacion de carritos puede generar 5-10% de revenue adicional.", "date": "2025-04-03"}
        ],
        "order_index": 33
    },
    {
        "title": "Multi-idioma e internacionalizacion de moneda",
        "description": "Soporte completo para internacionalizacion: interfaz disponible en espanol (es-MX) e ingles (en-US). Precios mostrados en la moneda local del usuario con conversion automatica via API de tasas de cambio. Formatos de fecha, numero y direccion adaptados a la locale.",
        "type": "negocio", "priority": "baja", "status": "borrador",
        "acceptance_criteria": [
            "Todas las cadenas de texto estan externalizadas en archivos i18n (JSON)",
            "Selector de idioma persiste la preferencia del usuario",
            "Precios convertidos con tasa de cambio actualizada cada 4 horas",
            "Formatos de fecha y numero se adaptan a la locale seleccionada"
        ],
        "dependencies": [],
        "comments": [
            {"id": "c1", "author": "Diego Fernandez", "text": "Usar react-intl o i18next para el frontend.", "date": "2025-04-08"}
        ],
        "order_index": 34
    }
]

# ══════════════════════════════════════════════════════════════════════════════
#  DATA MODEL (imported from generated file)
# ══════════════════════════════════════════════════════════════════════════════

from ecommerce_data_model import TABLES, RELATIONSHIPS
from ecommerce_use_cases import USE_CASES

# ══════════════════════════════════════════════════════════════════════════════
#  FLOW DIAGRAM - Purchase Flow (~25 nodes)
# ══════════════════════════════════════════════════════════════════════════════

FLOW_DIAGRAM = {
    "nodes": [
        {"id": "n1",  "type": "start",    "label": "Inicio",                       "x": 400, "y": 30},
        {"id": "n2",  "type": "action",   "label": "Usuario navega catalogo",       "x": 400, "y": 110},
        {"id": "n3",  "type": "action",   "label": "Buscar producto / Aplicar filtros", "x": 400, "y": 190},
        {"id": "n4",  "type": "action",   "label": "Ver detalle de producto",       "x": 400, "y": 270},
        {"id": "n5",  "type": "decision", "label": "Producto disponible?",          "x": 400, "y": 360},
        {"id": "n6",  "type": "action",   "label": "Seleccionar variante (talla/color)", "x": 400, "y": 450},
        {"id": "n7",  "type": "action",   "label": "Agregar al carrito",            "x": 400, "y": 530},
        {"id": "n8",  "type": "decision", "label": "Seguir comprando?",             "x": 400, "y": 620},
        {"id": "n9",  "type": "action",   "label": "Revisar carrito",               "x": 400, "y": 710},
        {"id": "n10", "type": "decision", "label": "Tiene cupon?",                  "x": 400, "y": 800},
        {"id": "n11", "type": "action",   "label": "Aplicar cupon de descuento",    "x": 600, "y": 800},
        {"id": "n12", "type": "action",   "label": "Proceder al checkout",          "x": 400, "y": 890},
        {"id": "n13", "type": "decision", "label": "Usuario registrado?",           "x": 400, "y": 980},
        {"id": "n14", "type": "action",   "label": "Checkout como invitado (email + datos)", "x": 200, "y": 1060},
        {"id": "n15", "type": "action",   "label": "Iniciar sesion / Registro",     "x": 600, "y": 1060},
        {"id": "n16", "type": "action",   "label": "Ingresar direccion de envio",   "x": 400, "y": 1140},
        {"id": "n17", "type": "action",   "label": "Seleccionar metodo de envio",   "x": 400, "y": 1220},
        {"id": "n18", "type": "action",   "label": "Seleccionar metodo de pago",    "x": 400, "y": 1300},
        {"id": "n19", "type": "decision", "label": "Metodo de pago?",               "x": 400, "y": 1390},
        {"id": "n20", "type": "action",   "label": "Pago con tarjeta (Stripe Elements)", "x": 200, "y": 1470},
        {"id": "n21", "type": "action",   "label": "Pago con PayPal (popup)",       "x": 400, "y": 1470},
        {"id": "n22", "type": "action",   "label": "Generar voucher OXXO Pay",      "x": 600, "y": 1470},
        {"id": "n23", "type": "decision", "label": "Pago exitoso?",                 "x": 400, "y": 1560},
        {"id": "n24", "type": "action",   "label": "Crear pedido + confirmar",      "x": 400, "y": 1650},
        {"id": "n25", "type": "action",   "label": "Enviar email de confirmacion",  "x": 400, "y": 1730},
        {"id": "n26", "type": "action",   "label": "Actualizar inventario",         "x": 400, "y": 1810},
        {"id": "n27", "type": "end",      "label": "Pedido completado",             "x": 400, "y": 1900},
        {"id": "n28", "type": "action",   "label": "Mostrar error de stock",        "x": 650, "y": 360},
        {"id": "n29", "type": "action",   "label": "Mostrar error de pago / Reintentar", "x": 650, "y": 1560}
    ],
    "connections": [
        {"id": "c1",  "from": "n1",  "to": "n2",  "label": ""},
        {"id": "c2",  "from": "n2",  "to": "n3",  "label": ""},
        {"id": "c3",  "from": "n3",  "to": "n4",  "label": ""},
        {"id": "c4",  "from": "n4",  "to": "n5",  "label": ""},
        {"id": "c5",  "from": "n5",  "to": "n6",  "label": "Si"},
        {"id": "c6",  "from": "n5",  "to": "n28", "label": "No"},
        {"id": "c7",  "from": "n28", "to": "n3",  "label": "Volver a buscar"},
        {"id": "c8",  "from": "n6",  "to": "n7",  "label": ""},
        {"id": "c9",  "from": "n7",  "to": "n8",  "label": ""},
        {"id": "c10", "from": "n8",  "to": "n3",  "label": "Si"},
        {"id": "c11", "from": "n8",  "to": "n9",  "label": "No"},
        {"id": "c12", "from": "n9",  "to": "n10", "label": ""},
        {"id": "c13", "from": "n10", "to": "n11", "label": "Si"},
        {"id": "c14", "from": "n10", "to": "n12", "label": "No"},
        {"id": "c15", "from": "n11", "to": "n12", "label": ""},
        {"id": "c16", "from": "n12", "to": "n13", "label": ""},
        {"id": "c17", "from": "n13", "to": "n14", "label": "No"},
        {"id": "c18", "from": "n13", "to": "n15", "label": "Si"},
        {"id": "c19", "from": "n14", "to": "n16", "label": ""},
        {"id": "c20", "from": "n15", "to": "n16", "label": ""},
        {"id": "c21", "from": "n16", "to": "n17", "label": ""},
        {"id": "c22", "from": "n17", "to": "n18", "label": ""},
        {"id": "c23", "from": "n18", "to": "n19", "label": ""},
        {"id": "c24", "from": "n19", "to": "n20", "label": "Tarjeta"},
        {"id": "c25", "from": "n19", "to": "n21", "label": "PayPal"},
        {"id": "c26", "from": "n19", "to": "n22", "label": "OXXO"},
        {"id": "c27", "from": "n20", "to": "n23", "label": ""},
        {"id": "c28", "from": "n21", "to": "n23", "label": ""},
        {"id": "c29", "from": "n22", "to": "n23", "label": ""},
        {"id": "c30", "from": "n23", "to": "n24", "label": "Si"},
        {"id": "c31", "from": "n23", "to": "n29", "label": "No"},
        {"id": "c32", "from": "n29", "to": "n18", "label": "Reintentar"},
        {"id": "c33", "from": "n24", "to": "n25", "label": ""},
        {"id": "c34", "from": "n25", "to": "n26", "label": ""},
        {"id": "c35", "from": "n26", "to": "n27", "label": ""}
    ]
}

# ══════════════════════════════════════════════════════════════════════════════
#  AUDIT LOGS
# ══════════════════════════════════════════════════════════════════════════════

AUDIT_LOGS = [
    {"action": "Proyecto creado", "description": "Se creo el proyecto E-Commerce Platform con configuracion inicial completa", "entity": "Proyecto", "type": "system", "status": "success"},
    {"action": "Metadatos configurados", "description": "Se completaron 5 metodos de levantamiento: entrevistas, encuestas, historias de usuario, observacion directa y analisis de documentos", "entity": "Metadatos", "type": "user", "status": "success"},
    {"action": "Requisitos importados", "description": "Se importaron 34 requisitos clasificados en funcionales (15), no-funcionales (5), tecnicos (5) y de negocio (9)", "entity": "Requisitos", "type": "system", "status": "success"},
    {"action": "Casos de uso documentados", "description": "Se documentaron 16 casos de uso con actores, flujos principales, alternativos, reglas de negocio y excepciones", "entity": "Casos de Uso", "type": "user", "status": "success"},
    {"action": "Modelo de datos disenado", "description": "Se diseno modelo ER con 22 tablas, 207 columnas y 30 relaciones cubriendo todos los modulos del e-commerce", "entity": "Modelo de Datos", "type": "user", "status": "success"},
    {"action": "Diagrama de flujo creado", "description": "Se creo diagrama de flujo de compra completo con 29 nodos y 35 conexiones, cubriendo todos los caminos del checkout", "entity": "Diagramas", "type": "user", "status": "success"},
    {"action": "Revision de requisitos", "description": "Carlos Mendez y Maria Lopez revisaron los requisitos tecnicos. Se aprobaron REQ-021 a REQ-025", "entity": "Requisitos", "type": "user", "status": "success"},
    {"action": "Validacion de modelo de datos", "description": "Se validaron todas las foreign keys, indices y restricciones del modelo relacional. Cero errores encontrados", "entity": "Modelo de Datos", "type": "database", "status": "success"},
    {"action": "Actualizacion de prioridades", "description": "Roberto Sanchez actualizo prioridades de requisitos de negocio tras reunion con stakeholders", "entity": "Requisitos", "type": "user", "status": "info"},
    {"action": "Integracion Stripe configurada", "description": "Se configuro Stripe en modo test con webhooks para payment_intent.succeeded y payment_intent.failed", "entity": "Configuracion", "type": "system", "status": "success"},
    {"action": "Review de casos de uso", "description": "Ana Garcia reviso casos de uso CU-07 (Pago con tarjeta) y CU-14 (Devoluciones). Se agregaron excepciones adicionales", "entity": "Casos de Uso", "type": "user", "status": "success"},
    {"action": "Pipeline CI/CD configurado", "description": "GitHub Actions configurado con lint, tests, build y deploy. Primer run exitoso en rama develop", "entity": "DevOps", "type": "system", "status": "success"},
    {"action": "Alerta de rendimiento", "description": "Query de busqueda de productos excede 200ms con dataset de prueba de 50K productos. Se requiere optimizacion con indices", "entity": "Performance", "type": "system", "status": "warning"},
    {"action": "Indice optimizado", "description": "Se agrego indice compuesto (category_id, is_active, base_price) en tabla products. Query de busqueda reducida a 45ms", "entity": "Base de Datos", "type": "database", "status": "success"},
    {"action": "Requisito rechazado", "description": "REQ-032 (Comision marketplace) movido a Fase 2 por decision del Product Owner. No incluir en MVP", "entity": "Requisitos", "type": "business", "status": "warning"},
    {"action": "Sprint planning completado", "description": "Sprint 4 planificado: implementar checkout, integracion Stripe/PayPal, y sistema de notificaciones. 47 story points", "entity": "Planificacion", "type": "user", "status": "info"},
    {"action": "Backup de base de datos", "description": "Backup automatico completado exitosamente. Tamano: 2.4GB. Almacenado en S3 bucket con retencion 30 dias", "entity": "Base de Datos", "type": "system", "status": "success"},
    {"action": "Test de carga ejecutado", "description": "Prueba con 500 usuarios concurrentes: P50=180ms, P95=420ms, P99=890ms. Dentro de SLA excepto P99", "entity": "QA", "type": "system", "status": "warning"},
    {"action": "Documentacion API actualizada", "description": "OpenAPI 3.0 actualizado con todos los endpoints de v1. 47 endpoints documentados con ejemplos", "entity": "Documentacion", "type": "user", "status": "success"},
    {"action": "Deploy a staging", "description": "Version 0.4.0-beta desplegada en staging. Todas las pruebas pasaron. Pendiente QA manual de flujo de checkout", "entity": "DevOps", "type": "system", "status": "success"},
]

# ══════════════════════════════════════════════════════════════════════════════
#  MAIN EXECUTION
# ══════════════════════════════════════════════════════════════════════════════

def seed_requirements(h):
    print("\n=== Creating 34 Requirements ===")
    for i, req in enumerate(REQUIREMENTS):
        r = api("post", f"/api/projects/{PROJECT_ID}/requirements", h, json_data=req, expect=[201])
        if r:
            print(f"  [{i+1}/34] Created: {req['title'][:60]}")
        else:
            print(f"  [{i+1}/34] FAILED: {req['title'][:60]}")

def seed_use_cases(h):
    print("\n=== Creating 16 Use Cases ===")
    for i, uc in enumerate(USE_CASES):
        payload = {
            "title": uc["title"],
            "description": uc["description"],
            "preconditions": uc["preconditions"],
            "postconditions": uc["postconditions"],
            "snapshot": uc["snapshot"]
        }
        r = api("post", f"/api/projects/{PROJECT_ID}/use-cases", h, json_data=payload, expect=[201])
        if r:
            print(f"  [{i+1}/16] Created: {uc['title'][:60]}")
        else:
            print(f"  [{i+1}/16] FAILED: {uc['title'][:60]}")

def seed_data_model(h):
    print("\n=== Saving Data Model (22 tables, 30 relationships) ===")
    payload = {"tables": TABLES, "relationships": RELATIONSHIPS}
    r = api("put", f"/api/projects/{PROJECT_ID}/data-model", h, json_data=payload, expect=[200])
    if r:
        data = r.json()
        print(f"  [OK] Tables: {len(data.get('tables', []))}, Relationships: {len(data.get('relationships', []))}")
    else:
        print("  [FAIL] Data model save failed")

def seed_flow_diagram(h):
    print("\n=== Saving Flow Diagram (29 nodes, 35 connections) ===")
    payload = {"data": FLOW_DIAGRAM}
    r = api("put", f"/api/projects/{PROJECT_ID}/diagrams/flujo", h, json_data=payload, expect=[200])
    if r:
        print(f"  [OK] Flow diagram saved")
    else:
        print("  [FAIL] Flow diagram save failed")

def seed_audit_logs(h):
    print("\n=== Creating Audit Logs ===")
    for i, log in enumerate(AUDIT_LOGS):
        r = api("post", f"/api/projects/{PROJECT_ID}/audit-logs", h, json_data=log, expect=[201])
        if r:
            print(f"  [{i+1}/{len(AUDIT_LOGS)}] {log['action'][:50]}")

def update_project_progress(h):
    print("\n=== Updating project progress to 85% ===")
    # First get current settings
    r = api("get", f"/api/projects/{PROJECT_ID}", h, expect=[200])
    if r:
        project = r.json()
        settings = project.get("settings") or {}
        settings["progress"] = 85
        settings["lastActivity"] = "Modelo de datos y diagramas completados"
        r2 = api("put", f"/api/projects/{PROJECT_ID}", h, json_data={"settings": settings}, expect=[200])
        if r2:
            print(f"  [OK] Progress updated to 85%")
        else:
            print("  [FAIL] Progress update failed")

if __name__ == "__main__":
    h = login()
    delete_existing(h)
    seed_requirements(h)
    seed_use_cases(h)
    seed_data_model(h)
    seed_flow_diagram(h)
    seed_audit_logs(h)
    update_project_progress(h)
    print("\n========================================")
    print("  SEED COMPLETE!")
    print("========================================")
