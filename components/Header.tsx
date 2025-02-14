"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Settings, Heart, LogOut, PlusCircle, LayoutDashboard, House } from "lucide-react"
import { useAuthContext } from "./AuthProvider"
import { useAuth } from "../hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConfirmationDialog } from "./ConfirmationDialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogoText } from "./LogoText"
import { getDoc, doc } from "firebase/firestore"
import { db } from "../lib/firebase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import UserSettings from "./UserSettings"

const adminUID = process.env.NEXT_PUBLIC_ADMIN_UID

export function Header() {
  const { user } = useAuthContext()
  const { signOut } = useAuth()
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setProfilePicture(userDoc.data().profilePicture || null)
        }
        setIsAdmin(user.uid === adminUID)
      }
    }
    fetchProfilePicture()
  }, [user])

  const handleSignOut = () => {
    setIsSignOutDialogOpen(true)
  }

  const confirmSignOut = () => {
    signOut()
    setIsSignOutDialogOpen(false)
  }

  const navItems = [
    { href: "/", icon: House, label: "სახლი" },
    { href: "/blog", icon: BookOpen, label: "ფორუმი" },
    { href: "/favorites", icon: Heart, label: "ფავორიტები" },
    { href: "#", icon: Settings, label: "პარამეტრები", onClick: () => setShowSettings(true) },
    ...(isAdmin
      ? [
          { href: "/create-post", icon: PlusCircle, label: "ახალი პოსტი" },
          { href: "/dashboard", icon: LayoutDashboard, label: "ადმინ პანელი" },
        ]
      : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/blog" className="flex items-center space-x-2">
            <LogoText variant="stylized" />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={profilePicture || user.photoURL || undefined} />
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        onClick={item.onClick}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>გასვლა</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button>შესვლა</Button>
            </Link>
          )}
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isSignOutDialogOpen}
        onClose={() => setIsSignOutDialogOpen(false)}
        onConfirm={confirmSignOut}
        title="ანგარიშიდან გასვლა"
        description="დარწმუნებული ხარ რომ ანგარიშიდან გასვლა გინდა?"
        confirmText="გასვლა"
        cancelText="გაუქმება"
      />
      {showSettings && (
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>მომხმარებლის პარამეტრები</DialogTitle>
            </DialogHeader>
            <UserSettings />
          </DialogContent>
        </Dialog>
      )}
    </header>
  )
}

