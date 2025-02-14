"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "../lib/firebase"
import { useRouter, usePathname } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (!userDoc.exists() || !userDoc.data().setupCompleted) {
          router.push("/setup")
        } else if (pathname === "/login") {
          router.push("/blog")
        }
      }
    })

    return () => unsubscribe()
  }, [router, pathname])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)

