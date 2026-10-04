export const metadata = {
  title: 'Vibe Canvas Studio',
  description: 'Sanity Studio v3 for the Vibe Canvas spatial content system.',
}

export default function StudioRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
