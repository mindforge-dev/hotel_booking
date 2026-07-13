"use client"

import { useState } from "react"
import { DashboardNavbar } from "@/components/dashboard/navbar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="h-screen flex flex-col">
      <DashboardNavbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar wrapper — controls width, never leaves the document flow */}
        <div
          className={cn(
            "flex-shrink-0 border-r bg-background transition-all duration-300 ease-in-out overflow-hidden",
            sidebarOpen ? "w-72" : "w-0 border-r-0"
          )}
        >
          <div className="w-72">
            <Sidebar />
          </div>
        </div>

        {/* Main content — takes all remaining space */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
            <Toaster />
          </div>
        </main>
      </div>
    </div>
  )
}
