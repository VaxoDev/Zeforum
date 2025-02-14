"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  increment,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { useAuthContext } from "../../../components/AuthProvider"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  MessageCircle,
  Eye,
  ThumbsUp,
  Send,
  Trash2,
  Share2,
  Link2,
  Mail,
  Twitter,
  Facebook,
  Copy,
  Clock,
  X,
  Upload,
  Badge,
  Pencil,
} from "lucide-react"
import { format } from "date-fns"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "../../../lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

const adminUID = "TB3IrAeqN7MqzoCPXWWk0WqVcdf1"

interface BlogPost {
  id: string
  title: string
  shortDescription?: string
  content: string
  authorName: string
  author: string
  authorProfilePicture?: string | null
  likes: number
  views: number
  comments: Comment[]
  likedBy: string[]
  viewedBy?: string[]
  images?: string[]
  createdAt: Timestamp
}

interface Comment {
  id: string
  author: string
  username: string
  content: string
  createdAt: Timestamp
  likes: number
  likedBy: string[]
  authorProfilePicture?: string | null
  isActiveCitizen?: boolean
}

const ShareDialog = ({ post }: { post: BlogPost }) => {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined" ? window.location.href : ""

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareOptions = [
    { name: "Twitter", icon: Twitter, action: () => handleShare("twitter") },
    { name: "Facebook", icon: Facebook, action: () => handleShare("facebook") },
    { name: "Email", icon: Mail, action: () => handleShare("email") },
    { name: "Copy Link", icon: Link2, action: handleCopy },
  ]

  const handleShare = async (platform: string) => {
    if (!post) return
    const url = window.location.href
    const text = `Check out this post: ${post.title}`

    switch (platform) {
      case "native":
        if (typeof navigator !== "undefined" && navigator.share) {
          try {
            await navigator.share({
              title: post.title,
              text: text,
              url: url,
            })
          } catch (err) {
            console.error("Error sharing:", err)
          }
        }
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        )
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(
          `${text}\n\n${url}`,
        )}`
        break
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>გააზიარე პოსტი</DialogTitle>
          <DialogDescription>აირჩიეთ როგორ გსურთ ამ პოსტის გაზიარება</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {shareOptions.map((option) => (
            <Button key={option.name} variant="outline" className="w-full justify-start" onClick={option.action}>
              <option.icon className="mr-2 h-4 w-4" />
              {option.name}
            </Button>
          ))}
        </div>
        <DialogFooter className="sm:justify-start">
          <div className="flex items-center space-x-2">
            <Input id="link" value={url} readOnly className="w-[300px]" />
            <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
              <span className="sr-only">Copy</span>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const EditPostDialog = ({
  post,
  onUpdate,
  isOpen,
  onClose,
}: {
  post: BlogPost
  onUpdate: (updatedPost: Partial<BlogPost>) => void
  isOpen: boolean
  onClose: () => void
}) => {
  const [editedTitle, setEditedTitle] = useState(post.title)
  const [editedShortDescription, setEditedShortDescription] = useState(post.shortDescription || "")
  const [editedContent, setEditedContent] = useState(post.content)
  const [editedImages, setEditedImages] = useState<string[]>(post.images || [])
  const { user } = useAuthContext()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!user || (editedImages.length >= 5 && user.uid !== adminUID)) {
      toast({
        title: "Error",
        description: "თქვენ არ შეგიძლიათ 5-ზე მეტი სურათის ატვირთვა.",
        variant: "destructive",
      })
      return
    }

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage.from("blog_images").upload(fileName, file)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog_images").getPublicUrl(fileName)
      setEditedImages([...editedImages, publicUrl])
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "სურათის ატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = editedImages[index]
    const updatedImages = editedImages.filter((_, i) => i !== index)
    setEditedImages(updatedImages)

    // Delete the image from Supabase storage
    const fileName = imageToRemove.split("/").pop()
    if (fileName) {
      try {
        const { error } = await supabase.storage.from("blog_images").remove([fileName])
        if (error) throw error
      } catch (error) {
        console.error("Error deleting image from storage:", error)
        toast({
          title: "Error",
          description: "სურათის წაშლა საცავიდან ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdate = () => {
    onUpdate({
      title: editedTitle,
      shortDescription: editedShortDescription,
      content: editedContent,
      images: editedImages,
    })
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>პოსტის რედაქტირება</DialogTitle>
          <DialogDescription>
            შეცვალეთ თქვენი პოსტის დეტალები. დააჭირეთ შენახვას ცვლილებების დასამახსოვრებლად.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">შინაარსი</TabsTrigger>
            <TabsTrigger value="images">სურათები</TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">სათაური</Label>
                  <Input
                    id="title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-sm text-muted-foreground text-right">{editedTitle.length}/100</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">მოკლე აღწერა</Label>
                  <Textarea
                    id="shortDescription"
                    value={editedShortDescription}
                    onChange={(e) => setEditedShortDescription(e.target.value)}
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-sm text-muted-foreground text-right">{editedShortDescription.length}/200</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">შინაარსი</Label>
                  <Textarea
                    id="content"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={10}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="images">
            <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    სურათის ატვირთვა
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {editedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Image ${index + 1}`}
                        width={200}
                        height={200}
                        className="object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            გაუქმება
          </Button>
          <Button type="button" onClick={handleUpdate}>
            ცვლილებების შენახვა
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function BlogPost() {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [comment, setComment] = useState("")
  const [userLiked, setUserLiked] = useState(false)
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [showCopyLinkDialog, setShowCopyLinkDialog] = useState(false)
  const [showCopySuccess, setShowCopySuccess] = useState(false)
  const { id } = useParams()
  const { user } = useAuthContext()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedShortDescription, setEditedShortDescription] = useState("")
  const [editedContent, setEditedContent] = useState("")
  const [editedImages, setEditedImages] = useState<string[]>([])
  const [isDeletePostDialogOpen, setIsDeletePostDialogOpen] = useState(false)

  const nextImage = () => {
    if (post?.images && currentImageIndex < post.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    }
  }

  useEffect(() => {
    const fetchPost = async () => {
      if (!user) return
      const docRef = doc(db, "posts", id as string)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const postData = docSnap.data() as BlogPost

        if (postData.author === adminUID) {
          setPost({
            id: docSnap.id,
            ...postData,
            authorProfilePicture: null,
          })
        } else {
          const authorRef = doc(db, "users", postData.author)
          const authorDoc = await getDoc(authorRef)
          const authorData = authorDoc.exists() ? authorDoc.data() : null

          setPost({
            id: docSnap.id,
            ...postData,
            authorName: authorData?.username || "Unknown Author",
            authorProfilePicture: authorData?.profilePicture || null,
          })
        }

        setUserLiked(postData.likedBy.includes(user.uid))
        setEditedTitle(postData.title)
        setEditedShortDescription(postData.shortDescription || "")
        setEditedContent(postData.content)
        setEditedImages(postData.images || [])

        if (!postData.viewedBy?.includes(user.uid)) {
          await updateDoc(docRef, {
            views: increment(1),
            viewedBy: arrayUnion(user.uid),
          })
        }
      }
    }

    fetchPost()
  }, [id, user])

  const handleLike = async () => {
    if (!post || !user) return
    const docRef = doc(db, "posts", post.id)
    const userRef = doc(db, "users", user.uid)
    if (userLiked) {
      await updateDoc(docRef, {
        likes: increment(-1),
        likedBy: arrayRemove(user.uid),
      })
      await updateDoc(userRef, {
        favorites: arrayRemove(post.id),
      })
      setUserLiked(false)
      setPost({
        ...post,
        likes: post.likes - 1,
        likedBy: Array.isArray(post.likedBy) ? post.likedBy.filter((uid) => uid !== user.uid) : [],
      })
    } else {
      await updateDoc(docRef, {
        likes: increment(1),
        likedBy: arrayUnion(user.uid),
      })
      await updateDoc(userRef, {
        favorites: arrayUnion(post.id),
      })
      setUserLiked(true)
      setPost({
        ...post,
        likes: post.likes + 1,
        likedBy: Array.isArray(post.likedBy) ? [...post.likedBy, user.uid] : [user.uid],
      })
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !user || !comment.trim()) return

    const userDoc = await getDoc(doc(db, "users", user.uid))
    const userData = userDoc.exists() ? userDoc.data() : null
    const username = userData?.username || "Unknown"
    const authorProfilePicture = userData?.profilePicture || null

    const postsQuery = query(collection(db, "posts"))
    const postsSnapshot = await getDocs(postsQuery)
    const totalUserComments = postsSnapshot.docs.reduce((total, doc) => {
      return total + doc.data().comments.filter((c: any) => c.author === user.uid).length
    }, 0)

    const isActiveCitizen = totalUserComments + 1 >= 25

    const docRef = doc(db, "posts", post.id)
    const newComment = {
      id: Date.now().toString(),
      author: user.uid,
      username: username,
      content: comment,
      createdAt: Timestamp.now(),
      likes: 0,
      likedBy: [],
      authorProfilePicture: authorProfilePicture,
      isActiveCitizen: isActiveCitizen,
    }
    await updateDoc(docRef, {
      comments: arrayUnion(newComment),
    })
    setPost({ ...post, comments: [...post.comments, newComment] })
    setComment("")

    if (isActiveCitizen && !userData?.isActiveCitizen) {
      await updateDoc(doc(db, "users", user.uid), { isActiveCitizen: true })
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!post || !user) return
    const docRef = doc(db, "posts", post.id)
    const updatedComments = post.comments.map((c) =>
      c.id === commentId
        ? c.likedBy.includes(user.uid)
          ? { ...c, likes: c.likes - 1, likedBy: c.likedBy.filter((uid) => uid !== user.uid) }
          : { ...c, likes: c.likes + 1, likedBy: [...c.likedBy, user.uid] }
        : c,
    )
    await updateDoc(docRef, { comments: updatedComments })
    setPost({ ...post, comments: updatedComments })
  }

  const handleDeleteComment = (commentId: string) => {
    setDeleteCommentId(commentId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteComment = async () => {
    if (!post || !user || !deleteCommentId) return
    const docRef = doc(db, "posts", post.id)
    const updatedComments = post.comments.filter((c) => c.id !== deleteCommentId)
    await updateDoc(docRef, { comments: updatedComments })
    setPost({ ...post, comments: updatedComments })
    setIsDeleteDialogOpen(false)
    setDeleteCommentId(null)
  }

  const handleCopyLink = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setShowCopySuccess(true)
    setTimeout(() => {
      setShowCopySuccess(false)
      setShowCopyLinkDialog(false)
    }, 2000)
  }

  const handleShare = async (platform: string) => {
    if (!post) return
    const url = window.location.href
    const text = `Check out this post: ${post.title}`

    switch (platform) {
      case "native":
        if (typeof navigator !== "undefined" && navigator.share) {
          try {
            await navigator.share({
              title: post.title,
              text: text,
              url: url,
            })
          } catch (err) {
            console.error("Error sharing:", err)
          }
        }
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        )
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(
          `${text}\n\n${url}`,
        )}`
        break
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!user || (editedImages.length >= 5 && user.uid !== adminUID)) {
      toast({
        title: "Error",
        description: "თქვენ არ შეგიძლიათ 5-ზე მეტი სურათის ატვირთვა.",
        variant: "destructive",
      })
      return
    }

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage.from("blog_images").upload(fileName, file)

      if (error) throw error

      const {
        data: { publicUrl },
      } = supabase.storage.from("blog_images").getPublicUrl(fileName)
      setEditedImages([...editedImages, publicUrl])
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "სურათის ატვირთვა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = editedImages[index]
    const updatedImages = editedImages.filter((_, i) => i !== index)
    setEditedImages(updatedImages)

    const fileName = imageToRemove.split("/").pop()
    if (fileName) {
      try {
        const { error } = await supabase.storage.from("blog_images").remove([fileName])
        if (error) throw error
      } catch (error) {
        console.error("Error deleting image from storage:", error)
        toast({
          title: "Error",
          description: "სურათის წაშლა საცავიდან ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.",
          variant: "destructive",
        })
      }
    }
  }

  const handleUpdate = async (updatedPost: Partial<BlogPost>) => {
    if (!post || !user) return
    const docRef = doc(db, "posts", post.id)

    const imagesToRemove = post.images?.filter((img) => !updatedPost.images?.includes(img)) || []
    for (const imageUrl of imagesToRemove) {
      const fileName = imageUrl.split("/").pop()
      if (fileName) {
        await supabase.storage.from("blog_images").remove([fileName])
      }
    }

    await updateDoc(docRef, {
      title: updatedPost.title || post.title,
      shortDescription: updatedPost.shortDescription || post.shortDescription,
      content: updatedPost.content || post.content,
      images: updatedPost.images || post.images,
    })
    setPost({
      ...post,
      title: updatedPost.title || post.title,
      shortDescription: updatedPost.shortDescription || post.shortDescription,
      content: updatedPost.content || post.content,
      images: updatedPost.images || post.images,
    })
    setIsEditMode(false)
    toast({
      title: "წარმატება",
      description: "პოსტი წარმატებით განახლდა",
    })
  }

  const handleDeletePost = async () => {
    if (!post || !user) return

    if (user.uid !== post.author && user.uid !== adminUID) {
      toast({
        title: "შეცდომა",
        description: "თქვენ არ გაქვთ ამ პოსტის წაშლის უფლება.",
        variant: "destructive",
      })
      return
    }

    try {
      if (post.images && post.images.length > 0) {
        for (const imageUrl of post.images) {
          const fileName = imageUrl.split("/").pop()
          if (fileName) {
            const { error } = await supabase.storage.from("blog_images").remove([fileName])
            if (error) throw error
          }
        }
      }

      await deleteDoc(doc(db, "posts", post.id))

      const commentsQuery = query(collection(db, "comments"), where("postId", "==", post.id))
      const commentsSnapshot = await getDocs(commentsQuery)
      const deleteCommentPromises = commentsSnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deleteCommentPromises)

      const usersQuery = query(collection(db, "users"), where("favorites", "array-contains", post.id))
      const usersSnapshot = await getDocs(usersQuery)
      const updateUserPromises = usersSnapshot.docs.map((doc) =>
        updateDoc(doc.ref, {
          favorites: arrayRemove(post.id),
        }),
      )
      await Promise.all(updateUserPromises)

      toast({
        title: "წარმატება",
        description: "პოსტი წარმატებით წაიშალა",
      })
      setIsDeletePostDialogOpen(false)
      router.push("/blog")
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "შეცდომა",
        description: "პოსტის წაშლა ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა.",
        variant: "destructive",
      })
    }
  }

  if (!post) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Edit Post Dialog */}
      {isEditMode && (
        <EditPostDialog
          post={post}
          onUpdate={handleUpdate}
          isOpen={isEditMode}
          onClose={() => setIsEditMode(false)}
        />
      )}

      <Card className="mb-8 overflow-hidden relative">
        <CardHeader className="bg-secondary p-6">
          <CardTitle className="text-3xl font-bold mb-2 text-foreground">{post.title}</CardTitle>
          {(user?.uid === post.author || user?.uid === adminUID) && (
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditMode(true)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDeletePostDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
          <CardDescription className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>{format(post.createdAt.toDate(), "yyyy წლის d MMM, HH:mm")}</span>
            </div>
            <Link
              href={post.author === adminUID ? `/author/${post.authorName}` : `/user/${post.author}`}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-8 w-8 border-2 border-primary">
                <AvatarImage src={post.authorProfilePicture || undefined} />
                <AvatarFallback>{post.authorName ? post.authorName[0].toUpperCase() : "#"}</AvatarFallback>
              </Avatar>
              <span className="text-lg text-foreground">By {post.authorName}</span>
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div
            className="prose dark:prose-invert max-w-none mb-8 text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </CardContent>
        <CardFooter className="bg-muted p-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center space-x-2 ${userLiked ? "text-red-500" : "text-muted-foreground"}`}
            >
              <Heart className={`w-6 h-6 ${userLiked ? "fill-current" : ""}`} />
              <span>{post.likes}</span>
            </motion.button>
            <span className="flex items-center space-x-2 text-muted-foreground">
              <Eye className="w-6 h-6" />
              <span>{post.views}</span>
            </span>
            <span className="flex items-center space-x-2 text-muted-foreground">
              <MessageCircle className="w-6 h-6" />
              <span>{post.comments.length}</span>
            </span>
          </div>
          <ShareDialog post={post} />
        </CardFooter>
      </Card>

      {post.images && post.images.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="relative h-96">
            <Image
              src={post.images[currentImageIndex] || "/placeholder.svg"}
              alt={`Image ${currentImageIndex + 1}`}
              layout="fill"
              objectFit="contain"
            />
            {post.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                  disabled={currentImageIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                  disabled={currentImageIndex === post.images.length - 1}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          <div className="flex justify-center space-x-2">
            {post.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">კომენტარები</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AnimatePresence>
            {post.comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-muted p-4 rounded-lg shadow-sm"
              >
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/user/${comment.author}`}
                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.authorProfilePicture || undefined} />
                          <AvatarFallback>{comment.username ? comment.username[0].toUpperCase() : "#"}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground">{comment.username}</span>
                      </Link>
                      {comment.isActiveCitizen && (
                        <Badge variant="secondary" className="text-xs">
                          აქტიური მოქალაქე
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center space-x-1 ${
                          comment.likedBy.includes(user?.uid || "") ? "text-primary" : "text-muted-foreground"
                        } hover:text-primary transition-colors`}
                      >
                        <ThumbsUp className="w-4 w-4" />
                        <span>{comment.likes} likes</span>
                      </motion.button>
                      {(user?.uid === comment.author || user?.uid === adminUID) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="w-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-foreground">{comment.content}</p>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{format(comment.createdAt.toDate(), "yyyy წლის d MMM, HH:mm")}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">კომენტარის დამატება</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleComment} className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="გაგვიზიარეთ თქვენი აზრი..."
                rows={3}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button type="submit" className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>კომენტარის გამოქვეყნება</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteComment}
        title="კომენტარის წაშლა"
        description="დარწმუნებული ხართ, რომ გსურთ ამ კომენტარის წაშლა? ეს მოქმედება ვერ იქნება გაუქმებული."
        confirmText="წაშლა"
        cancelText="Cancel"
      />
      <ConfirmationDialog
        isOpen={isDeletePostDialogOpen}
        onClose={() => setIsDeletePostDialogOpen(false)}
        onConfirm={handleDeletePost}
        title="პოსტის წაშლა"
        description="დარწმუნებული ხართ, რომ გსურთ ამ პოსტის წაშლა? ეს მოქმედება ვერ იქნება გაუქმებული."
        confirmText="წაშლა"
        cancelText="გაუქმება"
      />
    </div>
  )
}

