"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "../../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { FcGoogle } from "react-icons/fc"
import { toast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (isLogin) {
        await signIn(email, password)
        router.push("/blog")
      } else {
        const userCredential = await signUp(email, password)
        if (userCredential.user) {
          await setDoc(doc(db, "users", userCredential.user.uid), {
            email: userCredential.user.email,
            setupCompleted: false,
            createdAt: new Date(),
          })
          router.push("/setup")
        }
      }
    } catch (error) {
      console.error(error)
      setError("Authentication failed. Please check your credentials and try again.")
      toast({
        title: "Error",
        description: "Authentication failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle()
      if (result.user) {
        const userDoc = await getDoc(doc(db, "users", result.user.uid))
        if (!userDoc.exists() || !userDoc.data().setupCompleted) {
          await setDoc(
            doc(db, "users", result.user.uid),
            {
              email: result.user.email,
              setupCompleted: false,
              createdAt: new Date(),
            },
            { merge: true },
          )
          router.push("/setup")
        } else {
          router.push("/blog")
        }
      }
    } catch (error) {
      console.error(error)
      setError("Google Sign-In failed. Please try again.")
      toast({
        title: "Error",
        description: "Google Sign-In failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center overflow-x-hidden p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="mx-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isLogin ? "მოგესალმებით" : "შექმენით ანგარიში"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "შეიყვანეთ თქვენი მონაცემები ანგარიშზე შესასვლელად" : "შეავსეთ ფორმა ანგარიშის შესაქმნელად"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ელ. ფოსტა</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">პაროლი</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isLogin ? "შესვლა" : "რეგისტრაცია"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ან გააგრძელეთ</span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleSignIn}>
              <FcGoogle className="mr-2 h-4 w-4" />
              Google-ით შესვლა
            </Button>

            <div className="text-center text-sm">
              {isLogin ? "არ გაქვთ ანგარიში? " : "უკვე გაქვთ ანგარიში? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? "რეგისტრაცია" : "შესვლა"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}