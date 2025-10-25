"use client"

import { useState } from "react"
import { DashboardNavbar } from "@/components/dashboard/navbar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Toaster } from "@/components/ui/toaster"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div>

      <DashboardNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="pt-16 h-screen relative overflow-hidden md:flex">

        {/* Sidebar for desktop (always visible) */}
        <div className="hidden md:block w-72 fixed inset-y-0  border-r pt-16 z-40">
          <Sidebar />
        </div>

        {/* Sidebar drawer for mobile */}
        <div
          className={`
            fixed z-50 inset-y-0 left-0 w-72  border-r pt-16
            transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            transition-transform duration-300 ease-in-out
            md:hidden
          `}
        >
          <Sidebar />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 relative z-10 h-full overflow-y-auto md:ml-72">
          <div className="p-6">
            {children}
            <Toaster />
          </div>
        </main>
      </div>
    </div>
  )
}
