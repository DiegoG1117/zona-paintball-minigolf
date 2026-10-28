# WhatsApp chatbot de Zona Paintball Cali

Número del chatbot: **+57 300 8736948**. No volver a iniciar sesión de WhatsApp con este número. Si se abre la app e se registra otra vez, se desconecta de la API.

PIN de verificación en dos pasos (se usó al registrar el número en Cloud API): **873948**. Guardarlo. Meta lo pide si hay que registrar el número de nuevo.

## Dónde está cada cosa

| Qué | Valor |
| --- | --- |
| App de Meta | ZonaPaintballBotN8N |
| App ID | 1302731541815207 |
| No usar | ZonaPaintballBot, App ID 2030462094483929 |
| Portfolio | Zona Paintball Cali, business_id 1292135852425373 |
| Cuenta de WhatsApp (WABA) | Zona Paintball Cali, ID 2109092639648304 |
| Número | +57 300 8736948 |
| Phone Number ID | 1368504863020619 |
| Nombre verificado | Zona Paintball Cali |
| Estado tras el registro | CONNECTED, CLOUD_API, código VERIFIED, calidad GREEN |
| n8n | https://zonapaintballcali.app.n8n.cloud |
| Workflow | WhatsApp Chatbot Zona Paintball, id Co8lz8UeyLY2na7G |
| Credencial n8n | WhatsApp Cloud Zona Paintball, id 1MlHt0pvR8z6gF9g (header Authorization: Bearer + token del usuario del sistema) |
| Usuario del sistema | n8n WhatsApp, id 61595986740205, rol Admin |
| Webhook | https://zonapaintballcali.app.n8n.cloud/webhook/whatsapp-zona-paintball |
| Verify token | zona-paintball-wa-verify |
| Envío | POST https://graph.facebook.com/v26.0/1368504863020619/messages |

La app sigue en modo **Desarrollo**. Meta puede no entregar mensajes de clientes reales al webhook hasta pasarla a Activo. Para eso hace falta una URL pública de política de privacidad (hoy está vacía en Configuración básica). El negocio no está verificado; eso limita el volumen, no impide contestar dentro de la ventana de 24 horas.

El token de n8n es de usuario del sistema, caducidad Nunca, app ZonaPaintballBotN8N, permisos `whatsapp_business_management` y `whatsapp_business_messaging`. No se guarda en git ni se copia al chat. Si hay que regenerarlo: Configuración del negocio → Usuarios del sistema → n8n WhatsApp → Generar token, y actualizar la credencial de n8n.

## Flujo en n8n

Flujo publicado: [WhatsApp Chatbot Zona Paintball](https://zonapaintballcali.app.n8n.cloud/workflow/Co8lz8UeyLY2na7G)

1. **WhatsApp Webhook** recibe el mensaje.
2. **Preparar contexto** lo pasa al **Agente WhatsApp**.
3. El agente elige la herramienta y después escribe el texto. **Enviar texto** manda solo ese texto.
4. **Consultar precios** devuelve el JSON de productos y precios. No envía WhatsApp.
5. **Enviar fotos entradas** envía el mensaje fijo `Claro que si, aqui te dejo las fotos de los precios` y las cinco fotos de entradas. Se usa en el primer saludo y cuando hablan de precios o entradas. En ese primer saludo el texto dice que es un bot de prueba, que puede atender las solicitudes y deja el enlace humano https://wa.me/573173100636.
6. **Enviar fotos picnic** envía el mensaje fijo `aqui te dejo las fotos de los picnic` y las fotos de picnic. Se usa cuando hablan de cumpleaños o picnic. En cumpleaños siempre sugiere el picnic, aclara el costo adicional de $190.000 y que las zonas con letreros de cumpleaños no tienen costo.
7. **Enviar menu de comidas** envía `🍔 Este es tu menu de comidas` y después `menu1.jpg` y `menu2.jpg`. Se usa cuando preguntan por el menú o la comida. Los perros, las hamburguesas y las pizzas se piden por encargo según la cantidad.
8. **Avisar humano** manda al +57 317 3100636 un resumen con el nombre de WhatsApp y el teléfono del cliente como enlace `https://wa.me/` más el número. El agente la usa cuando decide que se necesita una persona, y después sigue el mensaje normal al cliente con https://wa.me/573173100636. En el primer saludo no se llama. WhatsApp solo entrega ese texto si el +57 317 3100636 le escribió al +57 300 8736948 en las últimas 24 horas. Hay una plantilla `aviso_atencion_humana` en revisión de Meta para poder avisarle fuera de esa ventana.
7. Esas dos herramientas llaman el flujo [Enviar fotos WhatsApp Zona Paintball](https://zonapaintballcali.app.n8n.cloud/workflow/omtAfnMygqxm0hqp). Ahí están los mensajes fijos y el ciclo que manda el texto y cada foto.

Los precios se editan en el nodo **Consultar precios**. Los mensajes fijos y las fotos, en **Armar paquete** del flujo de envío. El tono del bot, en **Agente WhatsApp**.

**Limpiar memoria del chat** está suelto, sin conexiones. En modo desarrollador se abre ese nodo y se ejecuta: los mensajes siguientes llegan sin la conversación anterior. No corre cuando escribe un cliente.

**Modelo ChatGPT**: `gpt-5-mini`. Si n8n pide credencial, se elige en ese nodo y se pulsa Publish.

Fotos: https://github.com/DiegoG1117/zona-paintball-fotos

## Qué no tocar en Meta

En WhatsApp Manager, fila +57 300 8736948: no usar el basurero Eliminar, ni Agregar número, ni Conectar cuenta de WhatsApp.
