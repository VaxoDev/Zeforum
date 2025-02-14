"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuthContext } from "../../components/AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "../../lib/supabase"
import { useTheme } from "next-themes"
import { Textarea } from "@/components/ui/textarea"

export default function SetupPage() {
  const [username, setUsername] = useState("")
  const [theme, setTheme] = useState("dark")
  const [bio, setBio] = useState("")
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const { user } = useAuthContext()
  const { setTheme: setThemeFromHook } = useTheme()

  useEffect(() => {
    if (user) {
      const checkUserSetup = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.setupCompleted) {
            if (userData.acceptedRules) {
              router.push("/blog")
            } else {
              router.push("/setup/rules")
            }
          }
        }
      }
      checkUserSetup()
    }
  }, [user, router])

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }

  const handleThemeChange = (value: string) => {
    setThemeFromHook(value)
    setTheme(value)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage.from("profile_pictures").upload(fileName, file)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_pictures").getPublicUrl(fileName)
      setProfilePicture(publicUrl)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          username,
          theme,
          profilePicture,
          bio,
          setupCompleted: true,
          acceptedRules: false,
          createdAt: new Date(),
        },
        { merge: true },
      )

      toast({
        title: "პროფილი შეიქმნა",
        description: "კეთილი იყოს თქვენი მობრძანება! თქვენი პროფილი წარმატებით შეიქმნა.",
      })
      router.push("/setup/rules")
    } catch (error) {
      console.error("Error setting up profile:", error)
      toast({
        title: "შეცდომა",
        description: "პროფილის შექმნა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.",
        variant: "destructive",
      })
    }
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">შექმენით თქვენი პროფილი</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">მომხმარებლის სახელი</Label>
              <Input
                id="username"
                value={username}
                onChange={handleUsernameChange}
                placeholder="აირჩიეთ მომხმარებლის სახელი"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">თემა</Label>
              <Select defaultValue="dark" onValueChange={handleThemeChange}>
                <SelectTrigger id="theme">
                  <SelectValue placeholder="აირჩიეთ თემა" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">მუქი</SelectItem>
                  <SelectItem value="light">ნათელი</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">ბიოგრაფია</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="მოგვიყევით თქვენს შესახებ"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profilePicture">პროფილის სურათი</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profilePicture || undefined} />
                  <AvatarFallback>{username[0]?.toUpperCase() || "მ"}</AvatarFallback>
                </Avatar>
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              პროფილის შექმნა
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

