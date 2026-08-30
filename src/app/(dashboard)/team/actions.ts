"use server"

import { createAdminClient } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function addTeamMember(formData: FormData) {
  const adminClient = createAdminClient()
  
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const domain = formData.get("domain") as string

  if (!username || !password || !role) {
    return { error: "Missing required fields" }
  }

  // 1. Create the Auth user in Supabase
  const email = `${username}@admin.acm.org`
  
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user." }
  }

  // 2. Insert into team_members table
  const { error: dbError } = await adminClient
    .from("team_members")
    .insert({
      id: authData.user.id,
      username: username,
      role: role,
      domain: domain || null
    })

  if (dbError) {
    // Attempt rollback if DB insert fails
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return { error: dbError.message }
  }

  revalidatePath("/team")
  return { success: true }
}
