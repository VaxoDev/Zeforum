"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, limit, getDocs, doc, getDoc, type Timestamp } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuthContext } from "../../components/AuthProvider"
import BlogCard from "../../components/BlogCard"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2 } from "lucide-react"
import { ProtectedRoute } from "../../components/ProtectedRoute"
import { Input } from "@/components/ui/input"
import { useDebounce } from "../../hooks/use-debounce"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: string
  title: string
  shortDescription: string
  author: string
  authorName: string
  authorProfilePicture?: string | null
  likes: number
  views: number
  comments: any[]
  createdAt: Date | Timestamp
}

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuthContext()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50))
      const querySnapshot = await getDocs(q)

      const postsWithAuthors = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const postData = docSnapshot.data() as BlogPost
          const postId = docSnapshot.id

          // If the post is created by admin, use the authorName directly
          if (postData.author === "TB3IrAeqN7MqzoCPXWWk0WqVcdf1") {
            return {
              id: postId,
              ...postData,
              authorProfilePicture: null, // You may want to set a default admin profile picture
            }
          }

          // For regular users, fetch their profile data
          const authorDoc = await getDoc(doc(db, "users", postData.author))
          if (authorDoc.exists()) {
            const authorData = authorDoc.data()
            return {
              id: postId,
              ...postData,
              authorName: authorData.username || "Unknown Author",
              authorProfilePicture: authorData.profilePicture || null,
            }
          }

          // Fallback if user data couldn't be fetched
          return {
            id: postId,
            ...postData,
            authorName: "Unknown Author",
            authorProfilePicture: null,
          }
        }),
      )

      setPosts(postsWithAuthors)
      setFilteredPosts(postsWithAuthors)
      setLoading(false)
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        post.shortDescription.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
    )
    setFilteredPosts(filtered)
  }, [debouncedSearchQuery, posts])

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-4xl font-bold">ZeForum - ქალაქის პრობლემები</h1>
            <div className="flex items-center w-full sm:w-auto space-x-2">
              <Input
                type="text"
                placeholder="მოძებნეთ პოსტები..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button variant="outline">ძებნა</Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">იტვირთება პოსტები...</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}

