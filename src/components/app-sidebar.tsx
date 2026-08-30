"use client"

import { Users, FileText, Settings, LogOut } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"

const items = [
  { title: "Applicants", url: "/", icon: FileText },
  { title: "Team Directory", url: "/team", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border/50 bg-background">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center gap-3 px-6 py-6 mb-2 border-b border-border/50">
            <Image src="/images/acm-logo-circle.png" alt="ACM" width={32} height={32} />
            <span className="font-display font-bold text-lg tracking-tight text-foreground">ACM GRIET</span>
          </div>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-2 px-4">Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    render={<Link href={item.url} />} 
                    tooltip={item.title}
                    className="flex items-center gap-3 px-4 py-5 hover:bg-surface transition-colors mx-2"
                  >
                    <item.icon className="w-5 h-5 text-acm" />
                    <span className="font-medium text-foreground">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border/50">
         <form action="/auth/signout" method="post">
           <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 text-destructive hover:bg-destructive/10 transition-colors rounded-md">
             <LogOut className="w-5 h-5" />
             <span className="font-medium">Sign Out</span>
           </button>
         </form>
      </SidebarFooter>
    </Sidebar>
  )
}
