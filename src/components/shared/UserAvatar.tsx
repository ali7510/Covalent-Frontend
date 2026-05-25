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
        <AvatarFallback className={fallbackClassName}>?</AvatarFallback>
      </Avatar>
    )
  }

  // Generate initials from fullName
  const getInitials = (name: string) => {
    if (!name) return "U"
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  const initials = getInitials(user.fullName)

  return (
    <Avatar className={className}>
      <AvatarImage src={user.imageUrl} alt={user.fullName} />
      <AvatarFallback className={`bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium ${fallbackClassName}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
