Instrucciones de Instalación y Configuración
Requisitos Previos

Node.js (versión 18 o superior)
PostgreSQL (versión 12 o superior)
npm o yarn

Configuración de Base de Datos

Crear una base de datos PostgreSQL llamada bingo_game

Configuración del Backend (NestJS)

Navegar al directorio del backend

bashCopycd backend

Instalar dependencias

npm install

Configurar variables de entorno


Crear un archivo .env con la siguiente configuración:

# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=emmanuelc1903
DB_DATABASE=bingo_db

# Configuración Google OAuth
GOOGLE_CLIENT_ID=500186948880-ram97v29ciqak6ku50vmh4r6teb9p7j4.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT
JWT_SECRET=10b6a1663f214be877dc6ce16e870bf4099db31f3d2f22a241abdefdb0c2a133d0f2c0e58bcbcd7ddfb2ba348d1f289275f1beea5c291f1ac235da352087751568f27bb314668931695896dea9932e04bc1df90d57aa91551dc4b8586171774b746b9b296046e675e2a6a638a2997fc8f009a7c7a2387fa98f8e2472c4515f160894540fb7d179c86981b221a7b97ce7ddb8ea7f035a921bdb869ec48a88790d9920fd54cba1d1f50da6d00a5a6d12e415c5ca4a63a55d0648df92522ff6c16593c644dd845eb27c1c4ca2b60f6727a8fd679ccc4f450a54a53cfc1e987d5950082b8f00e70603e1574926a4dc6c2deec9f1926745a52a1e6432e8237df0f9e1


NODE_ENV=develop

cree la base de datos postgresql.


Iniciar el servidor backend

bashCopynpm run start:dev

El servidor correrá en http://localhost:3000

