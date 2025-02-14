"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, deleteDoc, doc, where, type Timestamp } from "firebase/firestore"
import { db } from "../lib/firebase"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Eye, Heart, Trash2, MessageCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { ConfirmationDialog } from "./ConfirmationDialog"
import { TopPostsPodium } from "./TopPostsPodium"
import { useAuthContext } from "./AuthProvider"
import UserSettings from "./UserSettings"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"

interface BlogPost {
  id: string
  title: string
  author: string
  authorName: string
  likes: number
  views: number
  comments: any[]
  createdAt: Date
  category?: string
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [totalLikes, setTotalLikes] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [totalComments, setTotalComments] = useState(0)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState("global")
  const [authorNames, setAuthorNames] = useState<string[]>([])
  const { theme, setTheme } = useTheme()
  const { user } = useAuthContext()
  const [topAuthors, setTopAuthors] = useState<
    { name: string; posts: number; likes: number; views: number; comments: number }[]
  >([])
  const [postsByCategory, setPostsByCategory] = useState<{ category: string; count: number }[]>([])
  const [userGrowth, setUserGrowth] = useState<{ date: string; count: number }[]>([])

  useEffect(() => {
    fetchPosts()
  }, []) // Removed user from dependencies

  const fetchPosts = async () => {
    if (!user) return
    let q = query(collection(db, "posts"))

    if (selectedAuthor !== "global") {
      q = query(collection(db, "posts"), where("authorName", "==", selectedAuthor))
    }

    const querySnapshot = await getDocs(q)
    const fetchedPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
    })) as BlogPost[]
    setPosts(fetchedPosts)

    const likes = fetchedPosts.reduce((sum, post) => sum + post.likes, 0)
    const views = fetchedPosts.reduce((sum, post) => sum + post.views, 0)
    const comments = fetchedPosts.reduce((sum, post) => sum + post.comments.length, 0)
    setTotalLikes(likes)
    setTotalViews(views)
    setTotalComments(comments)

    // Calculate top authors
    const authorStats = fetchedPosts.reduce(
      (acc, post) => {
        if (!acc[post.authorName]) {
          acc[post.authorName] = { posts: 0, likes: 0, views: 0, comments: 0 }
        }
        acc[post.authorName].posts += 1
        acc[post.authorName].likes += post.likes
        acc[post.authorName].views += post.views
        acc[post.authorName].comments += post.comments.length
        return acc
      },
      {} as Record<string, { posts: number; likes: number; views: number; comments: number }>,
    )
    const sortedAuthors = Object.entries(authorStats)
      .sort((a, b) => b[1].posts - a[1].posts)
      .slice(0, 5)
      .map(([name, stats]) => ({ name, ...stats }))
    setTopAuthors(sortedAuthors)

    // Fetch unique author names
    const uniqueAuthors = Array.from(new Set(fetchedPosts.map((post) => post.authorName)))
    setAuthorNames(uniqueAuthors)

    // Fetch user growth data
    const usersSnapshot = await getDocs(collection(db, "users"))
    const userCreationDates = usersSnapshot.docs.map((doc) => doc.data().createdAt.toDate())
    const userGrowthData = userCreationDates.reduce(
      (acc, date) => {
        const dateString = format(date, "yyyy-MM-dd")
        acc[dateString] = (acc[dateString] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    setUserGrowth(Object.entries(userGrowthData).map(([date, count]) => ({ date, count })))
  }

  const handleDeletePost = (postId: string) => {
    setPostToDelete(postId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePost = async () => {
    if (postToDelete) {
      await deleteDoc(doc(db, "posts", postToDelete))
      fetchPosts()
      setIsDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const chartData = posts
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((post) => ({
      date: post.createdAt.toLocaleDateString(),
      likes: post.likes,
      views: post.views,
      comments: post.comments.length,
    }))

  const pieChartData = [
    { name: "მოწონებები", value: totalLikes },
    { name: "ნახვები", value: totalViews },
    { name: "კომენტარები", value: totalComments },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  const postsByTimeData = posts.reduce(
    (acc, post) => {
      const hour = post.createdAt.getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    },
    {} as Record<number, number>,
  )

  const postsByTimeChartData = Object.entries(postsByTimeData).map(([hour, count]) => ({
    hour: Number.parseInt(hour),
    count,
  }))

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">გლობალური მართვის პანელი</h2>
        <div className="flex items-center space-x-2">
          <span>აირჩიეთ ავტორი:</span>
          <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select an author" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">ყველა</SelectItem>
              {authorNames.map((author) => (
                <SelectItem key={author} value={author}>
                  {author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">სულ პოსტები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">სულ მოწონებები</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">სულ ნახვები</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">სულ კომენტარები</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ჩართულობის მიმოხილვა</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="#8884d8" />
                <Line type="monotone" dataKey="views" stroke="#82ca9d" />
                <Line type="monotone" dataKey="comments" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>ჩართულობის განაწილება</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>პოსტები დღის დროის მიხედვით</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={postsByTimeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>საუკეთესო პოსტები</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length > 0 && (
            <TopPostsPodium
              mostLiked={posts.reduce((prev, current) => (prev.likes > current.likes ? prev : current))}
              mostViewed={posts.reduce((prev, current) => (prev.views > current.views ? prev : current))}
              mostCommented={posts.reduce((prev, current) =>
                prev.comments.length > current.comments.length ? prev : current,
              )}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>საუკეთესო ავტორები</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAuthors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="posts" fill="#8884d8" name="პოსტები" />
                <Bar dataKey="likes" fill="#82ca9d" name="მოწონებები" />
                <Bar dataKey="views" fill="#ffc658" name="ნახვები" />
                <Bar dataKey="comments" fill="#ff8042" name="კომენტარები" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>მომხმარებლების ზრდა</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ყველა პოსტი</CardTitle>
          <Link href="/create-post">
            <Button>ახალი პოსტი</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>სათაური</TableHead>
                <TableHead>ავტორი</TableHead>
                <TableHead>მოწონებები</TableHead>
                <TableHead>ნახვები</TableHead>
                <TableHead>კომენტარები</TableHead>
                <TableHead>მოქმედებები</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.authorName}</TableCell>
                  <TableCell>{post.likes}</TableCell>
                  <TableCell>{post.views}</TableCell>
                  <TableCell>{post.comments.length}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Link href={`/blog/${post.id}`}>
                        <Button variant="ghost" size="sm">
                          ნახვა
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      <Card>
        <UserSettings hideScrollbar />
      </Card>
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeletePost}
        title="პოსტის წაშლა"
        description="დარწმუნებული ხართ, რომ გსურთ ა�� პოსტის წაშლა? ეს მოქმედება ვერ იქნება გაუქმებული."
        confirmText="წაშლა"
        cancelText="გაუქმება"
      />
    </div>
  )
}

