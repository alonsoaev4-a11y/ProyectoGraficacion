import os
import sys
import json
import mysql.connector

# Agregar la ruta apropiada
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'soft_evolved'
}

def seed_professional_metadata():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Buscar TODOS los proyectos E-commerce
        cursor.execute("SELECT id FROM projects WHERE name LIKE '%E-commerce%'")
        projects = cursor.fetchall()

        if not projects:
            print("Proyectos E-commerce no encontrados")
            return

        for project in projects:
            project_id = project['id']

            metadata_payload = {
                "nombreProyecto": "E-Commerce Platform B2B/B2C NextGen Ominichannel",
                "descripcionProyecto": "Plataforma integral de comercio electrónico de clase mundial con arquitectura de microservicios, diseñada para manejar picos de tráfico de más de 500,000 usuarios concurrentes, logística en tiempo real, personalización impulsada por IA, manejo de multitenancy B2B y una experiencia omnicanal unificada en todas las plataformas (Web, App, Kiosko).",
                "tipoApp": "Web/Movil",
                "industria": "Retail, Wholesale & Logistics",
                "plataforma": ["Web", "iOS", "Android", "Kiosko Físico", "Smart TV (Ads)"],
                
                "entrevistas": [
                    {
                        "id": "e1",
                        "nombre": "Director de Operaciones (COO)",
                        "rol": "Stakeholder Principal",
                        "fecha": "2024-01-10",
                        "duracion": "90 min",
                        "lugar": "Virtual (Teams)",
                        "preguntas": [
                            {"id": "p1_1", "texto": "¿Cuál es el dolor principal de la operación actual?", "categoria": "Negocio", "respuesta": "La falta de sincronización en tiempo real del inventario. El sistema actual demora 15 minutos en reflejar el stock, provocando sobreventas o cancelaciones manuales que dañan la marca."},
                            {"id": "p1_2", "texto": "¿Cómo impacta esto financieramente?", "categoria": "Operaciones", "respuesta": "Perdemos cerca del 4% del GMV anual solo en devoluciones o logística inversa por errores de picking en el Dark Store."},
                            {"id": "p1_3", "texto": "¿Qué flujo de supply chain necesitamos integrar?", "categoria": "Logística", "respuesta": "Debe hablar nativamente con SAP S/4HANA y tener webhooks para los 3PL (FedEx, UPS, operadores locales) con actualizaciones sub-segundo."},
                            {"id": "p1_4", "texto": "¿Cuál es la expectativa para el Black Friday/Cyber Monday?", "categoria": "Escalabilidad", "respuesta": "Soportar picos de 35,000 transacciones por minuto (TPM) sin que la base de datos de bloquee."},
                            {"id": "p1_5", "texto": "¿Se manejarán múltiples bodegas virtuales?", "categoria": "Logística", "respuesta": "Sí, tenemos 8 Dark Stores y 45 tiendas físicas que pueden servir como puntos de 'Ship from Store'."},
                            {"id": "p1_6", "texto": "¿Cómo se maneja la merma y productos dañados?", "categoria": "Operaciones", "respuesta": "Debe haber una interfaz en el admin para que el encargado de bodega tome fotos y marque el SKU como cuarentena."},
                            {"id": "p1_7", "texto": "¿Tienen flota propia de distribución última milla?", "categoria": "Logística", "respuesta": "Para la ciudad principal sí, necesitamos un módulo de ruteo integrado que conecte con Google Maps o Mapbox para el algoritmo del viajero."},
                            {"id": "p1_8", "texto": "¿Expectativa de crecimiento B2B?", "categoria": "Negocio", "respuesta": "El B2B debe representar el 40% de ingresos en 2 años, necesitamos flujos donde puedan pedir por pallets, no solo por unidades."}
                        ],
                        "hallazgos": "El backend no puede ser monolítico. Requiere Event-Sourcing (Kafka/RabbitMQ) para los estados de pedido y un sistema PIM (Product Information Management) robusto para manejar la multicanalidad de catálogo."
                    },
                    {
                        "id": "e2",
                        "nombre": "CMO (Chief Marketing Officer)",
                        "rol": "Usuario de Negocio / Estrategia",
                        "fecha": "2024-01-12",
                        "duracion": "120 min",
                        "lugar": "Sala de Juntas",
                        "preguntas": [
                            {"id": "p2_1", "texto": "¿Qué limita actualmente sus campañas?", "categoria": "Marketing", "respuesta": "El equipo de TI tarda semanas en desplegar landing pages. Necesitamos un Headless CMS incorporado."},
                            {"id": "p2_2", "texto": "¿Qué motor promocional tienen en mente?", "categoria": "Ventas", "respuesta": "Reglas de carrito complejas: 'Lleva X al Y% si tienes el producto Z y es tu cumpleaños', BOGO, flash sales con countdowns que no hagan crash en el frontend."},
                            {"id": "p2_3", "texto": "¿Cómo visualizan la retención de clientes?", "categoria": "Fidelización", "respuesta": "Un sistema de lealtad basado en puntos, referidos y gamificación, pero que se pueda redimir pagando con puntos y tarjeta a la vez."},
                            {"id": "p2_4", "texto": "¿Métricas de embudo de conversión?", "categoria": "Analítica", "respuesta": "Rebotes altos en página de producto porque no hay video. Queremos soportar video live commerce directamente en la PWA."},
                            {"id": "p2_5", "texto": "¿Qué integraciones omnicanal priorizan?", "categoria": "Integraciones", "respuesta": "Instagram Shopping, TikTok Shop API, Meta Conversions API (CAPI), y retargeting por SMS automatizado."},
                            {"id": "p2_6", "texto": "¿Manejo de SEO técnico?", "categoria": "Marketing", "respuesta": "Vital. Puntuaciones Lighthouse mayores a 90, SSR (Server Side Rendering), Schema Markup dinámico para e-commerce."},
                            {"id": "p2_7", "texto": "¿Ventas cruzadas (Cross-Sell) y Upsell?", "categoria": "Ventas", "respuesta": "Recomendaciones AI tipo Amazon: 'Los clientes que compraron esto también miraron aquello'."},
                            {"id": "p2_8", "texto": "¿Personalización visual?", "categoria": "UX", "respuesta": "Si el cliente siempre compra ropa de mujer deportiva, su home page debe reordenarse sola al hacer login."}
                        ],
                        "hallazgos": "Obligatorio: Arquitectura MACH (Microservices, API-first, Cloud-native, Headless). Uso intensivo de Redis para las promociones y ElasticSearch/Meilisearch para el discovery."
                    },
                    {
                        "id": "e3",
                        "nombre": "Head of Customer Success",
                        "rol": "Soporte Técnico / Atención al Cliente",
                        "fecha": "2024-01-14",
                        "duracion": "60 min",
                        "lugar": "Virtual",
                        "preguntas": [
                            {"id": "p3_1", "texto": "¿Principal motivo de contacto al call center?", "categoria": "Soporte", "respuesta": "'¿Dónde está mi pedido?'. (WISMO - Where is my order), ocupa el 55% del tiempo de los agentes."},
                            {"id": "p3_2", "texto": "¿Cómo lo resolveremos?", "categoria": "Experiencia", "respuesta": "Chatbot de IA integrado con la base de datos de envíos, y notificaciones Push/WhatsApp proactivas por cada cambio de estado nodal."},
                            {"id": "p3_3", "texto": "¿Qué pasa con las devoluciones?", "categoria": "Operaciones", "respuesta": "Son un infierno logístico. El portal B2C debe permitirle al usuario auto-generar su etiqueta RMA descargable en PDF, validar regla de 30 días, y programar recolección."},
                            {"id": "p3_4", "texto": "¿Y los reembolsos?", "categoria": "Finanzas", "respuesta": "Debe haber una integración directa con las pasarelas (Stripe, PayPal, MercadoPago) para emitir 'Refunds' con un clic desde el Admin, tras aprobar la inspección del producto retornado."},
                            {"id": "p3_5", "texto": "¿Soporte para clientes VIP B2B?", "categoria": "Ventas", "respuesta": "Los mayoristas B2B deben tener un ejecutivo asignado (Account Manager) y poder chatear con él desde su dashboard de cliente."}
                        ],
                        "hallazgos": "Se necesita un mini-CRM interno en la plataforma o una integración limpia bidireccional con Zendesk/Salesforce Service Cloud."
                    },
                    {
                        "id": "e4",
                        "nombre": "CISO (Chief Information Security Officer)",
                        "rol": "Seguridad e Infraestructura",
                        "fecha": "2024-01-16",
                        "duracion": "50 min",
                        "lugar": "Virtual",
                        "preguntas": [
                            {"id": "p4_1", "texto": "¿Requerimientos criptográficos?", "categoria": "Seguridad", "respuesta": "Cifrado en reposo (AES-256) en la BD. En tránsito TLS 1.3 mandatorio sin fallback a protocolos viejos."},
                            {"id": "p4_2", "texto": "¿Certificaciones necesarias?", "categoria": "Cumplimiento", "respuesta": "Si vamos a almacenar tarjetas (Tokenización), PCI-DSS Level 1. Tratamiento de datos bajo GDPR y CCPA californiano porque venderemos global."},
                            {"id": "p4_3", "texto": "¿Autenticación?", "categoria": "Seguridad", "respuesta": "Administradores con MFA (Yubikey/Google Auth) forzado. Clientes finales con opción de Social Login y Passkeys (Biometría web)."},
                            {"id": "p4_4", "texto": "¿Mitigación de ataques?", "categoria": "Infra", "respuesta": "WAF configurado en Cloudflare. Rate-limiting estricto en la API, especialmente en endpoints de login y checkout para evitar 'Carding'."},
                            {"id": "p4_5", "texto": "¿Auditoría al backoffice?", "categoria": "Cumplimiento", "respuesta": "Cada clic, cambio de precio, borrado de usuario de un Admin interno debe guardarse inalterable en una tabla de auditoría (Append-only)."}
                        ],
                        "hallazgos": "Implementaremos JWT asíncrono, Rotación de llaves automática. Integraremos Keycloak o Azure AD B2C para delegar parte de la responsabilidad identitaria."
                    }
                ],
                "hallazgosEntrevista": "Es un monstruo transaccional. Hay 4 pilares: Performance Headless, Supply Chain en crudo Tiempo Real, Marketing Dinámico impulsado por IA y Seguridad bancaria. Todo debe diseñarse Api-First para ser injertado en Apps móviles a futuro.",
                
                "encuestas": [
                    {
                        "id": "en1",
                        "titulo": "Satisfacción de Compradores B2C y Abandono",
                        "descripcion": "Encuesta interactiva servida post-compra y mediante e-mail de retargeting a 15,000 usuarios activos (6 meses).",
                        "preguntas": [
                            {"id": "ep1", "tipo": "abierta", "texto": "¿Principal obstáculo al buscar productos?", "respuestas": ["Buscador no entiende sinónimos (30%)", "Filtros engorrosos en celular (45%)", "Fotos no cargan (15%)"]},
                            {"id": "ep2", "tipo": "multiple", "texto": "¿Por qué abandona carritos al llegar al último paso?", "respuestas": ["Debo crear cuenta forzosamente (40%)", "Costos logísticos calculados muy tarde (35%)", "La pasarela se queda 'pensando' (12%)", "No hay mi medio de pago local (13%)"]},
                            {"id": "ep3", "tipo": "escala", "texto": "¿Qué tan importante es recibirlo el mismo día (Same-Day Delivery)?", "respuestas": ["9 de cada 10 usuarios pagarían tarifa premium por este servicio."]},
                            {"id": "ep4", "tipo": "multiple", "texto": "¿Factores para confiar y poner la tarjeta?", "respuestas": ["Reseñas de otros usuarios con fotos reales (65%)", "Insignias SSL (10%)", "Opción de devolución gratuita fácil (25%)"]},
                            {"id": "ep5", "tipo": "abierta", "texto": "¿Qué opina de los correos promocionales?", "respuestas": ["'Siento que me mandan cosas que ni siquiera miré'. Falta hiper-segmentación."]},
                            {"id": "ep6", "tipo": "sino", "texto": "¿Usarías un probador virtual en Realidad Aumentada usando la cámara frontal?", "respuestas": ["Sí (72%)", "No (28%)"]}
                        ]
                    },
                    {
                        "id": "en2",
                        "titulo": "Fricción de Distribuidores B2B (Mayoristas)",
                        "descripcion": "Análisis profundo a 120 empresas clientes recurrentes de nuestra rama de distribución en volumen.",
                        "preguntas": [
                            {"id": "ep7", "tipo": "abierta", "texto": "¿Cómo realiza los pedidos actualmente?", "respuestas": ["Le mando un excel por WhatsApp a la asesora (55%)", "Uso la web actual pero se cae (45%)"]},
                            {"id": "ep8", "tipo": "multiple", "texto": "¿Problema número 1 con la interfaz B2B?", "respuestas": ["No puedo ver mis líneas de crédito abiertas", "No puedo emitir facturas consolidadas mensuales", "Me obliga a buscar de 1 en 1 los productos"]},
                            {"id": "ep9", "tipo": "abierta", "texto": "¿Qué funcionalida le ahorraría dinero?", "respuestas": ["Permitir crear multi-usuarios de mi empresa con roles (Alguien cotiza, el jefe aprueba, finanzas paga)."]},
                            {"id": "ep10", "tipo": "sino", "texto": "¿Desea un endpoint API para inyectar compras directo desde su ERP local hacia el nuestro?", "respuestas": ["Absolutamente sí (85%)"]}
                        ]
                    }
                ],
                "hallazgosEncuesta": "B2C exige inmediatez, Guest Checkout nativo, búsqueda semántica y contenido generado por usuarios (UGC). B2C exige eficiencia: roles por organización compradora, subida de pedidos por CSV/API e integración de burocracia comprobable (línea de créditos net-30/60).",
                
                "historias": [
                    {
                        "id": "hu1",
                        "comoUnA": "Cliente Ocasional",
                        "necesito": "comprar como 'Invitado' usando Apple Pay/Google Pay",
                        "paraPoder": "cerrar la transacción en menos de 30 segundos sin introducir mi dirección manualmente",
                        "prioridad": "Alta",
                        "estado": "Pendiente",
                        "criteriosAceptacion": ["Detectar Wallet en dispositivo", "Capturar email y envío desde el payload de ApplePay", "Autocrear cuenta en segundo plano para tracking silencioso"]
                    },
                    {
                        "id": "hu2",
                        "comoUnA": "Cliente Indeciso",
                        "necesito": "hacer clic a un botón tipo corazón en cada miniatura de producto",
                        "paraPoder": "guardarlos en múltiples Wishlists públicas o privadas",
                        "prioridad": "Media",
                        "estado": "En progreso",
                        "criteriosAceptacion": ["Persistir wishlist en base de datos si tiene login", "Guardar en LocalStorage si es anónimo", "Alimentar modelo de IA de recomendaciones con esos datos"]
                    },
                    {
                        "id": "hu3",
                        "comoUnA": "Compradora compulsiva",
                        "necesito": "buscar vestidos subiendo una foto de la actriz en Instagram",
                        "paraPoder": "encontrar siluetas similares en el catálogo",
                        "prioridad": "Baja",
                        "estado": "Pendiente",
                        "criteriosAceptacion": ["Invocación asíncrona a VisionAI", "Parseo de vector embeddings contra catálogo Meilisearch/Elastic", "Score de similitud devuelto bajo 3s"]
                    },
                    {
                        "id": "hu4",
                        "comoUnA": "Administrador de Cuentas B2B",
                        "necesito": "asignar líneas de crédito específicas (ej. USD 50,000 a 60 días) a un cliente corporativo",
                        "paraPoder": "que ellos paguen en checkout mediante la opción 'Uso de Crédito Interno'",
                        "prioridad": "Alta",
                        "estado": "Pendiente",
                        "criteriosAceptacion": ["El checkout bloquea opción si el monto supera límite", "Desencadenar envío a buró o ERP financiero al agotar", "Dashboard del cliente muestra barras de progreso de deuda"]
                    },
                    {
                        "id": "hu5",
                        "comoUnA": "Asistente de Bodega/Fulfilment",
                        "necesito": "escanear un QR (Order ID) usando mi celular",
                        "paraPoder": "marcar el paquete automáticamente como 'En Tránsito' hacia el Courrier o Última Milla",
                        "prioridad": "Alta",
                        "estado": "Completada",
                        "criteriosAceptacion": ["PWA escanea usando HTML5 QRCam", "Hook en base de datos avisa por WhatsApp API al cliente final"]
                    },
                    {
                        "id": "hu6",
                        "comoUnA": "Motor de Suscripción (SubscrCommerce)",
                        "necesito": "cobrar automáticamente la tarjeta guardada del usuario cada 15 del mes",
                        "paraPoder": "enviarle su 'Mystery Box' mensual sin fricción manual",
                        "prioridad": "Alta",
                        "estado": "Pendiente",
                        "criteriosAceptacion": ["Worker de Cron Job seguro en Backend", "Manejo de Reintentos Exponenciales si falla cobro", "Tokenización de Stripe sin tocar PAN crudo"]
                    },
                    {
                        "id": "hu7",
                        "comoUnA": "Mercadólogo (Marketing Admin)",
                        "necesito": "diseñar bloques en la homepage (Banners, Sliders de productos)",
                        "paraPoder": "programar campañas que se activen solas el viernes a medianoche y se desactiven el domingo a medianoche",
                        "prioridad": "Alta",
                        "estado": "En progreso",
                        "criteriosAceptacion": ["Bloques de UI serializados en JSON", "Atributo ValidFrom y ValidUntil en el CMS", "Caché de Redis se purga al momento exacto"]
                    },
                    {
                        "id": "hu8",
                        "comoUnA": "Cliente Internacional Europe/USA",
                        "necesito": "Ver el catálogo en diferentes monedas locales y en multi-idioma (I18n)",
                        "paraPoder": "Entender en mi moneda natal sin perder contextualidad de precios psicológicos (.99)",
                        "prioridad": "Alta",
                        "estado": "Pendiente",
                        "criteriosAceptacion": ["Módulo de sincronía con API cambiaria", "Forzar precios que terminan en 9.99 o .00", "Concordancia Idioma con Geolocation en Cloudflare header"]
                    },
                    {
                        "id": "hu9",
                        "comoUnA": "Soporte Técnico (Nivel 2)",
                        "necesito": "buscar los logs de red exactos de un intento fallido de tarjeta declinada",
                        "paraPoder": "explicarle al cliente exactamente qué dijo el banco emisor",
                        "prioridad": "Media",
                        "estado": "Pendiente",
                        "criteriosAceptacion": ["Auditoría extendida en los PaymentGateways", "Enmascaramiento de datos sensibles PII", "Alerta SIEM si ocurren declinaciones masivas"]
                    },
                    {
                        "id": "hu10",
                        "comoUnA": "Plataforma de Afiliados (Affiliate Engine)",
                        "necesito": "generar enlaces únicos UTM rastreables para influencers",
                        "paraPoder": "atribuirle el 5% de comisión sobre el carrito neto final excluyendo envíos/impuestos",
                        "prioridad": "Media",
                        "estado": "En progreso",
                        "criteriosAceptacion": ["Cookie/Local storage rastreando 30 días el attribution", "Cálculo en la tabla de Liquidación de Affiliates al confirmar orden"]
                    }
                ],
                "criteriosGeneralesAceptacion": "Todas las interacciones visuales deben cargarse en <1s. Los cambios de estado de stock en Base de Datos MySQL/Postgres deben propagarse en <50ms o usar arquitecturas CQRS si el read_pool colapsa. Tolerancia a fallos: Si la API de Recomendaciones de IA cae, la página simplemente debe mostrar 'Top Sellers' guardados en caché local estático para que NUNCA deje de vender.",
                
                "sesionesObservacion": [
                    {
                        "id": "so1",
                        "fecha": "2024-01-15",
                        "duracion": "4 horas",
                        "lugar": "Centro de pruebas UX (Eye-Tracking Lab)",
                        "participantes": "8 leads compradores B2C (Millennials y Gen Z)",
                        "objetivo": "Heatmaps en Mobile Checkout Navigation",
                        "hallazgos": "Los CTAs secundarios compiten visualmente con el botón de 'Pagar'. En modo oscuro los textos grises pierden todo el contraste de accesibilidad W3C.",
                        "comportamientoObservado": "Usuarios leían exhaustivamente la política de devoluciones emergente pero la cerraban por error haciendo tap fuera del modal. Rage-clicks en los inputs numéricos de tarjeta donde el teclado virtual no cambiaba a modo 'Teléfono o NumPad'.",
                        "dolorObservado": "Imágenes PNG no optimizadas tardaban 4s en redes celulares 3G simuladas, causando abandonos completos."
                    },
                    {
                        "id": "so2",
                        "fecha": "2024-01-20",
                        "duracion": "3.5 horas",
                        "lugar": "Oficinas Compras B2B Corporativas",
                        "participantes": "4 encargados de adquisiciones mayoristas (Proveeduría)",
                        "objetivo": "Carga y pedido de compras por Excel masivo B2B",
                        "hallazgos": "El sistema PHP legado arrojaba Error 504 Gateway Time Out intentando parsear archivos CSV de 3,000 líneas.",
                        "comportamientoObservado": "Buscaban constantemente una opción para 'Guardar carrito como Plantilla Mensual Fija'. Mantenían 5 pestañas abiertas cruzando referencias cruzadas de SKUs.",
                        "dolorObservado": "Doble digitación: Copiaban la orden desde nuestro sitio hacia su propio ERP (Oracle) a mano. Demandaron conexión API RESTful o SOAP urgente."
                    },
                    {
                        "id": "so3",
                        "fecha": "2024-01-28",
                        "duracion": "2.5 horas",
                        "lugar": "Centro de Distribución (Logística / Bodega Central)",
                        "participantes": "Administrador de bodega, 3 operarios Fulfillment",
                        "objetivo": "Ergonomía del software de Picking en Tablets industriales",
                        "hallazgos": "El tamaño de los botones era muy pequeño para operarios con guantes. La pantalla generaba fatiga visual por demasiada información irrelevante blanca.",
                        "comportamientoObservado": "Escaner láser (Zebra) se desconectaba intermitentemente del navegador Chrome móvil, teniendo que recargar la web para reconectar el socket de eventos.",
                        "dolorObservado": "Frecuentes errores de inventario fantasma: Un cliente web compraba el mismo último item mientras el operario caminaba por el pasillo a agarrarlo."
                    },
                    {
                        "id": "so4",
                        "fecha": "2024-02-05",
                        "duracion": "5 horas",
                        "lugar": "Departamento de Marketing (Oficina Core)",
                        "participantes": "Equipo de Merchandising Digital (3 Personas)",
                        "objetivo": "Uso del Panel Administrativo (CMS) actual para catalogar nueva colección Verano.",
                        "hallazgos": "La subida bulk de imágenes satura el server Node.js base. El cropping y el SEO Tag (Alt tags) era 100% manual ralentizando los lanzamientos.",
                        "comportamientoObservado": "Guardaban todo en Drive y luego armaban Excels de metadatos engorrosos. Aburrimiento general en la carga de variables de talle-color (variaciones hijas).",
                        "dolorObservado": "No hay visualización previa en vivo (Preview). Necesitaban publicar a staging para ver cómo lucía antes de pasar a producción."
                    }
                ],
                "hallazgosObservacion": "Obligatorio: Formularios con tipos de Input correctos HTML5 para UX Móvil extrema. Obligatorio: Colas asíncronas / Workers (Celery o similar) en backend para procesamiento masivo de catálogos y Excel sin trabar el hilo de conexión. Obligatorio: Lock Pesimista de BD o en Redis en inventario de alta contención.",
                
                "resumenConsolidado": "Proyecto de modernización total de E-Commerce a un ecosistema Cloud-Native usando arquitectura de software desacoplada. Se construirá un front-end omnicanal rápido y responsivo (Framework SSR ReactJS o Angular 18+). El core de negocio residirá en Backend transaccional (FastAPI, Python) conectado a orquestadores asíncronos para proteger MySQL contra avalanchas concurrentes, apoyado con un robusto motor en Memoria para control de rate-limits y lectura crítica. Se requerirán conectores inteligentes hacia APIs logísticas internacionales de ERP y la incorporación de modelos pre-entrenados AI/ML para recomendaciones conductuales y procesamiento visual avanzado."
            }

            payload_json = json.dumps(metadata_payload)

            cursor.execute("SELECT id FROM project_metadatos WHERE project_id = %s", (project_id,))
            exists = cursor.fetchone()

            if exists:
                cursor.execute("UPDATE project_metadatos SET data = %s WHERE project_id = %s", (payload_json, project_id))
            else:
                cursor.execute("INSERT INTO project_metadatos (project_id, data) VALUES (%s, %s)", (project_id, payload_json))

            conn.commit()
            print(f"Metadatos SUPER masivos inyectados exitosamente al proyecto ID {project_id}.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == '__main__':
    seed_professional_metadata()
