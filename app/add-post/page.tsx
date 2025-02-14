"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  getDocs,
  Timestamp as FirebaseTimestamp 
} from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BlogCard from "../../../components/BlogCard"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"

interface UserProfile {
  username: string
  profilePicture: string | null
  bio: string
  favorites: string[]
  createdAt: FirebaseTimestamp
}

interface BlogPost {
  id: string
  title: string
  shortDescription: string
  author: string
  authorName: string
  authorProfilePicture?: string | null
  likes: number
  views: number
  comments: Comment[]
  createdAt: FirebaseTimestamp
}

interface Comment {
  id: string
  postId: string
  content: string
  createdAt: FirebaseTimestamp
  author: string
}

const formatTimestamp = (timestamp: FirebaseTimestamp | undefined): string => {
  if (!timestamp) return "Date unavailable"
  try {
    return format(timestamp.toDate(), "MMM d, yyyy 'at' h:mm a")
  } catch (error) {
    return "Date unavailable"
  }
}

export default function UserProfile() {
  const { id } = useParams()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [likedPosts, setLikedPosts] = useState<BlogPost[]>([])
  const [userComments, setUserComments] = useState<Comment[]>([])
  const [isActiveCitizen, setIsActiveCitizen] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id || typeof id !== 'string') return

      try {
        const userDoc = await getDoc(doc(db, "users", id))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile)
        }

        // Fetch liked posts
        const likedPostIds = userDoc?.data()?.favorites || []
        const likedPostsData = await Promise.all(
          likedPostIds.map(async (postId: string) => {
            const postDoc = await getDoc(doc(db, "posts", postId))
            if (postDoc.exists()) {
              return { id: postDoc.id, ...postDoc.data() } as BlogPost
            }
            return null
          }),
        )
        setLikedPosts(likedPostsData.filter((post): post is BlogPost => post !== null))

        // Fetch user comments
        const postsQuery = query(collection(db, "posts"))
        const postsSnapshot = await getDocs(postsQuery)
        const fetchedComments: Comment[] = []

        postsSnapshot.docs.forEach((postDoc) => {
          const postData = postDoc.data()
          const postComments = postData.comments || []
          fetchedComments.push(
            ...postComments
              .filter((comment: any) => comment.author === id)
              .map((comment: any) => ({
                id: comment.id,
                postId: postDoc.id,
                content: comment.content,
                createdAt: comment.createdAt,
                author: comment.author
              })),
          )
        })

        setUserComments(fetchedComments)
        setIsActiveCitizen(fetchedComments.length >= 25)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [id])

  if (!userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={userProfile.profilePicture || undefined} />
            <AvatarFallback>{userProfile.username[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <CardTitle className="text-2xl font-bold">{userProfile.username}</CardTitle>
            <p className="text-muted-foreground mt-2">{userProfile.bio}</p>
            {isActiveCitizen && (
              <Badge variant="secondary" className="mt-2">
                აქტიური მოქალაქე
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Liked Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <BlogCard post={post} />
              </motion.div>
            ))}
            {likedPosts.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-8">No liked posts yet</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Comments ({userComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {userComments.map((comment) => (
            <div key={comment.id} className="mb-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <Link href={`/blog/${comment.postId}`} className="text-sm font-medium hover:underline">
                  View Post
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
          ))}
          {userComments.length === 0 && <div className="text-center text-muted-foreground py-8">No comments yet</div>}
        </CardContent>
      </Card>
    </div>
  )
}

