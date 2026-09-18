"use client"

import React, { useState } from "react"
import { Check, Lock, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { globalFinalizeRound } from "../../actions"
import { useRouter } from "next/navigation"

const DOMAINS = [
  "Event Management",
  "Brand & Media",
  "Technical",
  "Public Relations",
  "Sponsorship",
  "Graphic",
  "Logistics",
  "Documentation"
]

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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DataTable } from "../../components/data-table"
import { columns } from "../../components/columns"

export function RecruitmentsTabs({
  profile,
  domainLeads,
  recruitments,
  isRound1GloballyFinalized,
  isRound2GloballyFinalized
}: {
  profile: any
  domainLeads: any[]
  recruitments: any[]
  isRound1GloballyFinalized: boolean
  isRound2GloballyFinalized: boolean
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1)
  const [isFinalizing, setIsFinalizing] = useState(false)

  const isCentralAdmin = profile?.role === "central_admin"
  const isDomainLead = profile?.role === "domain_lead"

  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  // Only show the domain lead's own domain if they are a domain lead
  const visibleDomains = isDomainLead ? [profile.domain] : DOMAINS

  const handleGlobalFinalize = async (round: 1 | 2) => {
    if (!confirm(`Are you sure you want to GLOBALLY finalize Round ${round}? This will unlock the next round for all teams.`)) {
      return
    }
    
    setIsFinalizing(true)
    const res = await globalFinalizeRound(round)
    setIsFinalizing(false)
    
    if (res?.success) {
      router.refresh()
    } else {
      alert(res?.error || "Failed to finalize")
    }
  }

  const renderDomainStats = (domain: string, round: 1 | 2) => {
    // Determine if this specific domain has finalized this round
    const domainLeadRecord = domainLeads.find(l => l.domain === domain)
    const isDomainFinalized = round === 1 ? domainLeadRecord?.round_1_finalized : domainLeadRecord?.round_2_finalized

    // Get applicants who applied to this domain (priority 1 or 2)
    const applied = recruitments.filter(r => isApplicantInDomain(r, domain))

    // Calculate pushed, rejected, pending based on round
    let pushed = 0
    let rejected = 0
    let pending = 0
    
    if (round === 1) {
      applied.forEach(r => {
        const isP1 = isFirstPriority(r, domain)
        const status = isP1 ? r.r1_status_1 : r.r1_status_2
        if (status === "Approved") pushed++
        else if (status === "Rejected") rejected++
        else pending++
      })
    } else {
      applied.forEach(r => {
        const isP1 = isFirstPriority(r, domain)
        const status = isP1 ? r.r2_status_1 : r.r2_status_2
        if (status === "Approved") pushed++
        else if (status === "Rejected") rejected++
        else pending++
      })
    }

    return (
      <div 
        key={domain} 
        onClick={() => !isDomainLead && setSelectedDomain(domain)}
        className={`p-5 rounded-lg border border-border/50 bg-surface/50 flex flex-col gap-4 ${!isDomainLead ? 'cursor-pointer hover:bg-surface hover:border-acm/30 transition-all' : ''}`}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{domain}</h3>
          {isDomainFinalized ? (
            <span className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
              <CheckCircle2 className="w-3 h-3" />
              Finalized
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
              <Circle className="w-3 h-3" />
              In Progress
            </span>
          )}
        </div>
        
        <div className="grid gap-4 mt-2 grid-cols-4">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-foreground">{applied.length}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Applied</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-acm-bright">{pushed}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {round === 1 ? "Pushed" : "Selected"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-destructive">{rejected}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rejected</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-amber-500">{pending}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending</span>
          </div>
        </div>
        {!isDomainLead && (
          <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
            <span>Click to view candidates</span>
            <span>{pending} pending</span>
          </div>
        )}
      </div>
    )
  }

  // Get candidates for the selected domain popup
  const selectedDomainCandidates = selectedDomain ? recruitments.filter(r => isApplicantInDomain(r, selectedDomain)) : []

  // Check if ALL visible domains have finalized (for Central Admin global finalize button)
  const allDomainsFinalizedR1 = visibleDomains.every(d => domainLeads.find(l => l.domain === d)?.round_1_finalized)
  const allDomainsFinalizedR2 = visibleDomains.every(d => domainLeads.find(l => l.domain === d)?.round_2_finalized)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex bg-surface border border-border/50 rounded-lg p-1 w-fit">
        <button 
          onClick={() => setActiveTab(1)}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 1 ? 'bg-acm text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Round 1
        </button>
        <button 
          onClick={() => setActiveTab(2)}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 2 ? 'bg-acm text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Round 2
        </button>
        <button 
          onClick={() => setActiveTab(3)}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 3 ? 'bg-acm text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Final Shortlisted
        </button>
      </div>

      {activeTab === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center bg-surface/30 p-4 rounded-lg border border-border/50">
            <div>
              <h3 className="font-semibold text-foreground">Round 1 Progress</h3>
              <p className="text-sm text-muted-foreground">Monitor each domain's evaluation status.</p>
            </div>
            {isCentralAdmin && !isRound1GloballyFinalized && (
              <Button 
                onClick={() => handleGlobalFinalize(1)}
                disabled={!allDomainsFinalizedR1 || isFinalizing}
                className={allDomainsFinalizedR1 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-muted text-muted-foreground"}
              >
                <Check className="w-4 h-4 mr-2" />
                Global Finalize Round 1
              </Button>
            )}
            {isRound1GloballyFinalized && (
              <div className="flex items-center gap-2 text-green-500 font-medium bg-green-500/10 px-4 py-2 rounded-md">
                <CheckCircle2 className="w-5 h-5" />
                Globally Finalized
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleDomains.map(d => renderDomainStats(d, 1))}
          </div>
          
          {isDomainLead && (
            <div className="mt-8">
              <DataTable 
                columns={columns} 
                data={recruitments} 
                profile={profile} 
                overrideRound={1} 
                hideRoundControls={true} 
              />
            </div>
          )}
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!isRound1GloballyFinalized ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-border/50 rounded-lg bg-surface/30">
              <Lock className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">Round 1 is still in progress</h3>
              <p className="text-muted-foreground max-w-md">
                The Central Admin must globally finalize Round 1 before Round 2 statistics become available.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center bg-surface/30 p-4 rounded-lg border border-border/50">
                <div>
                  <h3 className="font-semibold text-foreground">Round 2 Progress</h3>
                  <p className="text-sm text-muted-foreground">Round 1 is finished. Following are the candidates domain wise.</p>
                </div>
                {isCentralAdmin && !isRound2GloballyFinalized && (
                  <Button 
                    onClick={() => handleGlobalFinalize(2)}
                    disabled={!allDomainsFinalizedR2 || isFinalizing}
                    className={allDomainsFinalizedR2 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-muted text-muted-foreground"}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Global Finalize Round 2
                  </Button>
                )}
                {isRound2GloballyFinalized && (
                  <div className="flex items-center gap-2 text-green-500 font-medium bg-green-500/10 px-4 py-2 rounded-md">
                    <CheckCircle2 className="w-5 h-5" />
                    Globally Finalized
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleDomains.map(d => renderDomainStats(d, 2))}
              </div>
              
              {isDomainLead && (
                <div className="mt-8">
                  <DataTable 
                    columns={columns} 
                    data={recruitments} 
                    profile={profile} 
                    overrideRound={2} 
                    hideRoundControls={true} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!isRound2GloballyFinalized ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-border/50 rounded-lg bg-surface/30">
              <Lock className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">Round 2 is still in progress</h3>
              <p className="text-muted-foreground max-w-md">
                The Central Admin must globally finalize Round 2 before the final shortlisted candidates are revealed.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-acm/20 rounded-lg bg-acm/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-acm/10 rounded-full blur-[80px] pointer-events-none" />
              <CheckCircle2 className="w-16 h-16 text-acm mb-6" />
              <h3 className="text-3xl font-bold text-foreground mb-2 font-display">Recruitment Concluded</h3>
              <p className="text-muted-foreground max-w-md text-lg">
                All rounds have been globally finalized. The final candidates are locked in.
              </p>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl text-left">
                {visibleDomains.map(domain => {
                  const applied = recruitments.filter(r => isApplicantInDomain(r, domain))
                  const shortlisted = applied.filter(r => {
                    const isP1 = isFirstPriority(r, domain)
                    return isP1 ? r.r2_status_1 === "Approved" : r.r2_status_2 === "Approved"
                  })
                  
                  return (
                    <div key={domain} className="bg-background/80 p-4 rounded-lg border border-border/50 backdrop-blur-sm">
                      <h4 className="font-medium text-sm text-muted-foreground">{domain}</h4>
                      <p className="text-2xl font-bold text-foreground mt-1">{shortlisted.length} <span className="text-sm font-normal text-muted-foreground">selected</span></p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Popup for Core Team / Central Admin to see domain candidates */}
      <Dialog open={!!selectedDomain} onOpenChange={(open) => !open && setSelectedDomain(null)}>
        <DialogContent 
          className="h-[90vh] flex flex-col bg-background border-border/50 p-6 sm:max-w-none"
          style={{ maxWidth: '70vw', width: '70vw' }}
        >
          <DialogHeader className="flex-none pb-2 border-b border-border/50">
            <DialogTitle className="text-3xl font-display font-bold">{selectedDomain} Candidates</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto mt-4 px-1 pb-4">
            <DataTable 
              columns={columns} 
              data={selectedDomainCandidates} 
              profile={{ ...profile, role: "core_team" }} // Pass as core team so they get read-only view
              overrideRound={activeTab === 1 ? 1 : 2}
              hideRoundControls={true}
              selectedDomain={selectedDomain}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
