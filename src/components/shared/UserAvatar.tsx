import { useAuth } from "@/features/auth/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserAvatarProps {
  className?: string
  fallbackClassName?: string
}

export default function UserAvatar({ className = "", fallbackClassName = "" }: UserAvatarProps) {
  const { user } = useAuth()

  if (!user) {
    return (
      <Avatar className={className}>
        <AvatarFallback className={`bg-secondary text-secondary-foreground ${fallbackClassName}`}>?</AvatarFallback>
      </Avatar>
    )
  }

  // Generate initials from fullName
  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const initials = getInitials(user.fullName)

  return (
    <Avatar className={className}>
      <AvatarImage src={user.imageUrl} alt={user.fullName} className="object-cover" />
      <AvatarFallback className={`bg-secondary text-secondary-foreground font-medium ${fallbackClassName}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
