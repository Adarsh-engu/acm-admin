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

const isFirstPriority = (applicant: any, domain: string) => {
  const p1 = applicant.first_priority
  if (domain === "Public Relations") return p1 === "PR (Public Relations) Team" || p1 === "Public Relations"
  if (domain === "Graphic" || domain === "Graphic Lead") return p1 === "Graphic Team" || p1 === "Graphic Lead" || p1 === "Graphic"
  return p1 === domain || p1 === `${domain} Team`
}

const isSecondPriority = (applicant: any, domain: string) => {
  const p2 = applicant.second_priority
  if (domain === "Public Relations") return p2 === "PR (Public Relations) Team" || p2 === "Public Relations"
  if (domain === "Graphic" || domain === "Graphic Lead") return p2 === "Graphic Team" || p2 === "Graphic Lead" || p2 === "Graphic"
  return p2 === domain || p2 === `${domain} Team`
}

export const columns: any[] = [
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
      
      // Compute actual current statuses (applying unsaved local changes if they exist)
      const r1s1 = localChanges[applicant.id]?.r1_status_1 || applicant.r1_status_1 || "Pending"
      const r1s2 = localChanges[applicant.id]?.r1_status_2 || applicant.r1_status_2 || "Pending"
      const r2s1 = localChanges[applicant.id]?.r2_status_1 || applicant.r2_status_1 || "Pending"
      const r2s2 = localChanges[applicant.id]?.r2_status_2 || applicant.r2_status_2 || "Pending"

      if (profile?.role === "domain_lead") {
        const domain = profile.domain
        const isPriority1 = isFirstPriority(applicant, domain)
        const isPriority2 = isSecondPriority(applicant, domain)
        
        let status = "Pending"
        if (currentRound === 1) {
          if (isPriority1) status = r1s1
          else if (isPriority2) status = r1s2
        } else {
          if (isPriority1) status = r2s1
          else if (isPriority2) status = r2s2
        }

        let variant: "default" | "secondary" | "destructive" | "outline" = "default"
        if (status === "Pending") variant = "secondary"
        else if (status === "Rejected") variant = "destructive"
        else variant = "default"
        
        return <Badge variant={variant}>{status}</Badge>
      }

      // For Core Team / Admin: Show overall calculated status
      let s1 = currentRound === 1 ? r1s1 : r2s1
      let s2 = currentRound === 1 ? r1s2 : r2s2
      
      let overallStatus = "Pending Review"
      let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"

      if (s1 === "Approved" || s2 === "Approved") {
        overallStatus = "Shortlisted"
        variant = "default"
      } else if (s1 === "Rejected" && s2 === "Rejected") {
        overallStatus = "Rejected"
        variant = "destructive"
      } else if (s1 === "Rejected" || s2 === "Rejected") {
        overallStatus = "Pending Review" // waiting for the other domain
      }

      return <Badge variant={variant}>{overallStatus}</Badge>
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
