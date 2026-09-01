import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Slideshow from "./components/Slideshow";
import Image from "next/image";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const awaitedParams = await searchParams;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Panel: Kinetic Slideshow (hidden on mobile, visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-border/50">
        <Slideshow />
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Subtle background glow for right side */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[300px] h-[300px] bg-acm/10 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-sm space-y-8 z-10">
          <div className="space-y-2 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Show logo only on mobile since left panel is hidden */}
            <Image 
              src="/images/acm-logo-rect.png" 
              alt="ACM Logo" 
              width={160} 
              height={40} 
              className="mb-4 lg:hidden block drop-shadow-lg"
            />
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
              ACM GRIET
            </h2>
            <p className="text-muted-foreground">
              Sign in to access the admin portal
            </p>
          </div>

          <form action={login} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="font-medium text-foreground/80">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="bg-input/30 border-border/50 focus-visible:ring-acm/50 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium text-foreground/80">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-input/30 border-border/50 focus-visible:ring-acm/50 h-12"
                />
              </div>
            </div>
            
            {awaitedParams?.message && (
              <div className="text-destructive text-sm text-center font-medium bg-destructive/10 border border-destructive/20 py-3 rounded-md">
                {awaitedParams.message}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-acm hover:bg-acm-bright text-white font-medium h-12 text-base transition-all shadow-lg shadow-acm/20"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
