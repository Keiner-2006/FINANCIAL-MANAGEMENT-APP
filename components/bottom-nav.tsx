"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Car, BarChart3, User } from "lucide-react"

const tabs = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/vehiculos", label: "Vehículos", icon: Car },
  { href: "/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/perfil", label: "Perfil", icon: User },
]

const authPaths = ["/dashboard", "/vehiculos", "/reportes", "/perfil"]

export function BottomNav() {
  const pathname = usePathname()

  if (!authPaths.some((p) => pathname.startsWith(p))) {
    return null
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-border safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                active
                  ? "text-[oklch(0.379_0.138_265.52)]"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
              {active && (
                <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-[oklch(0.379_0.138_265.52)]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
