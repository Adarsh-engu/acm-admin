"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteTeamMember } from "../actions"
import { Button } from "@/components/ui/button"

export function DeleteMemberButton({ userId, username, currentUserId }: { userId: string, username: string, currentUserId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSelf = userId === currentUserId

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isSelf) {
      alert("You cannot delete your own account.")
      return
    }

    if (confirm(`Are you sure you want to delete ${username}'s access? This cannot be undone.`)) {
      setIsDeleting(true)
      setError(null)
      const res = await deleteTeamMember(userId)
      if (res.error) {
        setError(res.error)
        setIsDeleting(false)
      }
    }
  }

  if (isSelf) return null // Don't show delete button for own profile

  return (
    <div className="flex flex-col items-end">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleDelete} 
        disabled={isDeleting}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        title={`Delete ${username}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      {error && <span className="text-xs text-destructive mt-1">{error}</span>}
    </div>
  )
}
