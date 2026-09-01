import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { PasswordForm } from "./components/password-form"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account preferences and security.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <div className="p-6 rounded-lg border border-border/50 bg-surface/50">
            <h3 className="font-semibold text-lg mb-4">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Username</span>
                <span className="font-medium">{profile?.username}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Role</span>
                <span className="font-medium capitalize">{profile?.role?.replace('_', ' ')}</span>
              </div>
              {profile?.domain && (
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">Domain</span>
                  <span className="font-medium">{profile.domain}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <PasswordForm />
      </div>
    </div>
  )
}
