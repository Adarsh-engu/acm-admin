import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { AddMemberDialog } from "./components/add-member-dialog"
import { DeleteMemberButton } from "./components/delete-member-button"

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  // Check if current user is central_admin
  const { data: currentUserProfile } = await supabase
    .from("team_members")
    .select("role")
    .eq("id", user.id)
    .single()

  const isCentralAdmin = currentUserProfile?.role === "central_admin"
  
  if (!isCentralAdmin) {
    redirect("/")
  }

  // Fetch all members
  const { data: members, error } = await supabase
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">
            Team Directory
          </h2>
          <p className="text-muted-foreground mt-1">Manage team access and roles.</p>
        </div>
        <AddMemberDialog currentProfile={currentUserProfile} />
      </div>

      {error ? (
        <div className="text-destructive font-medium p-4 bg-destructive/10 rounded-md border border-destructive/20">
          Failed to fetch team members: {error.message}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          {members?.map(member => (
            <div key={member.id} className="p-6 rounded-lg border border-border/50 bg-surface/50 transition-all hover:bg-surface hover:border-acm/30">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{member.username}</h3>
                <DeleteMemberButton 
                  userId={member.id} 
                  username={member.username} 
                  currentUserId={user.id} 
                />
              </div>
              <div className="text-sm text-muted-foreground mt-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="capitalize px-2 py-1 bg-background rounded-md text-xs font-medium text-foreground border border-border/50">
                    {member.role.replace('_', ' ')}
                  </span>
                  {member.domain && (
                    <span className="capitalize px-2 py-1 bg-acm/10 text-acm rounded-md text-xs font-medium border border-acm/20">
                      {member.domain}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {members?.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              No team members found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
