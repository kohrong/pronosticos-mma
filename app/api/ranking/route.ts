import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getEventos, calculateSpecialRanking } from '@/lib/data'
import { wilsonScore } from '@/lib/wilson'
import type { RankingEntry } from '@/types'

// GET /api/ranking - Obtener ranking combinado (especiales + usuarios)
export async function GET() {
  try {
    // 1. Obtener ranking de los especiales (del JSON)
    const specialRanking = await calculateSpecialRanking()

    // 2. Obtener todos los pronósticos de usuarios de la BD
    const userPredictions = await prisma.userPrediction.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // 3. Obtener eventos para calcular ganadores
    const eventos = await getEventos()

    // 4. Calcular stats para usuarios registrados
    const userStats: Record<string, RankingEntry> = {}

    userPredictions.forEach((prediction) => {
      const userId = prediction.userId

      // Inicializar si no existe
      if (!userStats[userId]) {
        userStats[userId] = {
          id: userId,
          nombre: prediction.user.name || 'Usuario',
          avatar: prediction.user.image || '/assets/logo.jpeg',
          aciertos: 0,
          total: 0,
          porcentaje: 0,
          wilsonScore: 0,
          isSpecial: false,
        }
      }

      // Buscar el evento y la pelea
      const evento = eventos.find((e) => e.nombre === prediction.eventoId)
      if (!evento) return

      const pelea = evento.peleas[prediction.peleaIndex]
      if (!pelea || !pelea.ganador) return

      // Contar aciertos
      userStats[userId].total++
      if (prediction.peleadorElegido === pelea.ganador) {
        userStats[userId].aciertos++
      }
    })

    // 5. Calcular porcentajes y Wilson Score para usuarios
    Object.values(userStats).forEach((s) => {
      s.porcentaje = s.total > 0 ? (s.aciertos / s.total) * 100 : 0
      s.wilsonScore = wilsonScore(s.aciertos, s.total)
    })

    // 6. Combinar rankings (especiales + usuarios)
    const combinedRanking: RankingEntry[] = [
      ...specialRanking,
      ...Object.values(userStats).filter((s) => s.total > 0),
    ]

    // 7. Ordenar por Wilson Score
    combinedRanking.sort((a, b) => b.wilsonScore - a.wilsonScore)

    return NextResponse.json({ ranking: combinedRanking })
  } catch (error) {
    console.error('Error calculating ranking:', error)
    return NextResponse.json(
      { error: 'Error al calcular ranking' },
      { status: 500 }
    )
  }
}
