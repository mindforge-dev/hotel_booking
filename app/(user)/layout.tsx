"use client"

import { useState } from "react"
import { UserNavbar } from "@/components/user/UserNavbar"
import { UserSidebar } from "@/components/user/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="h-screen flex flex-col">
      <UserNavbar
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Below navbar: flex row — sidebar + main content side by side */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar wrapper — controls width, never leaves the document flow */}
        <div
          className={cn(
            "flex-shrink-0 border-r bg-background transition-all duration-300 ease-in-out overflow-hidden",
            sidebarOpen ? "w-72" : "w-0 border-r-0"
          )}
        >
          <div className="w-72">
            <UserSidebar />
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
