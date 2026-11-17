# API Aerolínea

API REST con Express para gestionar pilotos, vehículos (aviones) y asignaciones de vuelo.
Los datos se guardan en archivos JSON dentro de `src/data/`.

## Instalación

    npm install

## Ejecución

    npm run dev

El servidor corre en http://localhost:4000

## Estructura

    src/
    ├── routers/       Rutas HTTP
    ├── controllers/   Manejo de petición y códigos HTTP
    ├── services/      Reglas de negocio y validaciones
    ├── models/        Lectura y escritura de los JSON
    ├── data/          Archivos JSON de almacenamiento
    └── app.js         Punto de entrada

## Endpoints

| Recurso | Ruta |
|---|---|
| Pilotos | /api/pilotos |
| Vehículos | /api/vehiculos |
| Asignaciones | /api/asignacion |

Cada recurso tiene GET (todos), GET por id, POST, PUT por id y DELETE por id.

## Pruebas

Importa `pruebas-api.postman_collection.json` en Postman y ejecuta la colección.