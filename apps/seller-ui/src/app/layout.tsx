import './global.css';

export const metadata = {
  title: 'Doc24x7 Seller',
  description: 'A platform for sellers to manage their products and orders',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
