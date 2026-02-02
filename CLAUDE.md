# CLAUDE.md - Sistema de Clasificación de Pronósticos

## Descripción

Aplicación Next.js con sistema de usuarios para clasificación de pronósticos de peleas UFC. Usa Wilson Score para rankings justos.

**Stack:** Next.js 14, NextAuth v5 (Google OAuth), Prisma, Vercel Postgres

## Estructura

```
web-pronosticos/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Layout principal
│   ├── page.tsx              # Homepage (ranking + eventos)
│   ├── globals.css           # Estilos globales
│   ├── providers.tsx         # SessionProvider
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth endpoints
│       ├── predictions/      # CRUD pronósticos usuario
│       └── ranking/          # Ranking combinado
├── components/               # Componentes React
│   ├── AuthButton.tsx        # Login/logout con Google
│   ├── RankingTable.tsx      # Tabla de clasificación
│   ├── EventCard.tsx         # Tarjeta de evento
│   ├── EventList.tsx         # Lista de eventos con filtro
│   ├── PredictionSelector.tsx # Selector de peleador
│   └── UserPositionBanner.tsx # Banner con posición del usuario
├── lib/
│   ├── auth.ts               # Configuración NextAuth
│   ├── db.ts                 # Cliente Prisma
│   ├── data.ts               # Cargar JSONs + utilidades
│   └── wilson.ts             # Función Wilson Score
├── prisma/
│   └── schema.prisma         # Esquema de BD
├── types/                    # Tipos TypeScript
├── datos/                    # JSON (sin cambios)
│   ├── pronosticos.json      # Eventos + pronósticos especiales
│   ├── peleadores.json       # Base de datos de peleadores
│   └── participantes.json    # Participantes especiales
└── public/assets/            # Imágenes
```

## Modelo de Datos

### pronosticos.json (con campos nuevos)
```json
{
  "eventos": [
    {
      "nombre": "UFC XXX",
      "fecha": "YYYY-MM-DD",
      "hora": "22:00",           // Hora de cierre de pronósticos
      "timezone": "America/New_York",
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

### Base de Datos (Prisma)
```
User              # Usuarios registrados (Google OAuth)
UserPrediction    # Pronósticos de usuarios (eventoId, peleaIndex, peleadorElegido)
```

## Flujos

### Usuario no logueado
- Ve ranking combinado (especiales + usuarios registrados)
- Ve historial de eventos
- Usuarios especiales (creadores) destacados con badge dorado

### Usuario logueado
- Todo lo anterior +
- Ve banner con su posición en el ranking
- Puede hacer pronósticos en eventos abiertos
- Sus pronósticos aparecen con borde cyan

### Cierre automático
- Pronósticos se cierran al llegar la hora+fecha del evento
- Sistema compara `Date.now()` con `fecha + hora` del evento

## Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Migraciones Prisma
npx prisma migrate dev
npx prisma generate
```

## Variables de Entorno

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## Agregar Nuevo Evento

1. Agregar peleadores nuevos a `datos/peleadores.json` si no existen
2. En `datos/pronosticos.json`, agregar al array `eventos`:
```json
{
  "nombre": "UFC XXX",
  "fecha": "2026-XX-XX",
  "hora": "22:00",
  "timezone": "America/New_York",
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

## Convenciones

- **IDs de peleadores:** `nombre-apellido` en minúsculas (ej: `paddy-pimblett`)
- **IDs de participantes:** slug en minúsculas (ej: `josue`, `fight-radar`)
- **Fechas:** formato ISO `YYYY-MM-DD`
- **Horas:** formato 24h `HH:MM`
- **Fotos peleadores:** `public/assets/peleadores/{id}.png`
- **Fotos participantes:** `public/assets/participantes/{id}.jpg`

## Wilson Score

Ranking por Wilson Score en lugar de porcentaje simple. Un participante con 1/1 (100%) no superará a uno con 8/10 (80%).

Fórmula: Lower bound del intervalo de confianza binomial al 95%.
