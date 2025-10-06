import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Patricia Clinic - ระบบจัดการคลินิกเสริมความงาม',
  description: 'ระบบจัดการคลินิกเสริมความงามแบบครบวงจร',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
