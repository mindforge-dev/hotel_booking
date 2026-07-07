import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import QueryProvider from "@/components/providers/queryProvider"
import AuthProvider from "@/components/providers/session-provider"
import ThemeScript from "@/components/providers/theme-script"
import { WebSocketProvider } from "@/providers/webSocketProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hotel Booking",
  description: "Find and book your perfect stay",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="en" suppressHydrationWarning >
      <head>
        <ThemeScript />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider>
              <WebSocketProvider>
                {children}
              </WebSocketProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
