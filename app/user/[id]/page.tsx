"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, collection, query, getDocs, Timestamp, type DocumentData } from "firebase/firestore"
import { db } from "../../../lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BlogCard from "../../../components/BlogCard"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Link from "next/link"
import { MessageCircle, ThumbsUp, Calendar } from "lucide-react"

interface UserProfile extends DocumentData {
  username: string
  profilePicture: string | null
  bio: string
  favorites: string[]
  createdAt: Timestamp
}

interface BlogPost extends DocumentData {
  id: string
  title: string
  shortDescription: string
  author: string
  authorName: string
  authorProfilePicture?: string | null
  likes: number
  views: number
  comments: Comment[]
  createdAt: Timestamp
}

interface Comment extends DocumentData {
  id: string
  postId: string
  content: string
  createdAt: Timestamp
  author: string
  likes?: number
}

const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp || !(timestamp instanceof Timestamp)) return "Date unavailable"
  try {
    return format(timestamp.toDate(), "yyyy წლის d MMM, HH:mm")
  } catch (error) {
    console.error("Error formatting timestamp:", error)
    return "Date unavailable"
  }
}

export default function UserProfile() {
  const { id } = useParams()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [likedPosts, setLikedPosts] = useState<BlogPost[]>([])
  const [userComments, setUserComments] = useState<Comment[]>([])
  const [isActiveCitizen, setIsActiveCitizen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id || typeof id !== "string") {
        setIsLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, "users", id))
        if (!userDoc.exists()) {
          setIsLoading(false)
          return
        }

        const userData = userDoc.data() as UserProfile
        setUserProfile(userData)

        // Fetch liked posts
        const likedPostIds = userData.favorites || []
        const likedPostsData = await Promise.all(
          likedPostIds.map(async (postId: string) => {
            try {
              const postDoc = await getDoc(doc(db, "posts", postId))
              if (postDoc.exists()) {
                return { id: postDoc.id, ...postDoc.data() } as BlogPost
              }
            } catch (error) {
              console.error(`Error fetching post ${postId}:`, error)
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
                author: comment.author,
                likes: comment.likes, // Added likes property
              })),
          )
        })

        setUserComments(fetchedComments)
        setIsActiveCitizen(fetchedComments.length >= 25)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [id])

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">იტვირთება...</div>
  }

  if (!userProfile) {
    return <div className="container mx-auto px-4 py-8">მომხმარებელი ვერ მოიძებნა</div>
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
          <CardTitle>მოწონებული პოსტები</CardTitle>
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
              <div className="col-span-full text-center text-muted-foreground py-8">ჯერ არ არის მოწონებული პოსტები</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <MessageCircle className="mr-2" />
            მომხმარებლის კომენტარები ({userComments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userComments.length > 0 ? (
            <div className="space-y-4">
              {userComments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-card hover:bg-accent transition-colors duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={userProfile.profilePicture || undefined} />
                            <AvatarFallback>{userProfile.username[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{userProfile.username}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatTimestamp(comment.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Link href={`/blog/${comment.postId}`} className="text-sm font-medium hover:underline">
                          პოსტის ნახვა
                        </Link>
                      </div>
                      <p className="mt-2 text-foreground">{comment.content}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{comment.likes || 0} მოწონება</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">ჯერ არ არის კომენტარები</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

