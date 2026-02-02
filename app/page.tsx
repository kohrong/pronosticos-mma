import { getEventos, getPeleadores, getParticipantes, calculateSpecialRanking } from '@/lib/data'
import { RankingTable } from '@/components/RankingTable'
import { EventListStatic } from '@/components/EventListStatic'

export const revalidate = 60

export default async function Home() {
  const [eventos, peleadores, participantes, ranking] = await Promise.all([
    getEventos(),
    getPeleadores(),
    getParticipantes(),
    calculateSpecialRanking(),
  ])

  return (
    <>
      <header>
        <div className="header-content">
          <div className="header-left">
            <img src="/assets/logo.jpeg" alt="Locos x las MMA" className="logo" />
            <div className="header-text">
              <h1>Locos x las MMA</h1>
              <p className="subtitle">Ranking de Pronósticos UFC - ¿Quién acierta más?</p>
            </div>
          </div>
        </div>
      </header>

      <main>
        <RankingTable ranking={ranking} />

        <EventListStatic
          eventos={eventos}
          peleadores={peleadores}
          participantes={participantes}
        />
      </main>

      <footer>
        <p>
          <a href="https://www.youtube.com/@LocosxlasMMA" target="_blank" rel="noopener noreferrer">
            YouTube
          </a>{' '}
          |{' '}
          <a href="https://www.instagram.com/locosxlasmma" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        </p>
        <p className="copyright">© 2025 Locos x las MMA</p>
      </footer>
    </>
  )
}
