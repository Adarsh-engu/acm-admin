"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  let identifier = formData.get("username") as string;
  
  // Supabase Auth requires an email format. If they enter a plain username, 
  // we append a dummy domain behind the scenes to make it compatible.
  if (!identifier.includes("@")) {
    identifier = `${identifier}@admin.acm.org`;
  }

  const data = {
    email: identifier,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/login?message=Could not authenticate user");
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("login_logs").insert({ user_id: user.id });
    }
  } catch (e) {
    console.error("Failed to log activity:", e);
  }

  console.log(`[AUTH] User logged in: ${formData.get("username")} at ${new Date().toISOString()}`);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
