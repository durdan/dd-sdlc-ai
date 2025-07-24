import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import CookieConsent from "@/components/cookie-consent"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SDLC Automation Platform",
  description: "Transform ideas into complete project documentation with AI",
  generator: 'v0.dev',
  icons: {
    icon: '/img/sdlc-faviico.ico.png',
    shortcut: '/img/sdlc-faviico.ico.png',
    apple: '/img/sdlc-faviico.ico.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
}
