import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Applicant } from "./columns"
import { Badge } from "@/components/ui/badge"

interface ApplicantModalProps {
  applicant: Applicant | null
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRound: 1 | 2
}

export function ApplicantModal({ applicant, open, onOpenChange, currentRound }: ApplicantModalProps) {
  if (!applicant) return null

  const getVariant = (status: string) => {
    if (status === "Pending") return "secondary"
    if (status === "Rejected") return "destructive"
    return "default"
  }

  const s1 = currentRound === 1 ? applicant.r1_status_1 : applicant.r2_status_1
  const s2 = currentRound === 1 ? applicant.r1_status_2 : applicant.r2_status_2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl">{applicant.full_name}</DialogTitle>
          <DialogDescription>Applicant Details - Round {currentRound}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4 text-sm">
          <div>
            <span className="text-muted-foreground block mb-1">Roll Number</span>
            <span className="font-medium">{applicant.roll_number}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Branch, Sec & Year</span>
            <span className="font-medium">{applicant.branch} - {applicant.section} - {applicant.year}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Email</span>
            <span className="font-medium">{applicant.college_email}</span>
          </div>
          <div>
            <span className="text-muted-foreground block mb-1">Phone</span>
            <span className="font-medium">{applicant.phone}</span>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Domain Statuses</h4>
          
          <div className="flex items-center justify-between p-3 rounded-md bg-surface/50 border border-border/50">
            <div>
              <span className="text-xs text-muted-foreground block">1st Priority</span>
              <span className="font-medium">{applicant.first_priority}</span>
            </div>
            <Badge variant={getVariant(s1)}>{s1 || "Pending"}</Badge>
          </div>

          {applicant.second_priority && (
            <div className="flex items-center justify-between p-3 rounded-md bg-surface/50 border border-border/50">
              <div>
                <span className="text-xs text-muted-foreground block">2nd Priority</span>
                <span className="font-medium">{applicant.second_priority}</span>
              </div>
              <Badge variant={getVariant(s2)}>{s2 || "Pending"}</Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
