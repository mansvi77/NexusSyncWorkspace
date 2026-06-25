import './globals.css'

export const metadata = {
  title: 'SyncMind',
  description: 'AI Meeting Intelligence',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: '#0f1117', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}