# Aplicación de Proceso de Compra con Pasarela de Pagos

Esta aplicación demuestra un flujo de onboarding para la compra de un producto, integrando una pasarela de pagos externa. El sistema permite a los usuarios ver productos, ingresar datos de pago y entrega, procesar la transacción a través del servicio de pagos y ver el resultado, actualizando el stock correspondiente en la base de datos local.

## Tecnologías Utilizadas

**Backend:**
* **Framework:** NestJS (TypeScript)
* **Base de Datos:** PostgreSQL
* **ORM:** TypeORM
* **Procesamiento de Pagos:** Integración con Pasarela de Pagos Externa (Modo Sandbox)
* **Librerías Principales:** `axios` (para llamadas HTTP a la pasarela), `uuid` (para generación de IDs).

**Frontend:**
* **Librería:** ReactJS
* **Manejo de Estado:** *(Se utilizó manejo de estado local de React. La implementación de Redux/Vuex).*
* **Enrutamiento:** React Router DOM
* **Estilos:** CSS plano (principalmente a través de estilos en línea y clases CSS globales) y Flexbox/Grid para layout.
* **Librerías Principales:** `fetch` (para llamadas API al backend).

## Despliegue

* **Backend Desplegado en Railway:** `https://ecommerceapp-production-1ed2.up.railway.app` 
* **Frontend Desplegado en Vercel:** `https://ecommerce-app-mu-dusky.vercel.app`
* **Base de Datos:** PostgreSQL (alojada en Railway).

## Características Implementadas

* Visualización de catálogo de productos con información de stock.
* Interfaz para la selección de productos.
* Modal de pago para el ingreso de datos de tarjeta de crédito (simulados y validados según formato estándar) e información de entrega.
* Presentación de un resumen de la compra antes de la confirmación final del pago.
* Integración con la API de una Pasarela de Pagos externa (en modo Sandbox) para el procesamiento de la transacción:
    * Creación de una transacción local (orden) en estado PENDIENTE.
    * Comunicación con la API de la Pasarela de Pagos para iniciar la transacción.
    * Recepción de notificaciones (webhooks) desde la Pasarela de Pagos para la confirmación del estado final de la transacción.
    * Verificación de la firma de los webhooks para asegurar la integridad y autenticidad de la notificación.
* Actualización del estado de la transacción (orden) en la base de datos del backend (`APPROVED`, `DECLINED`).
* Reducción automática del stock del producto tras una compra aprobada.
* Visualización del estado final de la transacción en una página de estado en el frontend, con reintentos para obtener el estado final.
* Actualización de la vista de productos en el frontend para reflejar el stock modificado después de una compra.
* Resiliencia en el formulario de pago usando `localStorage` para persistir los datos ingresados ante refrescos de página.
* Entidades (`Customer`, `Delivery`) y servicios básicos en el backend para gestionar información de clientes y detalles de entrega asociados a una orden.
* API Endpoints básicos (`GET`) para listar Clientes y Entregas.

## Configuración y Ejecución Local

### Prerrequisitos
* Node.js (v18.x o superior recomendado)
* `npm` (o `yarn`)
* Una instancia de PostgreSQL corriendo localmente.
* `ngrok` (o similar) para exponer el endpoint de webhooks del backend durante el desarrollo local.

### Backend
1.  Clona el repositorio: `git clone [URL_DE_TU_REPOSITORIO_AQUI]`
2.  Navega al directorio del backend: `cd backend`
3.  Crea un archivo `.env` basado en `.env.example`  con las siguientes variables:
    * `DB_HOST=localhost`
    * `DB_PORT=5432`
    * `DB_USERNAME=tu_usuario_postgres_local`
    * `DB_PASSWORD=tu_password_postgres_local`
    * `DB_DATABASE=nombre_tu_bd_local`
    * `PAYMENT_GATEWAY_PUBLIC_KEY=pub_stagtest_...` *(llave pública de la pasarela)*
    * `PAYMENT_GATEWAY_PRIVATE_KEY=prv_stagtest_...` *(llave privada de la pasarela)*
    * `PAYMENT_GATEWAY_EVENTS_SECRET_KEY=stagtest_events_...` *(llave de secretos de eventos)*
    * `PAYMENT_GATEWAY_INTEGRITY_KEY=stagtest_integrity_...` *(llave de integridad de transacciones, si es diferente a la de eventos)*
    * `FRONTEND_BASE_URL=http://localhost:3000` *(puerto del frontend local)*
4.  Instala las dependencias: `npm install`
5.  Asegúrate de que la opción `synchronize: true` esté activa en la configuración de TypeORM (`app.module.ts`) para desarrollo.
6.  Inicia el servidor de desarrollo: `npm run start:dev`
    El backend estará disponible en `http://localhost:4000` (o el puerto configurado).

### Frontend
1.  Navega al directorio del frontend: `cd frontend`
2.  Crea un archivo `.env` si necesitas configurar `REACT_APP_API_URL` para desarrollo local:
    * `REACT_APP_API_URL=http://localhost:4000`
3.  Instala las dependencias: `npm install`
4.  Inicia el servidor de desarrollo: `npm start`
    El frontend estará disponible en `http://localhost:3000` (o el puerto que configure React).

## Diseño de la API (Endpoints Principales Implementados)

* **Productos:**
    * `GET /products`: Obtiene la lista de todos los productos.
* **Pagos/Órdenes:**
    * `POST /api/create-wompi-transaction`: Inicia una nueva transacción de pago.
    * `POST /api/wompi-webhook`: Endpoint para recibir notificaciones de la pasarela de pagos. 
    * `GET /api/orders/by-wompi-id/:paymentGatewayTransactionId`: Consulta el estado de una orden usando el ID de la transacción de la pasarela.
* **Clientes:**
    * `GET /api/customers`: Obtiene la lista de todos los clientes.
* **Entregas:**
    * `GET /api/deliveries`: Obtiene la lista de todas las entregas.

## Esquema de la Base de Datos (Entidades Principales)

* **Product:** `id` (uuid), `name` (string), `description` (text), `price` (decimal), `stock` (int), `createdAt` (timestamp), `updatedAt` (timestamp). 
* **Order (Transacción):** `id` (string, referencia interna, PK), `productId` (uuid), `customerId` (uuid, FK a Customer), `amount` (number, en centavos), `status` (string: PENDING, APPROVED, DECLINED), `wompiTransactionId` (string, ID de la pasarela), `customerEmail` (string), `metadata` (jsonb, para detalles de entrega), `createdAt` (timestamp), `updatedAt` (timestamp).
* **Customer:** `id` (uuid), `name` (string), `email` (string, unique), `phone` (string, nullable), `createdAt` (timestamp), `updatedAt` (timestamp).
* **Delivery:** `id` (uuid), `orderId` (string, FK a Order), `customerId` (uuid, FK a Customer), `customerNameForDelivery` (string), `address` (string), `city` (string), `phone` (string, nullable), `status` (enum: PENDING_SHIPMENT, etc.), `createdAt` (timestamp), `updatedAt` (timestamp).
