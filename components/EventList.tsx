'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import type { Evento, Peleador, Participante } from '@/types'
import { EventCard } from './EventCard'

interface EventListProps {
  eventos: Evento[]
  peleadores: Record<string, Peleador>
  participantes: Record<string, Participante>
}

interface UserPredictionsMap {
  [eventoId: string]: {
    [peleaIndex: number]: string
  }
}

export function EventList({ eventos, peleadores, participantes }: EventListProps) {
  const { data: session } = useSession()
  const [filter, setFilter] = useState('all')
  const [userPredictions, setUserPredictions] = useState<UserPredictionsMap>({})
  const [saving, setSaving] = useState(false)

  // Ordenar eventos por fecha (más recientes primero)
  const sortedEvents = [...eventos].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )

  const filteredEvents =
    filter === 'all'
      ? sortedEvents
      : sortedEvents.filter((e) => e.nombre === filter)

  // Cargar pronósticos del usuario
  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/predictions')
        .then((res) => res.json())
        .then((data) => {
          if (data.predictions) {
            const mapped: UserPredictionsMap = {}
            data.predictions.forEach((p: { eventoId: string; peleaIndex: number; peleadorElegido: string }) => {
              if (!mapped[p.eventoId]) {
                mapped[p.eventoId] = {}
              }
              mapped[p.eventoId][p.peleaIndex] = p.peleadorElegido
            })
            setUserPredictions(mapped)
          }
        })
        .catch(console.error)
    }
  }, [session?.user?.id])

  // Verificar si un evento está abierto
  const isEventOpen = useCallback((evento: Evento): boolean => {
    const now = new Date()
    if (evento.hora) {
      const eventDateTime = new Date(`${evento.fecha}T${evento.hora}`)
      return now < eventDateTime
    }
    // Si no hay hora, el evento cierra a las 00:00 del día del evento
    const eventDate = new Date(evento.fecha + 'T00:00:00')
    return now < eventDate
  }, [])

  // Guardar pronóstico
  const handlePredictionChange = useCallback(
    async (eventoId: string, peleaIndex: number, peleadorElegido: string) => {
      if (!session?.user?.id || saving) return

      setSaving(true)
      try {
        const response = await fetch('/api/predictions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventoId, peleaIndex, peleadorElegido }),
        })

        if (response.ok) {
          setUserPredictions((prev) => ({
            ...prev,
            [eventoId]: {
              ...prev[eventoId],
              [peleaIndex]: peleadorElegido,
            },
          }))
        }
      } catch (error) {
        console.error('Error saving prediction:', error)
      } finally {
        setSaving(false)
      }
    },
    [session?.user?.id, saving]
  )

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
              {evento.nombre} -{' '}
              {new Date(evento.fecha).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </option>
          ))}
        </select>
      </div>

      <div id="events-container">
        {filteredEvents.map((evento, index) => (
          <EventCard
            key={evento.nombre}
            evento={evento}
            eventoIndex={index}
            peleadores={peleadores}
            participantes={participantes}
            userPredictions={userPredictions[evento.nombre] || {}}
            currentUserId={session?.user?.id}
            currentUserName={session?.user?.name || undefined}
            currentUserImage={session?.user?.image || undefined}
            isOpen={isEventOpen(evento)}
            onPredictionChange={(peleaIndex, peleadorId) =>
              handlePredictionChange(evento.nombre, peleaIndex, peleadorId)
            }
          />
        ))}
      </div>
    </section>
  )
}
