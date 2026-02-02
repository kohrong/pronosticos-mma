import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getEventos, isEventOpen } from '@/lib/data'

// GET /api/predictions - Obtener pronósticos del usuario actual
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const predictions = await prisma.userPrediction.findMany({
      where: { userId: session.user.id },
      select: {
        eventoId: true,
        peleaIndex: true,
        peleadorElegido: true,
      },
    })

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return NextResponse.json(
      { error: 'Error al obtener pronósticos' },
      { status: 500 }
    )
  }
}

// POST /api/predictions - Guardar un pronóstico
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { eventoId, peleaIndex, peleadorElegido } = body

    if (!eventoId || peleaIndex === undefined || !peleadorElegido) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // Verificar que el evento existe y está abierto
    const eventos = await getEventos()
    const evento = eventos.find((e) => e.nombre === eventoId)

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento no encontrado' },
        { status: 404 }
      )
    }

    if (!isEventOpen(evento)) {
      return NextResponse.json(
        { error: 'El evento ya está cerrado para pronósticos' },
        { status: 403 }
      )
    }

    // Verificar que la pelea existe
    if (peleaIndex < 0 || peleaIndex >= evento.peleas.length) {
      return NextResponse.json(
        { error: 'Pelea no encontrada' },
        { status: 404 }
      )
    }

    const pelea = evento.peleas[peleaIndex]

    // Verificar que el peleador elegido es válido
    if (peleadorElegido !== pelea.peleador1 && peleadorElegido !== pelea.peleador2) {
      return NextResponse.json(
        { error: 'Peleador no válido para esta pelea' },
        { status: 400 }
      )
    }

    // Crear o actualizar el pronóstico
    const prediction = await prisma.userPrediction.upsert({
      where: {
        userId_eventoId_peleaIndex: {
          userId: session.user.id,
          eventoId,
          peleaIndex,
        },
      },
      update: {
        peleadorElegido,
      },
      create: {
        userId: session.user.id,
        eventoId,
        peleaIndex,
        peleadorElegido,
      },
    })

    return NextResponse.json({ prediction })
  } catch (error) {
    console.error('Error saving prediction:', error)
    return NextResponse.json(
      { error: 'Error al guardar pronóstico' },
      { status: 500 }
    )
  }
}
