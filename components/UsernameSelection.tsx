"use client"

import { useState } from "react"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface UsernameSelectionProps {
  userId: string
  onComplete: (username: string) => void
}

export function UsernameSelection({ userId, onComplete }: UsernameSelectionProps) {
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username.length > 25) {
      setError("სახელი უნდა იყოს 25 სიმბოლოზე ნაკლები")
      return
    }

    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists() && userSnap.data().username === username) {
      setError("ეს სახელი უკვე დაკავებულია")
      return
    }

    await setDoc(userRef, { username }, { merge: true })
    onComplete(username)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold text-center">რა გქვიათ?</h2>
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="შეიყვანეთ თქვენი სახელი"
          maxLength={25}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full">
          სახელის დაყენება
        </Button>
      </form>
    </motion.div>
  )
}

