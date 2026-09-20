"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

export type Applicant = {
  id: string
  created_at: string
  full_name: string
  college_email: string
  roll_number: string
  phone: string
  year: string
  branch: string
  section: string
  first_priority: string
  second_priority: string
  joined_whatsapp: boolean
  r1_status_1: string
  r1_status_2: string
  r2_status_1: string
  r2_status_2: string
}

export const isFirstPriority = (applicant: any, domain: string) => {
  const p1 = applicant.first_priority
  if (domain === "Public Relations") return p1 === "PR (Public Relations) Team" || p1 === "Public Relations"
  if (domain === "Graphic" || domain === "Graphic Lead") return p1 === "Graphic Team" || p1 === "Graphic Lead" || p1 === "Graphic"
  if (domain === "Arts") return p1 === "ARTS Team" || p1 === "Arts"
  return p1 === domain || p1 === `${domain} Team`
}

export const isSecondPriority = (applicant: any, domain: string) => {
  const p2 = applicant.second_priority
  if (domain === "Public Relations") return p2 === "PR (Public Relations) Team" || p2 === "Public Relations"
  if (domain === "Graphic" || domain === "Graphic Lead") return p2 === "Graphic Team" || p2 === "Graphic Lead" || p2 === "Graphic"
  if (domain === "Arts") return p2 === "ARTS Team" || p2 === "Arts"
  return p2 === domain || p2 === `${domain} Team`
}

export const hasValidSecondPriority = (applicant: any) => {
  if (!applicant.second_priority) return false
  const p1 = String(applicant.first_priority || "").trim().toLowerCase()
  const p2 = String(applicant.second_priority).trim().toLowerCase()
  if (!p2 || p2 === "none" || p2 === "null" || p2 === "undefined" || p2 === p1) return false
  return true
}

export const getDomainSpecificStatus = (
  applicant: any,
  domain: string,
  currentRound: 1 | 2,
  localChanges: Record<string, Record<string, string>> = {}
): "Approved" | "Rejected" | "Pending" | null => {
  const isP1 = isFirstPriority(applicant, domain)
  const isP2 = isSecondPriority(applicant, domain)
  if (!isP1 && !isP2) return null

  const r1s1 = localChanges[applicant.id]?.r1_status_1 || applicant.r1_status_1 || "Pending"
  const r1s2 = localChanges[applicant.id]?.r1_status_2 || applicant.r1_status_2 || "Pending"
  const r2s1 = localChanges[applicant.id]?.r2_status_1 || applicant.r2_status_1 || "Pending"
  const r2s2 = localChanges[applicant.id]?.r2_status_2 || applicant.r2_status_2 || "Pending"

  let status = "Pending"
  if (currentRound === 1) {
    status = isP1 ? r1s1 : r1s2
  } else {
    status = isP1 ? r2s1 : r2s2
  }

  if (status === "Approved") return "Approved"
  if (status === "Rejected") return "Rejected"
  return "Pending"
}

export const getOverallStatus = (
  applicant: any,
  currentRound: 1 | 2,
  localChanges: Record<string, Record<string, string>> = {}
): "Approved" | "Rejected" | "Pending" => {
  const r1s1 = localChanges[applicant.id]?.r1_status_1 || applicant.r1_status_1 || "Pending"
  const r1s2 = localChanges[applicant.id]?.r1_status_2 || applicant.r1_status_2 || "Pending"
  const r2s1 = localChanges[applicant.id]?.r2_status_1 || applicant.r2_status_1 || "Pending"
  const r2s2 = localChanges[applicant.id]?.r2_status_2 || applicant.r2_status_2 || "Pending"

  const s1 = currentRound === 1 ? r1s1 : r2s1
  const s2 = currentRound === 1 ? r1s2 : r2s2
  const hasP2 = hasValidSecondPriority(applicant)

  // 1. If any one of the lead approves it then directly show as approved
  if (s1 === "Approved" || (hasP2 && s2 === "Approved")) {
    return "Approved"
  }

  // 2. If both leads reject them (or if only 1 priority and that lead rejected them)
  if (s1 === "Rejected" && (!hasP2 || s2 === "Rejected")) {
    return "Rejected"
  }

  // 3. Otherwise (e.g. one rejected and other pending, or both pending)
  return "Pending"
}

