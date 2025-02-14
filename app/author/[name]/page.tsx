"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { collection, query, where, getDocs, type Timestamp } from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BlogCard from "../../../components/BlogCard"
import { motion } from "framer-motion"

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

export default function AuthorProfile() {
  const { name } = useParams()
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    const fetchAuthorPosts = async () => {
      const q = query(collection(db, "posts"), where("authorName", "==", name))
      const querySnapshot = await getDocs(q)
      const fetchedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
      })) as BlogPost[]
      setPosts(fetchedPosts)
    }

    fetchAuthorPosts()
  }, [name])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Author: {name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Posts by {name}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BlogCard post={post} />
          </motion.div>
        ))}
        {posts.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-8">No posts found for this author</div>
        )}
      </div>
    </div>
  )
}

