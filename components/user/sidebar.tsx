"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaCalendarCheck } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { IoNotificationsOutline } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaLifeRing } from "react-icons/fa";

export const routes = [
  {
    label: "Dashboard",
    icon: LuLayoutDashboard,
    href: "/user/dashboard",
  },
  {
    label: "My Bookings",
    icon: FaCalendarCheck,
    href: "/user/bookings",
  },
  {
    label: "Favorites",
    icon: FaHeart,
    href: "/user/favorites",
  },
  {
    label: "Notifications",
    icon: IoNotificationsOutline,
    href: "/user/notifications",
  },
  {
    label: "Profile & Settings",
    icon: FaUserCircle,
    href: "/user/profile",
  },
  {
    label: "Loyalty & Rewards",
    icon: FaStar,
    href: "/user/loyalty",
  },
  {
    label: "Help & Support",
    icon: FaLifeRing,
    href: "/user/support",
  },
];

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full w-64 flex flex-col bg-background p-4 overflow-x-hidden border-r border-border">
      <div className="flex flex-col flex-1 gap-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href || (route.href !== "/user/dashboard" && pathname.startsWith(route.href));
          const Icon = route.icon as React.ComponentType<any>;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`
                flex items-center gap-x-3 text-sm font-medium px-3 py-2.5 rounded-lg
                transition-colors
                ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }
              `}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {route.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
