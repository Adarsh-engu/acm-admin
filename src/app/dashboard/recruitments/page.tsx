import { createClient } from "@/utils/supabase/server"
import { recruitmentsDb } from "@/utils/supabase/recruitments-server"
import { redirect } from "next/navigation"
import { RecruitmentsTabs } from "./components/recruitments-tabs"

export const dynamic = "force-dynamic"

export default async function RecruitmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role === "domain_lead") {
    redirect("/")
  }

  // Fetch all domain leads to check their finalize status
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

  // Fetch recruitments data
  let query = recruitmentsDb.from("recruitments").select("*")
  
  // If Domain Lead, only fetch their domain data to save bandwidth, 
  // but if Core Team / Admin, fetch all.
  if (profile?.role === "domain_lead" && profile?.domain) {
    const d = profile.domain
    const dTeam = `${d} Team`
    query = query.or(`first_priority.eq."${d}",second_priority.eq."${d}",first_priority.eq."${dTeam}",second_priority.eq."${dTeam}"`)
  }

  const { data: recruitments } = await query

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">Recruitments Overview</h2>
        <p className="text-muted-foreground mt-1">Track round progress and finalize recruitment stages.</p>
      </div>
      
      <RecruitmentsTabs 
        profile={profile}
        domainLeads={domainLeads || []}
        recruitments={recruitments || []}
        isRound1GloballyFinalized={isRound1GloballyFinalized}
        isRound2GloballyFinalized={isRound2GloballyFinalized}
      />
    </div>
  )
}
