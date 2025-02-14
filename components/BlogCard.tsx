import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Heart, MessageCircle, Clock } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { Timestamp } from "firebase/firestore"

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
  images?: string[]
  createdAt: Date | Timestamp
}

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  if (!post) {
    return null
  }

  const formatDate = (dateValue: Date | Timestamp) => {
    try {
      const date = dateValue instanceof Timestamp ? dateValue.toDate() : dateValue
      return format(date, "d MMM, yyyy", { locale: ka })
    } catch (error) {
      return "არასწორი თარიღი"
    }
  }

  return (
    <div>
      <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
        <Card
          className="h-full flex flex-col overflow-hidden cursor-pointer"
          onClick={() => (window.location.href = `/blog/${post.id}`)}
        >
          {post.images && post.images.length > 0 && (
            <div className="relative h-48">
              <Image src={post.images[0] || "/placeholder.svg"} alt={post.title} layout="fill" objectFit="cover" />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-xl font-bold line-clamp-2">{post.title || "Untitled"}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {post.shortDescription || "No description available."}
            </p>
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={post.authorProfilePicture || undefined} />
                <AvatarFallback>{(post.authorName && post.authorName[0]) || "U"}</AvatarFallback>
              </Avatar>
              <Link
                href={
                  post.author === "TB3IrAeqN7MqzoCPXWWk0WqVcdf1" ? `/author/${post.authorName}` : `/user/${post.author}`
                }
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {post.authorName || "Unknown Author"}
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex space-x-4">
              <span className="flex items-center space-x-1">
                <Heart className="h-4 w-4 flex-shrink-0" />
                <span>{post.likes || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="h-4 w-4 flex-shrink-0" />
                <span>{post.views || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4 flex-shrink-0" />
                <span>{post.comments?.length || 0}</span>
              </span>
            </div>
            <span className="flex items-center space-x-1">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{formatDate(post.createdAt)}</span>
            </span>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

