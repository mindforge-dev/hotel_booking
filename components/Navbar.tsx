'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Menu, X, UserCircle2, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/hooks/dashboard/useNotifications'

const navLinks = [
  { name: 'Hotels', href: '/hotels' },
  { name: 'Search Hotels', href: '/search' },
  { name: 'Contact', href: '/contact' },
  { name: 'Bookings', href: '/bookings' }
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const { data: session } = useSession()
  const { data: notifications = [], isLoading } = useNotifications(session?.user?.id);


  return (
    <nav className="fixed w-full top-0 z-50 bg-background text-foreground shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          IDKHOTEL
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-foreground/70 hover:text-foreground transition-colors">
              {link.name}
            </Link>
          ))}

          {/* Notification button */}
          {session && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="relative"
              >
                <Bell className="w-6 h-6" />
                {(() => {
                  const unreadCount = notifications.filter(notification => !notification.isRead).length;
                  return unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  );
                })()}
              </Button>

              <AnimatePresence>
                {notificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-popover text-popover-foreground border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto"
                  >
                    <div className="p-4 border-b border-border">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="p-2">
                      {isLoading ? (
                        <p className="text-center py-4 text-muted-foreground">Loading notifications...</p>
                      ) : notifications.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">No notifications</p>
                      ) : (
                        notifications.slice(0, 5).map(notification => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-md mb-2 ${!notification.isRead
                              ? 'bg-blue-500/10 border-l-4 border-blue-500'
                              : 'bg-muted/50'
                              }`}
                          >
                            <p className="text-sm">{notification.message}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                      {notifications.length > 5 && (
                        <Link
                          href="/notifications"
                          className="block text-center py-2 text-primary hover:text-primary/80 text-sm font-medium"
                          onClick={() => setNotificationOpen(false)}
                        >
                          View all notifications
                        </Link>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Profile button */}
          {session ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProfileOpen((prev) => !prev)}
              >
                <UserCircle2 className="w-6 h-6" />
              </Button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-popover text-popover-foreground border rounded-md shadow-md z-50"
                  >
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setProfileOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Button onClick={() => signIn()}>Sign In</Button>
          )}
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="fixed top-0 left-0 w-64 h-full bg-background z-50 shadow-md px-6 py-4 border-r"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold">Menu</span>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-foreground/70 hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}

                {session ? (
                  <>
                    <Link
                      key="dashboard-link"
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="text-foreground/70 hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Button
                      key="sign-out-button"
                      variant="ghost"
                      className="text-left px-0 text-destructive"
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <Button key="sign-in-button" onClick={() => signIn()}>Sign In</Button>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
