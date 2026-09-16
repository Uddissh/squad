export const metadata = { title: 'Squad' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui', background: '#0f1115', color: '#e6e6e6', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
