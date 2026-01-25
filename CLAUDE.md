# CLAUDE.md - Sistema de Clasificación de Pronósticos

## Descripción

Web estática que muestra una clasificación de aciertos en pronósticos de peleas UFC. Usa Wilson Score para rankings justos que penalizan muestras pequeñas.

## Estructura

```
web-pronosticos/
├── index.html              # Página principal
├── css/styles.css          # Estilos
├── js/app.js               # Lógica de la aplicación
├── datos/
│   ├── peleadores.json     # Base de datos de peleadores
│   ├── participantes.json  # Base de datos de participantes
│   └── pronosticos.json    # Eventos y peleas con pronósticos
└── assets/
    ├── logo.jpeg           # Logo del canal
    ├── participantes/      # Fotos de participantes
    └── peleadores/         # Fotos de peleadores
```

## Modelo de Datos

### peleadores.json
```json
{
  "peleadores": {
    "nombre-apellido": {
      "nombre": "Nombre Completo",
      "apodo": "Apodo",
      "foto": "peleadores/nombre-apellido.jpg"
    }
  }
}
```

### participantes.json
```json
{
  "participantes": {
    "slug-id": {
      "nombre": "Nombre Visible",
      "avatar": "assets/avatares/slug-id.png"
    }
  }
}
```

### pronosticos.json
```json
{
  "eventos": [
    {
      "nombre": "UFC XXX",
      "fecha": "YYYY-MM-DD",
      "peleas": [
        {
          "peleador1": "id-peleador-1",
          "peleador2": "id-peleador-2",
          "ganador": "id-peleador-ganador",
          "pronosticos": {
            "participante-id": "id-peleador-elegido"
          }
        }
      ]
    }
  ]
}
```

## Agregar Nuevo Evento

1. Agregar peleadores nuevos a `datos/peleadores.json` si no existen
2. En `datos/pronosticos.json`, agregar al array `eventos`:
```json
{
  "nombre": "UFC XXX",
  "fecha": "2026-XX-XX",
  "peleas": [
    {
      "peleador1": "id-peleador-1",
      "peleador2": "id-peleador-2",
      "ganador": null,
      "pronosticos": {
        "josue": "id-peleador",
        "yared": "id-peleador"
      }
    }
  ]
}
```
3. Después del evento, actualizar `ganador` con el ID del peleador ganador

## Agregar Nuevo Participante

En `datos/participantes.json`, agregar al objeto `participantes`:
```json
"nombre-slug": {
  "nombre": "Nombre Visible",
  "avatar": "assets/avatares/nombre-slug.png"
}
```

## Convenciones

- **IDs de peleadores:** `nombre-apellido` en minúsculas con guiones (ej: `paddy-pimblett`)
- **IDs de participantes:** slug en minúsculas (ej: `josue`, `fight-radar`)
- **Fechas:** formato ISO `YYYY-MM-DD`
- **Fotos peleadores:** `assets/peleadores/{id}.jpg`
- **Fotos participantes:** `assets/participantes/{id}.png`

## Wilson Score

El ranking usa Wilson Score en lugar de porcentaje simple para ser justo con participantes con pocos pronósticos. Un participante con 1/1 (100%) no superará a uno con 8/10 (80%).

Fórmula: Lower bound del intervalo de confianza binomial al 95%.
