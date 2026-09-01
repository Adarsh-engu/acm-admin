import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("team_members")
    .select("role")
    .eq("id", user.id)
    .single();

  return (
    <SidebarProvider>
      <AppSidebar role={profile?.role} />
      <main className="w-full h-screen overflow-y-auto bg-background flex flex-col relative">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-6 backdrop-blur-md sticky top-0 z-20 bg-background/80">
          <SidebarTrigger />
          <div className="w-full flex justify-between items-center ml-4">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">Admin Portal</h1>
            <div className="text-sm text-muted-foreground">Logged in as <span className="text-foreground font-medium">{user.email?.split('@')[0]}</span></div>
          </div>
        </header>
        <div className="flex-1 p-6 lg:p-10 relative z-10">
          {children}
        </div>
        
        {/* Subtle background effects for the dashboard */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-acm/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      </main>
    </SidebarProvider>
  );
}
