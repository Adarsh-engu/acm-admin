"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updatePassword } from "../actions"
import { Lock } from "lucide-react"

export function PasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const form = e.currentTarget
    const formData = new FormData(form)
    const res = await updatePassword(formData)

    setLoading(false)
    if (res?.error) {
      setError(res.error)
    } else {
      setSuccess(true)
      form.reset()
    }
  }

  return (
    <div className="max-w-md p-6 rounded-lg border border-border/50 bg-surface/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-acm/10 text-acm rounded-md">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Change Password</h3>
          <p className="text-sm text-muted-foreground">Securely update your account password.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            required 
            minLength={6} 
            className="bg-input/30" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type="password" 
            required 
            minLength={6} 
            className="bg-input/30" 
          />
        </div>

        {error && (
          <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            {error}
          </div>
        )}
        
        {success && (
          <div className="text-sm font-medium text-green-500 bg-green-500/10 p-3 rounded-md border border-green-500/20">
            Password updated successfully!
          </div>
        )}

        <Button type="submit" className="w-full bg-acm hover:bg-acm-bright text-white" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  )
}
