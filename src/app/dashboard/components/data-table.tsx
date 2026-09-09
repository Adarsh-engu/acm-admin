"use client"
import * as React from "react"
import { useRouter } from "next/navigation"

import {
  ColumnDef,
  flexRender,
  createPaginatedRowModel,
  rowPaginationFeature,
  coreFeatures,
  createCoreRowModel,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as XLSX from "xlsx"
import { ApplicantModal } from "./applicant-modal"
import { Applicant } from "./columns"
import { saveApplicantStatuses, finalizeRound } from "../actions"
import { Check, Save, Lock } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface DataTableProps {
  columns: any[]
  data: any[]
  profile?: any
  overrideRound?: 1 | 2
  hideRoundControls?: boolean
}

const isApplicantInDomain = (applicant: any, domain: string) => {
  const p1 = applicant.first_priority
  const p2 = applicant.second_priority
  if (domain === "Public Relations") return p1 === "PR (Public Relations) Team" || p2 === "PR (Public Relations) Team" || p1 === "Public Relations" || p2 === "Public Relations"
  if (domain === "Graphic" || domain === "Graphic Lead") return p1 === "Graphic Team" || p2 === "Graphic Team" || p1 === "Graphic Lead" || p2 === "Graphic Lead" || p1 === "Graphic" || p2 === "Graphic"
  return p1 === domain || p2 === domain || p1 === `${domain} Team` || p2 === `${domain} Team`
}

const isFirstPriority = (applicant: any, domain: string) => {
  const p1 = applicant.first_priority
  if (domain === "Public Relations") return p1 === "PR (Public Relations) Team" || p1 === "Public Relations"
  if (domain === "Graphic" || domain === "Graphic Lead") return p1 === "Graphic Team" || p1 === "Graphic Lead" || p1 === "Graphic"
  return p1 === domain || p1 === `${domain} Team`
}


export function DataTable({
  columns,
  data,
  profile,
  overrideRound,
  hideRoundControls,
}: DataTableProps) {
  const router = useRouter()
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 15 })
  const [localCurrentRound, setLocalCurrentRound] = React.useState<1 | 2>(1)
  const currentRound = overrideRound || localCurrentRound

  const [localChanges, setLocalChanges] = React.useState<Record<string, Record<string, string>>>({})
  const [isSaving, setIsSaving] = React.useState(false)
  
  const [selectedApplicant, setSelectedApplicant] = React.useState<Applicant | null>(null)
  
  const [finalizeOpen, setFinalizeOpen] = React.useState(false)
  const [finalizePassword, setFinalizePassword] = React.useState("")
  const [isFinalizing, setIsFinalizing] = React.useState(false)
  const [finalizeError, setFinalizeError] = React.useState<string | null>(null)

  const [domainFilter, setDomainFilter] = React.useState<string>("All Domains")
  const [yearFilter, setYearFilter] = React.useState<string>("All Years")

  const availableYears = React.useMemo(() => {
    const yearSet = new Set<string>(["2nd Year", "3rd Year"])
    data.forEach((applicant: any) => {
      if (applicant?.year !== undefined && applicant?.year !== null) {
        const y = String(applicant.year).trim()
        if (y) yearSet.add(y)
      }
    })
    return Array.from(yearSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  }, [data])

  // Filter data for Domain Leads if round is finalized (hide rejected)
  // Also for Round 2, only show applicants approved in Round 1
  const filteredData = React.useMemo(() => {
    let result = [...data] as any[]

    if (currentRound === 2) {
      result = result.filter(a => a.r1_status_1 === "Approved" || a.r1_status_2 === "Approved")
    }

    if (profile?.role === "domain_lead") {
      const isFinalized = currentRound === 1 ? profile.round_1_finalized : profile.round_2_finalized
      if (isFinalized) {
        result = result.filter(a => {
          const isP1 = isFirstPriority(a, profile.domain)
          const status = currentRound === 1 
            ? (isP1 ? a.r1_status_1 : a.r1_status_2)
            : (isP1 ? a.r2_status_1 : a.r2_status_2)
          return status !== "Rejected"
        })
      }
    } else {
      // Admin/Core Team domain filter
      if (domainFilter !== "All Domains") {
        result = result.filter(a => isApplicantInDomain(a, domainFilter))
      }
    }

    // Filter by Year
    if (yearFilter !== "All Years") {
      result = result.filter(a => {
        if (a?.year === undefined || a?.year === null) return false
        return String(a.year).trim().toLowerCase() === yearFilter.toLowerCase()
      })
    }

    return result
  }, [data, currentRound, profile, domainFilter, yearFilter])

  const updateLocalChange = (applicantId: string, field: string, value: string) => {
    setLocalChanges(prev => ({
      ...prev,
      [applicantId]: {
        ...(prev[applicantId] || {}),
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    if (Object.keys(localChanges).length === 0) return
    setIsSaving(true)
    const res = await saveApplicantStatuses(localChanges)
    setIsSaving(false)
    if (res?.success) {
      setLocalChanges({})
      router.refresh()
    } else {
      alert(res?.error || "Failed to save")
    }
  }

  const handleFinalize = async () => {
    setIsFinalizing(true)
    setFinalizeError(null)
    const res = await finalizeRound(currentRound, finalizePassword)
    setIsFinalizing(false)
    
    if (res?.success) {
      setFinalizeOpen(false)
      setFinalizePassword("")
      router.refresh()
    } else {
      setFinalizeError(res?.error || "Failed to finalize")
    }
  }

  const table = useTable({
    data: filteredData as any[],
    columns,
    features: [
      ...Object.values(coreFeatures),
      rowPaginationFeature
    ],
    coreRowModel: createCoreRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    state: { pagination },
    onPaginationChange: setPagination,
    meta: {
      profile,
      currentRound,
      localChanges,
      updateLocalChange
    }
  } as any)

  const handleExport = () => {
    const exportData = filteredData.map((applicant: any, index: number) => {
      const { id, created_at, r1_status_1, r1_status_2, r2_status_1, r2_status_2, ...rest } = applicant
      return {
        "S.No": index + 1,
        ...rest
      }
    })
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Applicants")
    XLSX.writeFile(wb, `acm_applicants_round_${currentRound}.xlsx`)
  }

  const hasChanges = Object.keys(localChanges).length > 0
  const isRoundFinalized = currentRound === 1 ? profile?.round_1_finalized : profile?.round_2_finalized
  const canFinalize = profile?.role === "domain_lead" && !isRoundFinalized

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          {!hideRoundControls && (
            <div className="flex bg-surface border border-border/50 rounded-lg p-1">
              <button 
                onClick={() => {
                  setLocalCurrentRound(1)
                  setPagination(prev => ({ ...prev, pageIndex: 0 }))
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentRound === 1 ? 'bg-acm text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Round 1
              </button>
              <button 
                onClick={() => {
                  setLocalCurrentRound(2)
                  setPagination(prev => ({ ...prev, pageIndex: 0 }))
                }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${currentRound === 2 ? 'bg-acm text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Round 2
              </button>
            </div>
          )}
          
          {!hideRoundControls && profile?.role !== "domain_lead" && (
            <select 
              value={domainFilter}
              onChange={(e) => {
                setDomainFilter(e.target.value)
                setPagination(prev => ({ ...prev, pageIndex: 0 }))
              }}
              className="bg-surface border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-acm/50"
            >
              <option value="All Domains">All Domains</option>
              <option value="Event Management">Event Management</option>
              <option value="Brand & Media">Brand & Media</option>
              <option value="Technical">Technical</option>
              <option value="Public Relations">Public Relations</option>
              <option value="Sponsorship">Sponsorship</option>
              <option value="Graphic">Graphic</option>
              <option value="Logistics">Logistics</option>
              <option value="Documentation">Documentation</option>
            </select>
          )}

          <select 
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value)
              setPagination(prev => ({ ...prev, pageIndex: 0 }))
            }}
            className="bg-surface border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-acm/50"
          >
            <option value="All Years">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <span className="text-xs font-medium px-3 py-2 rounded-lg bg-surface border border-border/50 text-muted-foreground whitespace-nowrap">
            Total: {filteredData.length}
          </span>
        </div>

        <div className="flex gap-3">
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          )}

          {canFinalize && (
            <Button onClick={() => setFinalizeOpen(true)} variant="outline" className="border-acm text-acm hover:bg-acm/10 gap-2">
              <Check className="w-4 h-4" />
              Finalize Round {currentRound}
            </Button>
          )}

          <Button onClick={handleExport} variant="outline" className="border-border/50 hover:bg-surface/50">
            Export to Excel
          </Button>
        </div>
      </div>

      {isRoundFinalized && profile?.role === "domain_lead" && (
        <div className="mb-4 p-3 bg-acm/10 border border-acm/20 text-acm-bright rounded-md text-sm font-medium flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Round {currentRound} results have been finalized. Rejected applicants are hidden.
        </div>
      )}

      <div className="rounded-md border border-border/50 bg-surface/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-surface">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border/50 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={`text-foreground font-semibold ${header.id === "sno" ? "w-16" : ""}`}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={`border-border/50 hover:bg-white/5 cursor-pointer ${
                    profile?.role === "domain_lead" 
                      ? (isFirstPriority(row.original, profile?.domain) ? 'bg-acm/5 border-l-2 border-l-acm' : 'bg-muted/30 border-l-2 border-l-muted-foreground')
                      : ''
                  }`}
                  onClick={(e) => {
                    // Prevent row click if clicking action menu
                    if ((e.target as HTMLElement).closest('button')) return
                    setSelectedApplicant(row.original as Applicant)
                  }}
                >
                  {row.getAllCells().map((cell: any) => (
                    <TableCell key={cell.id} className={cell.column.id === "sno" ? "w-16" : ""}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No applicants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="border-border/50"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="border-border/50"
        >
          Next
        </Button>
      </div>

      <ApplicantModal 
        applicant={selectedApplicant} 
        open={!!selectedApplicant} 
        onOpenChange={(open) => !open && setSelectedApplicant(null)} 
        currentRound={currentRound} 
      />

      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background border-border/50">
          <DialogHeader>
            <DialogTitle>Finalize Round {currentRound}</DialogTitle>
            <DialogDescription>
              Are you sure you want to finalize your decisions? This will lock in your choices and hide all rejected applicants from your dashboard.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Please enter your password to confirm:</p>
              <Input 
                type="password" 
                value={finalizePassword} 
                onChange={e => setFinalizePassword(e.target.value)} 
                className="bg-input/30" 
                placeholder="Your password"
              />
            </div>
            
            {finalizeError && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {finalizeError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFinalizeOpen(false)}>Cancel</Button>
            <Button onClick={handleFinalize} disabled={!finalizePassword || isFinalizing} className="bg-acm hover:bg-acm-bright text-white">
              {isFinalizing ? "Finalizing..." : "Finalize Results"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
