import "../styles/globals.css"
import { Inter } from "next/font/google"
import { AuthProvider } from "../components/AuthProvider"
import { Header } from "../components/Header"
import { ThemeProvider } from "../components/ThemeProvider"
import type { Metadata } from "next"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ZeForum - ზესტაფონის ფორუმი",
  description: "ჩვენი ქალაქის პრობლემების განხილვის პლატფორმა - სკოლის მოსწავლეთა პროექტი"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo.jpg" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Header />
              <main>{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

import "./globals.css"



import './globals.css'