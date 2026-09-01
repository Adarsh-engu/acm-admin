import { createClient } from "@/utils/supabase/server"
import { recruitmentsDb } from "@/utils/supabase/recruitments-server"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { RecruitmentsTabs } from "./recruitments/components/recruitments-tabs"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ApplicantsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", user.id)
    .single()

  let query = recruitmentsDb
    .from("recruitments")
    .select("*")
    .order("created_at", { ascending: false })

  if (profile?.role === "domain_lead" && profile?.domain) {
    const domain = profile.domain
    const domainTeam = `${domain} Team`
    query = query.or(`first_priority.eq."${domain}",second_priority.eq."${domain}",first_priority.eq."${domainTeam}",second_priority.eq."${domainTeam}"`)
  }

  const { data, error } = await query

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Applicants</h2>
          <p className="text-muted-foreground mt-1">Manage and export recruitments data.</p>
        </div>
        <div className="text-destructive font-medium p-4 bg-destructive/10 rounded-md border border-destructive/20">
          Failed to fetch applicants: {error.message}
        </div>
      </div>
    )
  }

  if (profile?.role === "domain_lead") {
    // Fetch domain leads to check their finalize status
    const { data: domainLeads } = await supabase
      .from("team_members")
      .select("domain, round_1_finalized, round_2_finalized")
      .eq("role", "domain_lead")

    // Fetch central admin for global state
    const { data: centralAdmins } = await supabase
      .from("team_members")
      .select("round_1_finalized, round_2_finalized")
      .eq("role", "central_admin")

    const isRound1GloballyFinalized = centralAdmins?.some(a => a.round_1_finalized) || false
    const isRound2GloballyFinalized = centralAdmins?.some(a => a.round_2_finalized) || false

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Track your domain's round progress and finalize recruitment stages.</p>
        </div>
        
        <RecruitmentsTabs 
          profile={profile}
          domainLeads={domainLeads || []}
          recruitments={data || []}
          isRound1GloballyFinalized={isRound1GloballyFinalized}
          isRound2GloballyFinalized={isRound2GloballyFinalized}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">Applicants</h2>
        <p className="text-muted-foreground mt-1">Manage and export recruitments data.</p>
      </div>
      <DataTable columns={columns} data={data || []} profile={profile} />
    </div>
  )
}
