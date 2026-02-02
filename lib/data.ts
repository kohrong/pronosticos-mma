import { promises as fs } from 'fs'
import path from 'path'
import type {
  EventosData,
  PeleadoresData,
  ParticipantesData,
  Evento,
  Peleador,
  Participante,
  RankingEntry
} from '@/types'
import { wilsonScore } from './wilson'

const DATA_DIR = path.join(process.cwd(), 'datos')

// Cache para evitar leer archivos repetidamente
let eventosCache: EventosData | null = null
let peleadoresCache: PeleadoresData | null = null
let participantesCache: ParticipantesData | null = null

export async function getEventos(): Promise<Evento[]> {
  if (!eventosCache) {
    const filePath = path.join(DATA_DIR, 'pronosticos.json')
    const data = await fs.readFile(filePath, 'utf-8')
    eventosCache = JSON.parse(data)
  }
  return eventosCache!.eventos
}

export async function getPeleadores(): Promise<Record<string, Peleador>> {
  if (!peleadoresCache) {
    const filePath = path.join(DATA_DIR, 'peleadores.json')
    const data = await fs.readFile(filePath, 'utf-8')
    peleadoresCache = JSON.parse(data)
  }
  return peleadoresCache!.peleadores
}

export async function getParticipantes(): Promise<Record<string, Participante>> {
  if (!participantesCache) {
    const filePath = path.join(DATA_DIR, 'participantes.json')
    const data = await fs.readFile(filePath, 'utf-8')
    participantesCache = JSON.parse(data)
  }
  return participantesCache!.participantes
}

export function getNombrePeleador(
  peleadores: Record<string, Peleador>,
  id: string
): string {
  return peleadores[id]?.nombre ?? id
}

export function getFotoPeleador(
  peleadores: Record<string, Peleador>,
  id: string
): string | null {
  return peleadores[id]?.foto ?? null
}

/**
 * Calcula estadísticas de los participantes "especiales" (del JSON)
 */
export async function calculateSpecialRanking(): Promise<RankingEntry[]> {
  const eventos = await getEventos()
  const participantes = await getParticipantes()

  const stats: Record<string, RankingEntry> = {}

  // Inicializar stats para cada participante
  Object.entries(participantes).forEach(([id, p]) => {
    stats[id] = {
      id,
      nombre: p.nombre,
      avatar: p.avatar || 'assets/logo.jpeg',
      aciertos: 0,
      total: 0,
      porcentaje: 0,
      wilsonScore: 0,
      isSpecial: true
    }
  })

  // Iterar por eventos y peleas
  eventos.forEach(evento => {
    evento.peleas.forEach(pelea => {
      const ganadorReal = pelea.ganador
      if (!ganadorReal) return

      Object.entries(pelea.pronosticos).forEach(([participanteId, pronostico]) => {
        if (stats[participanteId]) {
          stats[participanteId].total++
          if (pronostico === ganadorReal) {
            stats[participanteId].aciertos++
          }
        }
      })
    })
  })

  // Calcular porcentajes y Wilson Score
  Object.values(stats).forEach(s => {
    s.porcentaje = s.total > 0 ? (s.aciertos / s.total) * 100 : 0
    s.wilsonScore = wilsonScore(s.aciertos, s.total)
  })

  // Ordenar por Wilson Score y filtrar los que tienen pronósticos
  return Object.values(stats)
    .filter(s => s.total > 0)
    .sort((a, b) => b.wilsonScore - a.wilsonScore)
}

/**
 * Verifica si un evento está abierto para pronósticos
 */
export function isEventOpen(evento: Evento): boolean {
  if (!evento.hora) {
    // Si no hay hora, usar solo la fecha (asumimos inicio a las 00:00)
    const eventDate = new Date(evento.fecha + 'T00:00:00')
    return new Date() < eventDate
  }

  const timezone = evento.timezone || 'America/New_York'
  const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`)

  // Convertir a la zona horaria correcta si es necesario
  return new Date() < eventDateTime
}

/**
 * Invalida el cache (útil después de actualizar datos)
 */
export function invalidateCache() {
  eventosCache = null
  peleadoresCache = null
  participantesCache = null
}
