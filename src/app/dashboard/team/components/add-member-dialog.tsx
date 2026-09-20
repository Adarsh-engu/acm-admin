"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addTeamMember } from "../actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

export function AddMemberDialog({ currentProfile }: { currentProfile?: any }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<string>("")
  const [domain, setDomain] = useState<string>("")
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    if (currentProfile?.role === "domain_lead") {
      formData.set("role", "domain_lead") // Assign them same role
      formData.set("domain", currentProfile.domain)
    } else {
      formData.set("role", role)
      if (role === "domain_lead") {
        formData.set("domain", domain)
      }
    }

    const res = await addTeamMember(formData)

    setLoading(false)
    if (res.error) {
      setError(res.error)
    } else {
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-acm hover:bg-acm-bright text-white gap-2" />}>
        <Plus className="w-4 h-4" />
        Add Member
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-border/50">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Create a new account for a team member. They will use the username and password to log in.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" required className="bg-input/30" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Initial Password</Label>
            <Input id="password" name="password" type="password" required className="bg-input/30" />
          </div>

          {currentProfile?.role === "domain_lead" ? (
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value="Domain Team Member" disabled className="bg-input/30 text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Role</Label>
              <Select onValueChange={(val: string | null) => setRole(val || "")} required>
                <SelectTrigger className="bg-input/30">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="central_admin">Central Admin</SelectItem>
                  <SelectItem value="core_team">Core Team</SelectItem>
                  <SelectItem value="domain_lead">Domain Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {currentProfile?.role !== "domain_lead" && role === "domain_lead" && (
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select onValueChange={(val: string | null) => setDomain(val || "")} required>
                <SelectTrigger className="bg-input/30">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Event Management">Event Management</SelectItem>
                  <SelectItem value="Brand & Media">Brand & Media</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Public Relations">Public Relations</SelectItem>
                  <SelectItem value="Sponsorship">Sponsorship</SelectItem>
                  <SelectItem value="Graphic">Graphic</SelectItem>
                  <SelectItem value="Logistics">Logistics</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {error && <div className="text-sm font-medium text-destructive">{error}</div>}

          <Button type="submit" className="w-full bg-acm hover:bg-acm-bright text-white" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
