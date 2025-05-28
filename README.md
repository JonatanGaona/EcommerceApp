# Aplicación de Proceso de Compra con Pasarela de Pagos

Esta aplicación demuestra un flujo de onboarding para la compra de un producto, integrando una pasarela de pagos externa. El sistema permite a los usuarios ver productos, ingresar datos de pago y entrega, procesar la transacción a través del servicio de pagos y ver el resultado, actualizando el stock correspondiente en la base de datos local.

## Tecnologías Utilizadas

**Backend:**
* **Framework:** NestJS (TypeScript)
* **Base de Datos:** PostgreSQL
* **ORM:** TypeORM
* **Procesamiento de Pagos:** Integración con Pasarela de Pagos Externa (Modo Sandbox)
* **Librerías Principales:** `axios` (para llamadas HTTP a la pasarela)

**Frontend:**
* **Librería:** ReactJS
* **Manejo de Estado:** Redux
* **Enrutamiento:** React Router DOM
* **Estilos:** CSS plano con Flexbox/Grid (principalmente a través de estilos en línea y en componentes React)
* **Librerías Principales:** `fetch` (para llamadas API al backend)

## Características Implementadas

* Visualización de catálogo de productos con información de stock.
* Interfaz para la selección de productos.
* Modal de pago para el ingreso de datos de tarjeta de crédito (simulados y validados según formato estándar) e información de entrega.
* Presentación de un resumen de la compra antes de la confirmación final del pago.
* Integración con la API de una Pasarela de Pagos externa (en modo Sandbox) para el procesamiento de la transacción.
    * Creación de una transacción local (orden) en estado PENDIENTE.
    * Comunicación con la API de la Pasarela de Pagos para iniciar la transacción.
    * Recepción de notificaciones (webhooks) desde la Pasarela de Pagos para la confirmación del estado final de la transacción.
    * Verificación de la firma de los webhooks para asegurar la integridad y autenticidad de la notificación.
* Actualización del estado de la transacción (orden) en la base de datos del backend (`APPROVED`, `DECLINED`).
* Reducción automática del stock del producto tras una compra aprobada.
* Visualización del estado final de la transacción en una página de estado en el frontend.
* Actualización de la vista de productos en el frontend para reflejar el stock modificado después de una compra.
* Resiliencia en el formulario de pago usando `localStorage`.
* Entidades y API básicas para Clientes y Entregas.

## Configuración y Ejecución Local

### Prerrequisitos
* Node.js (v18.x o superior recomendado)
* `npm` o `yarn`
* Una instancia de PostgreSQL corriendo localmente o accesible.
* `ngrok` (o una herramienta similar) para exponer el endpoint de webhooks del backend durante el desarrollo local.

### Backend
1.  Clona el repositorio: `git clone [URL_DE_TU_REPOSITORIO_AQUI]`
2.  Navega al directorio del backend: `cd backend`
3.  Copia el archivo `.env.example` (si existe) a `.env`, o crea un archivo `.env`.
4.  Configura las siguientes variables de entorno en el archivo `.env`:
    * `DB_HOST=localhost`
    * `DB_PORT=5432`
    * `DB_USERNAME=tu_usuario_postgres`
    * `DB_PASSWORD=tu_password_postgres`
    * `DB_DATABASE=nombre_tu_bd_ecommerce`
    * `PAYMENT_GATEWAY_PUBLIC_KEY=pub_stagtest_...` *(llave pública genérica)*
    * `PAYMENT_GATEWAY_PRIVATE_KEY=prv_stagtest_...` *(llave privada genérica)*
    * `PAYMENT_GATEWAY_EVENTS_SECRET_KEY=stagtest_events_...` *(llave de eventos genérica)*
    * `PAYMENT_GATEWAY_INTEGRITY_KEY=stagtest_integrity_...` *(llave de integridad de transacción genérica)*
    * `FRONTEND_BASE_URL=http://localhost:3000` *(o el puerto del frontend)*
5.  Instala las dependencias: `npm install`
6.  Asegúrate de que la opción `synchronize: true` esté activa en la configuración de TypeORM (`app.module.ts`) para la creación automática de tablas en desarrollo.
7.  Inicia el servidor de desarrollo: `npm run start:dev`
    El backend estará disponible en `http://localhost:4000` (o el puerto configurado en `main.ts`).

### Frontend
1.  Navega al directorio del frontend: `cd frontend`
2.  (Opcional) Si usas variables de entorno en el frontend, configura tu archivo `.env` (ej. `REACT_APP_API_URL=http://localhost:4000`).
3.  Instala las dependencias: `npm install` (o `yarn install`)
4.  Inicia el servidor de desarrollo: `npm start` (o `yarn start`)
    El frontend estará disponible en `http://localhost:3000` (o el puerto que configure React).

## Diseño de la API (Endpoints Principales)

* **Productos:**
    * `GET /products`: Obtiene la lista de todos los productos.
* **Pagos/Órdenes:**
    * `POST /api/create-wompi-transaction`: Inicia una nueva transacción de pago (este nombre podría generalizarse a `/api/create-transaction`).
    * `POST /api/wompi-webhook`: Endpoint para recibir notificaciones de la pasarela de pagos (este nombre podría generalizarse a `/api/payment-webhook`).
    * `GET /api/orders/by-wompi-id/:paymentGatewayTransactionId`: Consulta el estado de una orden usando el ID de la pasarela (implementado).
* **Clientes (En Progreso):**
    * `GET /api/customers`
    * `GET /api/customers/:id`
* **Entregas (En Progreso):**
    * `GET /api/deliveries`
    * `GET /api/deliveries/by-order/:orderId`

## Esquema de la Base de Datos

* **Product:** `id` (uuid), `name` (string), `description` (text), `price` (number), `stock` (number).
* **Order (Transacción):** `id` (string, referencia interna, PK), `productId` (uuid, FK a Product), `amount` (number, en centavos), `status` (string: PENDING, APPROVED, DECLINED), `wompiTransactionId` (string, ID de la pasarela), `customerEmail` (string), `createdAt` (timestamp), `updatedAt` (timestamp).
* **Customer (En Progreso):** `id` (uuid), `name` (string), `email` (string), `phone` (string).
* **Delivery (En Progreso):** `id` (uuid), `orderId` (string, FK a Order), `customerId` (uuid, FK a Customer), `address` (string), `city` (string), `status` (string: PENDING_SHIPMENT, SHIPPED, DELIVERED).
