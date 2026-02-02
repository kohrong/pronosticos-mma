import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import './globals.css'
import { SessionProvider } from './providers'

const roboto = Roboto({
  weight: ['400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ranking de Pronósticos UFC | Locos x las MMA',
  description: 'Clasificación de pronósticos de peleas UFC - ¿Quién acierta más?',
  icons: {
    icon: '/assets/favicon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={roboto.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
