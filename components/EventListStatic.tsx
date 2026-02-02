'use client'

import { useState } from 'react'
import type { Evento, Peleador, Participante } from '@/types'

interface EventListStaticProps {
  eventos: Evento[]
  peleadores: Record<string, Peleador>
  participantes: Record<string, Participante>
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function EventListStatic({ eventos, peleadores, participantes }: EventListStaticProps) {
  const [filter, setFilter] = useState('all')
  const [expandedEvents, setExpandedEvents] = useState<Record<string, boolean>>({})

  const getNombrePeleador = (id: string) => peleadores[id]?.nombre ?? id
  const getFotoPeleador = (id: string) => peleadores[id]?.foto ?? null

  // Ordenar eventos por fecha (más recientes primero)
  const sortedEvents = [...eventos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )

  const filteredEvents =
    filter === 'all'
      ? sortedEvents
      : sortedEvents.filter((e) => e.nombre === filter)

  const toggleEvent = (nombre: string) => {
    setExpandedEvents(prev => ({ ...prev, [nombre]: !prev[nombre] }))
  }

  return (
    <section className="history-section">
      <h2>
        <span className="icon">📅</span> Historial de Eventos
      </h2>

      <div className="filter-container">
        <label htmlFor="event-filter">Filtrar por evento:</label>
        <select
          id="event-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todos los eventos</option>
          {sortedEvents.map((evento) => (
            <option key={evento.nombre} value={evento.nombre}>
              {evento.nombre} - {formatDate(evento.fecha)}
            </option>
          ))}
        </select>
      </div>

      <div id="events-container">
        {filteredEvents.map((evento) => {
          const isExpanded = expandedEvents[evento.nombre] || false

          return (
            <div key={evento.nombre} className="event-card">
              <div
                className={`event-header ${isExpanded ? '' : 'collapsed'}`}
                onClick={() => toggleEvent(evento.nombre)}
              >
                <div className="event-header-left">
                  <span className="expand-icon">▼</span>
                  <span className="event-name">{evento.nombre}</span>
                </div>
                <span className="event-date">{formatDate(evento.fecha)}</span>
              </div>

              <div className={`event-body ${isExpanded ? '' : 'collapsed'}`}>
                {evento.peleas.map((pelea, peleaIndex) => {
                  const nombre1 = getNombrePeleador(pelea.peleador1)
                  const nombre2 = getNombrePeleador(pelea.peleador2)
                  const foto1 = getFotoPeleador(pelea.peleador1)
                  const foto2 = getFotoPeleador(pelea.peleador2)
                  const isP1Winner = pelea.ganador === pelea.peleador1
                  const isP2Winner = pelea.ganador === pelea.peleador2

                  const predictions = Object.entries(pelea.pronosticos).map(([id, pick]) => {
                    const participante = participantes[id]
                    const hasResult = pelea.ganador !== null
                    const isCorrect = hasResult && pick === pelea.ganador

                    return {
                      id,
                      nombre: participante?.nombre || id,
                      avatar: participante?.avatar || '/assets/logo.jpeg',
                      pick: getNombrePeleador(pick),
                      pickFoto: getFotoPeleador(pick),
                      isCorrect,
                      hasResult,
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
                              }`}
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
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
