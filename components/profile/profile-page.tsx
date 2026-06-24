"use client"

import type { Usuario } from "@/lib/types"
import { cerrarSesion } from "@/app/dashboard/actions"
import { formatCOP } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  User,
  Wallet,
  Calendar,
  LogOut,
  Car,
  Receipt,
  PiggyBank,
  Smartphone,
} from "lucide-react"

interface Props {
  usuario: Usuario
  email: string
}

export function ProfilePage({ usuario, email }: Props) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Perfil</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Información personal</h2>
        <div className="flex flex-col gap-3">
          <InfoRow icon={<User className="h-4 w-4" />} label="Nombre" value={usuario.nombre ?? "Sin nombre"} />
          <InfoRow icon={<Wallet className="h-4 w-4" />} label="Ingreso" value={`${formatCOP(Number(usuario.monto_ingreso))} / ${usuario.tipo_ingreso}`} />
          <InfoRow icon={<Calendar className="h-4 w-4" />} label="Día de pago" value={`Día ${usuario.dia_pago}`} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Configuración</h2>
        <div className="flex flex-col gap-3">
          <InfoRow
            icon={<Car className="h-4 w-4" />}
            label="Vehículos"
            value={usuario.tiene_vehiculo ? `${usuario.tipo_vehiculo === "moto" ? "Moto" : "Carro"} registrado` : "Sin vehículo"}
          />
          <InfoRow
            icon={<Receipt className="h-4 w-4" />}
            label="Brilla/Gas"
            value={usuario.tiene_brilla ? `${formatCOP(Number(usuario.cuota_brilla))}/mes` : "No aplica"}
          />
          <InfoRow
            icon={<PiggyBank className="h-4 w-4" />}
            label="Ahorros"
            value={formatCOP(Number(usuario.saldo_ahorros))}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Acerca de</h2>
        <div className="flex flex-col gap-3">
          <InfoRow icon={<Smartphone className="h-4 w-4" />} label="App" value="SmartPocket v1.0" />
        </div>
      </section>

      <form action={cerrarSesion}>
        <Button variant="destructive" className="w-full" type="submit">
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </form>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  )
}
