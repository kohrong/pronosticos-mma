// Tipos para peleadores
export interface Peleador {
  nombre: string
  apodo: string | null
  foto: string
}

export interface PeleadoresData {
  peleadores: Record<string, Peleador>
}

// Tipos para participantes (usuarios especiales del JSON)
export interface Participante {
  nombre: string
  avatar: string
}

export interface ParticipantesData {
  participantes: Record<string, Participante>
}

// Tipos para eventos y peleas
export interface Pelea {
  peleador1: string
  peleador2: string
  ganador: string | null
  pronosticos: Record<string, string>
}

export interface Evento {
  nombre: string
  fecha: string
  hora?: string // Hora de inicio del evento
  timezone?: string // Zona horaria
  peleas: Pelea[]
}

export interface EventosData {
  eventos: Evento[]
}

// Tipos para el ranking
export interface RankingEntry {
  id: string
  nombre: string
  avatar: string
  aciertos: number
  total: number
  porcentaje: number
  wilsonScore: number
  isSpecial: boolean // true = del JSON, false = usuario registrado
}

// Tipos para pronósticos de usuario (de la BD)
export interface UserPredictionInput {
  eventoId: string
  peleaIndex: number
  peleadorElegido: string
}
