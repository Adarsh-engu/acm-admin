"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, LogIn } from "lucide-react"

export function ActivityModal({ 
  children, 
  memberId, 
  memberName 
}: { 
  children: React.ReactNode, 
  memberId: string, 
  memberName: string 
}) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setLoading(true)
      const { data, error } = await supabase
        .from("login_logs")
        .select("*")
        .eq("user_id", memberId)
        .order("logged_in_at", { ascending: false })
        .limit(30)
        
      if (!error && data) {
        setLogs(data)
      }
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <div className="cursor-pointer group h-full" onClick={() => handleOpenChange(true)}>
        {children}
      </div>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Login History: {memberName}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 bg-surface/50 rounded-lg border border-border/50">
              No recent login history found.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-surface/50">
                  <div className="bg-acm/10 p-2 rounded-md">
                    <LogIn className="h-4 w-4 text-acm" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      Logged in successfully
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.logged_in_at).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
