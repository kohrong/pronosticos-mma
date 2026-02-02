'use client'

import { useState } from 'react'
import type { Evento, Peleador, Participante } from '@/types'
import { PredictionSelector } from './PredictionSelector'

interface EventCardProps {
  evento: Evento
  eventoIndex: number
  peleadores: Record<string, Peleador>
  participantes: Record<string, Participante>
  userPredictions?: Record<number, string> // peleaIndex -> peleadorElegido
  currentUserId?: string
  currentUserName?: string
  currentUserImage?: string
  isOpen: boolean
  onPredictionChange?: (peleaIndex: number, peleadorId: string) => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function EventCard({
  evento,
  eventoIndex,
  peleadores,
  participantes,
  userPredictions = {},
  currentUserId,
  currentUserName,
  currentUserImage,
  isOpen,
  onPredictionChange,
}: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getNombrePeleador = (id: string) => peleadores[id]?.nombre ?? id
  const getFotoPeleador = (id: string) => peleadores[id]?.foto ?? null

  return (
    <div className="event-card">
      <div
        className={`event-header ${isExpanded ? '' : 'collapsed'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="event-header-left">
          <span className="expand-icon">▼</span>
          <span className="event-name">{evento.nombre}</span>
          {isOpen && (
            <span className="event-status open">Abierto</span>
          )}
          {!isOpen && evento.peleas.some(p => p.ganador === null) && (
            <span className="event-status closed">Cerrado</span>
          )}
        </div>
        <span className="event-date">{formatDate(evento.fecha)}</span>
      </div>

      <div className={`event-body ${isExpanded ? '' : 'collapsed'}`}>
        {evento.peleas.map((pelea, peleaIndex) => {
          const ganadorReal = pelea.ganador
          const nombre1 = getNombrePeleador(pelea.peleador1)
          const nombre2 = getNombrePeleador(pelea.peleador2)
          const foto1 = getFotoPeleador(pelea.peleador1)
          const foto2 = getFotoPeleador(pelea.peleador2)
          const isP1Winner = pelea.ganador === pelea.peleador1
          const isP2Winner = pelea.ganador === pelea.peleador2

          // Combinar pronósticos del JSON con el del usuario actual
          const allPredictions = { ...pelea.pronosticos }
          if (currentUserId && userPredictions[peleaIndex]) {
            allPredictions[currentUserId] = userPredictions[peleaIndex]
          }

          const predictions = Object.entries(allPredictions).map(([id, pick]) => {
            const participante = participantes[id]
            const isCurrentUser = id === currentUserId
            const hasResult = ganadorReal !== null
            const isCorrect = hasResult && pick === ganadorReal
            const pickNombre = getNombrePeleador(pick)
            const pickFoto = getFotoPeleador(pick)

            return {
              id,
              nombre: isCurrentUser
                ? (currentUserName || 'Tú')
                : (participante?.nombre || id),
              avatar: isCurrentUser
                ? (currentUserImage || '/assets/logo.jpeg')
                : (participante?.avatar || '/assets/logo.jpeg'),
              pick: pickNombre,
              pickFoto,
              isCorrect,
              hasResult,
              isCurrentUser,
            }
          })

          return (
            <div key={peleaIndex} className="event-fight">
              <div className="fight-header">
                <div className="fight-info">
                  <span className="fight-matchup">
                    <span className={`fighter ${isP1Winner ? 'fighter-winner' : ''}`}>
                      {foto1 && (
                        <img
                          src={foto1}
                          alt={nombre1}
                          className="fighter-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}
                      {isP1Winner ? '🏆 ' : ''}{nombre1}
                    </span>
                    <span className="vs-label">vs</span>
                    <span className={`fighter ${isP2Winner ? 'fighter-winner' : ''}`}>
                      {foto2 && (
                        <img
                          src={foto2}
                          alt={nombre2}
                          className="fighter-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}
                      {isP2Winner ? '🏆 ' : ''}{nombre2}
                    </span>
                  </span>
                </div>
              </div>

              <div className="event-predictions">
                <div className="predictions-grid">
                  {predictions.map((pred) => (
                    <div
                      key={pred.id}
                      className={`prediction-item ${
                        pred.hasResult
                          ? pred.isCorrect
                            ? 'pick-correct'
                            : 'pick-wrong'
                          : 'pick-pending'
                      } ${pred.isCurrentUser ? 'is-current-user' : ''}`}
                      title={`${pred.nombre} → ${pred.pick}`}
                    >
                      <img
                        src={pred.avatar}
                        alt={pred.nombre}
                        className="prediction-avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/logo.jpeg'
                        }}
                      />
                      {pred.pickFoto && (
                        <img
                          src={pred.pickFoto}
                          alt={pred.pick}
                          className="pick-fighter-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Selector de pronóstico para usuarios logueados en eventos abiertos */}
              {isOpen && currentUserId && onPredictionChange && (
                <PredictionSelector
                  peleador1={{
                    id: pelea.peleador1,
                    nombre: nombre1,
                    foto: foto1,
                  }}
                  peleador2={{
                    id: pelea.peleador2,
                    nombre: nombre2,
                    foto: foto2,
                  }}
                  selectedPeleador={userPredictions[peleaIndex]}
                  onSelect={(peleadorId) => onPredictionChange(peleaIndex, peleadorId)}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
