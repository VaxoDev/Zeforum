"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { useAuthContext } from "../../../components/AuthProvider"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"

export default function RulesPage() {
  const [timeRemaining, setTimeRemaining] = useState(15)
  const [hasReadRules, setHasReadRules] = useState(false)
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAcceptRules = async () => {
    if (!user) return

    try {
      await updateDoc(doc(db, "users", user.uid), {
        acceptedRules: true,
      })
      router.push("/blog")
    } catch (error) {
      console.error("Error updating user document:", error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">ZeForum-ის წესები</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h3 className="text-lg font-semibold mb-2">1. პატივისცემა და თავაზიანობა</h3>
            <p className="text-muted-foreground">
              ყოველთვის მოეპყარით სხვა მომხმარებლებს პატივისცემით. დაუშვებელია შეურაცხმყოფელი, დისკრიმინაციული ან
              მუქარის შემცველი კომენტარები.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-2">2. კონსტრუქციული დიალოგი</h3>
            <p className="text-muted-foreground">
              გთხოვთ, შეინარჩუნოთ კონსტრუქციული დიალოგი. გააკრიტიკეთ იდეები და არა ადამიანები. შეეცადეთ, რომ თქვენი
              კომენტარები იყოს საქმიანი და თემასთან დაკავშირებული.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-2">3. პირადი ინფორმაციის დაცვა</h3>
            <p className="text-muted-foreground">
              არ გაამჟღავნოთ სხვების პირადი ინფორმაცია პლატფორმაზე. ეს მოიცავს სახელებს, მისამართებს, ტელეფონის ნომრებს
              და სხვა პირად მონაცემებს.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold mb-2">4. სპამის და არასასურველი კონტენტის აკრძალვა</h3>
            <p className="text-muted-foreground">
              აკრძალულია სპამის, არასასურველი რეკლამის ან ნებისმიერი სხვა ტიპის შეუსაბამო კონტენტის განთავსება
              პლატფორმაზე.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-lg font-semibold mb-2">5. საავტორო უფლებების დაცვა</h3>
            <p className="text-muted-foreground">
              პატივი ეცით საავტორო უფლებებს. არ განათავსოთ მასალა, რომელზეც არ გაქვთ უფლება ან ნებართვა.
            </p>
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="rules" checked={hasReadRules} onCheckedChange={() => setHasReadRules(!hasReadRules)} />
            <label
              htmlFor="rules"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              წავიკითხე და ვეთანხმები წესებს
            </label>
          </div>
          <Button onClick={handleAcceptRules} disabled={timeRemaining > 0 || !hasReadRules} className="w-full">
            {timeRemaining > 0 ? `გთხოვთ, წაიკითხოთ წესები (${timeRemaining}s)` : "ვეთანხმები და ვაგრძელებ"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

