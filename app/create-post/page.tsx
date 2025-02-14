"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, Timestamp } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuthContext } from "../../components/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"
import { SuccessPopup } from "../../components/SuccessPopup"
import { supabase } from "../../lib/supabase"
import Image from "next/image"
import { X, Upload } from "lucide-react"

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID
const MAX_TITLE_LENGTH = 50
const MAX_DESCRIPTION_LENGTH = 170

export default function CreatePost() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [showPostSuccess, setShowPostSuccess] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const { user } = useAuthContext()

  useEffect(() => {
    if (user && user.uid !== ADMIN_UID) {
      router.push("/blog")
    }
  }, [user, router])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value)
    }
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setShortDescription(value)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}_${i}.${fileExt}`

      try {
        const { data, error } = await supabase.storage.from("blog_images").upload(fileName, file)

        if (error) throw error

        const {
          data: { publicUrl },
        } = supabase.storage.from("blog_images").getPublicUrl(fileName)

        setImages((prev) => [...prev, publicUrl])
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "შეცდომა",
          description: "სურათის ატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.",
          variant: "destructive",
        })
      }
    }

    setUploading(false)
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || user.uid !== ADMIN_UID) {
      toast({
        title: "შეცდომა",
        description: "თქვენ არ გაქვთ პოსტის შექმნის უფლება",
        variant: "destructive",
      })
      return
    }
    if (!authorName.trim()) {
      toast({
        title: "შეცდომა",
        description: "გთხოვთ, მიუთითოთ ავტორის სახელი",
        variant: "destructive",
      })
      return
    }
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        shortDescription,
        author: user.uid,
        authorName,
        likes: 0,
        views: 0,
        comments: [],
        createdAt: Timestamp.now(),
        images,
      })
      setShowPostSuccess(true)
      setTimeout(() => {
        setShowPostSuccess(false)
        router.push("/blog")
      }, 3000)
    } catch (error) {
      console.error("Error adding document: ", error)
      toast({
        title: "შეცდომა",
        description: "���ოსტის შექმნა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.",
        variant: "destructive",
      })
    }
  }

  if (!user || user.uid !== ADMIN_UID) {
    return null
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">ახალი პოსტის შექმნა</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  სათაური
                </label>
                <div className="relative">
                  <Input
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="შეიყვანეთ პოსტის სათაური"
                    required
                    maxLength={MAX_TITLE_LENGTH}
                  />
                  <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                    {title.length}/{MAX_TITLE_LENGTH}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="authorName" className="text-sm font-medium">
                  ავტორის სახელი
                </label>
                <Input
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="შეიყვანეთ ავტორის სახელი"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="shortDescription" className="text-sm font-medium">
                  მოკლე აღწერა
                </label>
                <div className="relative">
                  <Textarea
                    id="shortDescription"
                    value={shortDescription}
                    onChange={handleDescriptionChange}
                    placeholder="შეიყვანეთ მოკლე აღწერა"
                    rows={3}
                    required
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                    {shortDescription.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  პოსტის შინაარსი
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="დაწერეთ თქვენი პოსტის შინაარსი აქ..."
                  rows={10}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="images" className="text-sm font-medium">
                  სურათების ატვირთვა
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button type="button" onClick={() => document.getElementById("images")?.click()} disabled={uploading}>
                    {uploading ? "იტვირთება..." : "სურათების არჩევა"}
                    <Upload className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`ატვირთული სურათი ${index + 1}`}
                      width={100}
                      height={100}
                      className="object-cover rounded-md cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  პოსტის შექმნა
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </div>
      <SuccessPopup message="პოსტი წარმატებით შეიქმნა" isVisible={showPostSuccess} />
    </>
  )
}

