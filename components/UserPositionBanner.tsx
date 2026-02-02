import type { RankingEntry } from '@/types'

interface UserPositionBannerProps {
  user: {
    id: string
    name?: string | null
    image?: string | null
  }
  ranking: RankingEntry[]
}

export function UserPositionBanner({ user, ranking }: UserPositionBannerProps) {
  const userEntry = ranking.find((r) => r.id === user.id)
  const position = userEntry ? ranking.indexOf(userEntry) + 1 : null

  if (!userEntry) {
    return (
      <div className="user-position-banner">
        <div className="user-position-info">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || 'Usuario'}
              className="user-position-avatar"
            />
          )}
          <div className="user-position-text">
            <span className="user-position-name">{user.name || 'Usuario'}</span>
            <span className="user-position-rank" style={{ color: 'var(--text-secondary)' }}>
              Sin pronósticos aún
            </span>
          </div>
        </div>
        <div className="user-position-stats">
          <div className="user-stat">
            <span className="user-stat-value">0</span>
            <span className="user-stat-label">Aciertos</span>
          </div>
          <div className="user-stat">
            <span className="user-stat-value">0</span>
            <span className="user-stat-label">Total</span>
          </div>
          <div className="user-stat">
            <span className="user-stat-value">--%</span>
            <span className="user-stat-label">Porcentaje</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="user-position-banner">
      <div className="user-position-info">
        <img
          src={userEntry.avatar}
          alt={userEntry.nombre}
          className="user-position-avatar"
        />
        <div className="user-position-text">
          <span className="user-position-name">{userEntry.nombre}</span>
          <span className="user-position-rank">#{position}</span>
        </div>
      </div>
      <div className="user-position-stats">
        <div className="user-stat">
          <span className="user-stat-value">{userEntry.aciertos}</span>
          <span className="user-stat-label">Aciertos</span>
        </div>
        <div className="user-stat">
          <span className="user-stat-value">{userEntry.total}</span>
          <span className="user-stat-label">Total</span>
        </div>
        <div className="user-stat">
          <span className="user-stat-value">{userEntry.porcentaje.toFixed(1)}%</span>
          <span className="user-stat-label">Porcentaje</span>
        </div>
      </div>
    </div>
  )
}