export const getApplicantDisplayStatus = (
  applicant: any,
  currentRound: 1 | 2,
  profile: any,
  domainFilter?: string | null,
  localChanges: Record<string, Record<string, string>> = {}
): { status: "Approved" | "Rejected" | "Pending"; label: string; variant: "default" | "destructive" | "secondary" } => {
  const activeDomain = profile?.role === "domain_lead" ? profile.domain : (domainFilter && domainFilter !== "All Domains" ? domainFilter : null)

  if (activeDomain) {
    const domainStatus = getDomainSpecificStatus(applicant, activeDomain, currentRound, localChanges) || "Pending"
    return {
      status: domainStatus,
      label: domainStatus,
      variant: domainStatus === "Approved" ? "default" : (domainStatus === "Rejected" ? "destructive" : "secondary")
    }
  }

  const overall = getOverallStatus(applicant, currentRound, localChanges)
  return {
    status: overall,
    label: overall === "Approved" ? "Approved" : (overall === "Rejected" ? "Rejected" : "Pending Review"),
    variant: overall === "Approved" ? "default" : (overall === "Rejected" ? "destructive" : "secondary")
  }
}

export const columns: any[] = [
  {
    id: "sno",
    header: "S.No",
    cell: ({ row }: any) => (
      <span className="text-muted-foreground font-mono text-xs">
        {typeof row.index === "number" ? row.index + 1 : "-"}
      </span>
    ),
  },
  {
    accessorKey: "full_name",
    header: "Full Name",
  },
  {
    accessorKey: "roll_number",
    header: "Roll Number",
  },
  {
    accessorKey: "branch",
    header: "Branch",
  },
  {
    accessorKey: "section",
    header: "Section",
  },
  {
    accessorKey: "year",
    header: "Year",
  },
  {
    accessorKey: "first_priority",
    header: "1st Priority",
  },
  {
    accessorKey: "second_priority",
    header: "2nd Priority",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row, table }: any) => {
      const applicant = row.original
      const meta = table.options.meta as any
      const profile = meta?.profile
      const currentRound = meta?.currentRound || 1
      const localChanges = meta?.localChanges || {}
      const domainFilter = meta?.domainFilter || null

      const display = getApplicantDisplayStatus(applicant, currentRound, profile, domainFilter, localChanges)

      return <Badge variant={display.variant}>{display.label}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row, table }: any) => {
      const applicant = row.original
      const meta = table.options.meta as any
      const profile = meta?.profile
      const currentRound = meta?.currentRound || 1
      const updateLocalChange = meta?.updateLocalChange
      const isFinalized = currentRound === 1 ? profile?.round_1_finalized : profile?.round_2_finalized

      if (profile?.role !== "domain_lead") return null
      if (isFinalized) return null // Hide actions if round is finalized

      const domain = profile.domain
      const isPriority1 = isFirstPriority(applicant, domain)
      const isPriority2 = isSecondPriority(applicant, domain)

      if (!isPriority1 && !isPriority2) return null

      const fieldToUpdate = currentRound === 1 
        ? (isPriority1 ? "r1_status_1" : "r1_status_2")
        : (isPriority1 ? "r2_status_1" : "r2_status_2")

      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center hover:bg-white/10 rounded-md">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => updateLocalChange(applicant.id, fieldToUpdate, "Approved")}>
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateLocalChange(applicant.id, fieldToUpdate, "Rejected")}>
              Reject
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateLocalChange(applicant.id, fieldToUpdate, "Pending")}>
              Reset to Pending
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
