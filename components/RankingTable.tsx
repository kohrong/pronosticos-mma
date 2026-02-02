'use client'

import type { RankingEntry } from '@/types'

interface RankingTableProps {
  ranking: RankingEntry[]
  currentUserId?: string
}

function getPercentageClass(percentage: number): string {
  if (percentage >= 70) return 'percentage-high'
  if (percentage >= 50) return 'percentage-mid'
  return 'percentage-low'
}

function getPositionClass(position: number): string {
  if (position === 1) return 'position-1'
  if (position === 2) return 'position-2'
  if (position === 3) return 'position-3'
  return 'position-other'
}

export function RankingTable({ ranking, currentUserId }: RankingTableProps) {
  return (
    <section className="ranking-section">
      <h2>
        <span className="icon">🏆</span> Clasificación General
      </h2>
      <div className="table-container">
        <table id="ranking-table">
          <thead>
            <tr>
              <th className="col-pos">#</th>
              <th className="col-nombre">Participante</th>
              <th className="col-aciertos">Aciertos</th>
              <th className="col-total">Total</th>
              <th className="col-porcentaje">%</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((entry, index) => {
              const position = index + 1
              const isCurrentUser = entry.id === currentUserId

              return (
                <tr
                  key={entry.id}
                  className={`${entry.isSpecial ? 'special-user' : ''} ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <td className="col-pos">
                    <span className={`position ${getPositionClass(position)}`}>
                      {position}
                    </span>
                  </td>
                  <td className="col-nombre">
                    <div className="participant-cell">
                      <img
                        src={entry.avatar}
                        alt={entry.nombre}
                        className="participant-avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/logo.jpeg'
                        }}
                      />
                      <span className="participant-name">
                        {entry.nombre}
                        {entry.isSpecial && (
                          <span className="special-badge">Creador</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="col-aciertos">{entry.aciertos}</td>
                  <td className="col-total">{entry.total}</td>
                  <td className="col-porcentaje">
                    <span className={getPercentageClass(entry.porcentaje)}>
                      {entry.porcentaje.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
