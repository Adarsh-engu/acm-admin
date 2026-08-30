import { createClient } from "@supabase/supabase-js";

// This client accesses Project A (Recruitments database) using the Service Role Key.
// It bypasses RLS and should NEVER be exposed to the browser.
export const recruitmentsDb = createClient(
  process.env.SUPABASE_RECRUITMENTS_URL!,
  process.env.SUPABASE_RECRUITMENTS_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
