"use server"

import { recruitmentsDb } from "@/utils/supabase/recruitments-server"
import { createClient } from "@/utils/supabase/server"

// Batch save applicant statuses
export async function saveApplicantStatuses(changes: Record<string, Record<string, string>>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from("team_members")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "domain_lead" && profile?.role !== "central_admin") {
    return { error: "Permission denied" }
  }

  // Update Project A database
  const promises = Object.entries(changes).map(([id, fields]) => {
    return recruitmentsDb
      .from("recruitments")
      .update(fields)
      .eq("id", id)
  })

  await Promise.all(promises)

  return { success: true }
}

// Finalize round with password confirmation
export async function finalizeRound(round: 1 | 2, password: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return { error: "Unauthorized" }

  // Verify password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password,
  })

  if (signInError) {
    return { error: "Incorrect password. Finalization failed." }
  }

  // Password is correct, update the team_members record
  const fieldToUpdate = round === 1 ? "round_1_finalized" : "round_2_finalized"
  
  const { error: updateError } = await supabase
    .from("team_members")
    .update({ [fieldToUpdate]: true })
    .eq("id", user.id)

  if (updateError) {
    return { error: "Failed to update database: " + updateError.message }
  }

  return { success: true }
}
