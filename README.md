Instrucciones de Instalación y Configuración
Requisitos Previos

Node.js (versión 18 o superior)
PostgreSQL (versión 12 o superior)
npm o yarn

Configuración de Base de Datos

Crear una base de datos PostgreSQL llamada bingo_game
Configurar las credenciales de conexión en el archivo .env del backend

Clonar el Repositorio
bashCopygit clone <url-del-repositorio>
cd <nombre-del-proyecto>
Configuración del Backend (NestJS)

Navegar al directorio del backend

bashCopycd backend

Instalar dependencias

bashCopynpm install

Configurar variables de entorno


Crear un archivo .env con la siguiente configuración:

CopyDB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=bingo_game
JWT_SECRET=tu_secreto_jwt

Ejecutar migraciones (si aplica)

bashCopynpm run migration:run

Iniciar el servidor backend

bashCopynpm run start:dev

El servidor correrá en http://localhost:3000

