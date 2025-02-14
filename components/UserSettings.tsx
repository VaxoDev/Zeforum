"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs } from "firebase/firestore"
import { db } from "../lib/firebase"
import { useAuthContext } from "./AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"
import { supabase } from "../lib/supabase"
import { SuccessPopup } from "./SuccessPopup"
import { Textarea } from "@/components/ui/textarea"

const adminUID = process.env.NEXT_PUBLIC_ADMIN_UID

const UploadButton = ({ uploading }: { uploading: boolean }) => (
  <Button variant="outline" className="relative cursor-pointer" disabled={uploading} type="button">
    {uploading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        იტვირთება...
      </>
    ) : (
      <>
        <Camera className="mr-2 h-4 w-4" />
        სურათის შეცვლა
      </>
    )}
  </Button>
)

interface UserSettingsProps {
  hideScrollbar?: boolean
}

export default function UserSettings({ hideScrollbar = false }: UserSettingsProps) {
  const [username, setUsername] = useState("")
  const [lastUsernameChange, setLastUsernameChange] = useState<Date | null>(null)
  const [changeCount, setChangeCount] = useState(0)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUsernameSuccess, setShowUsernameSuccess] = useState(false)
  const [showProfilePictureSuccess, setShowProfilePictureSuccess] = useState(false)
  const [bio, setBio] = useState("")
  const { user } = useAuthContext()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const data = docSnap.data()
        setUsername(data.username || user.displayName || "")
        setLastUsernameChange(data.lastUsernameChange?.toDate() || null)
        setChangeCount(data.usernameChangeCount || 0)
        setProfilePicture(data.profilePicture || null)
        setBio(data.bio || "")
      }
    }

    fetchUserData()
  }, [user])

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const now = new Date()
    const docRef = doc(db, "users", user.uid)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        username,
        lastUsernameChange: now,
        usernameChangeCount: user.uid === adminUID ? 0 : (docSnap.data().usernameChangeCount || 0) + 1,
      })

      // Update username in all comments
      const postsQuery = query(collection(db, "posts"))
      const postsSnapshot = await getDocs(postsQuery)

      const updatePromises = postsSnapshot.docs.map(async (postDoc) => {
        const postRef = doc(db, "posts", postDoc.id)
        const postData = postDoc.data()
        const updatedComments = postData.comments.map((comment: any) => {
          if (comment.author === user.uid) {
            return { ...comment, username, authorProfilePicture: profilePicture }
          }
          return comment
        })

        return updateDoc(postRef, { comments: updatedComments })
      })

      await Promise.all(updatePromises)
    } else {
      await setDoc(docRef, {
        username,
        lastUsernameChange: now,
        usernameChangeCount: 0,
        favorites: [],
      })
    }

    setLastUsernameChange(now)
    setChangeCount((prevCount) => (user.uid === adminUID ? 0 : prevCount + 1))
    setShowUsernameSuccess(true)
    setTimeout(() => setShowUsernameSuccess(false), 3000)
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`

      // Delete the old profile picture if it exists
      if (profilePicture) {
        const oldFileName = profilePicture.split("/").pop()
        if (oldFileName) {
          await supabase.storage.from("profile_pictures").remove([oldFileName])
        }
      }

      const { data, error: uploadError } = await supabase.storage.from("profile_pictures").upload(fileName, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_pictures").getPublicUrl(fileName)

      setProfilePicture(publicUrl)

      // Update the user's profile picture in Firestore
      if (user) {
        const docRef = doc(db, "users", user.uid)
        await updateDoc(docRef, { profilePicture: publicUrl })

        // Update profile picture in all comments
        const postsQuery = query(collection(db, "posts"))
        const postsSnapshot = await getDocs(postsQuery)

        const updatePromises = postsSnapshot.docs.map(async (postDoc) => {
          const postRef = doc(db, "posts", postDoc.id)
          const postData = postDoc.data()
          const updatedComments = postData.comments.map((comment: any) => {
            if (comment.author === user.uid) {
              return { ...comment, authorProfilePicture: publicUrl }
            }
            return comment
          })

          return updateDoc(postRef, { comments: updatedComments })
        })

        await Promise.all(updatePromises)

        setShowProfilePictureSuccess(true)
        setTimeout(() => setShowProfilePictureSuccess(false), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      toast({
        title: "შეცდომა",
        description: err instanceof Error ? err.message : "ატვირთვა ვერ მოხერხდა",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    handleImageUpload(e.target.files[0])
  }

  const handleBioChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const docRef = doc(db, "users", user.uid)
    await updateDoc(docRef, { bio })

    toast({
      title: "ბიო განახლდა",
      description: "თქვენი ბიო წარმატებით განახლდა.",
    })
  }

  useEffect(() => {
    if (!theme) {
      setTheme("dark")
    }
  }, [theme, setTheme])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div
      className={`${hideScrollbar ? "" : "h-[calc(100vh-4rem)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"}`}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>სახელის შეცვლა</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUsernameChange} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ახალი სახელი"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  დარჩენილი ცვლილებები: {user?.uid === adminUID ? "შეუზღუდავი" : Math.max(0, 2 - changeCount)}
                </p>
                {lastUsernameChange && (
                  <p className="text-sm text-muted-foreground">
                    ბოლო ცვლილება: {lastUsernameChange.toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button type="submit">სახელის განახლება</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>პროფილის სურათის შეცვლა</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profilePicture || undefined} />
                <AvatarFallback>{username[0]}</AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                  />
                  <UploadButton uploading={uploading} />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ბიო</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBioChange} className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="მოგვიყევით თქვენს შესახებ"
                  rows={3}
                />
              </div>
              <Button type="submit">ბიოს განახლება</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>თემის პარამეტრები</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={toggleTheme}>{theme === "light" ? "მუქ თემაზე გადართვა" : "ნათელ თემაზე გადართვა"}</Button>
          </CardContent>
        </Card>

        <SuccessPopup message="სახელი წარმატებით განახლდა" isVisible={showUsernameSuccess} />
        <SuccessPopup message="პროფილის სურათი წარმატებით განახლდა" isVisible={showProfilePictureSuccess} />
      </div>
    </div>
  )
}

