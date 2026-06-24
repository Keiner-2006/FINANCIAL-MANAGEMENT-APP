"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { CurrencyInput } from "@/components/ui/currency-input"
import { guardarOnboarding, type OnboardingPayload } from "@/app/onboarding/actions"
import { formatCOP } from "@/lib/format"
import { toast } from "sonner"
import {
  Wallet,
  CreditCard,
  Car,
  Flame,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Check,
  Banknote,
  Bike,
} from "lucide-react"
import { cn } from "@/lib/utils"

const METODOS_PAGO = [
  { tipo: "efectivo", label: "Efectivo", tieneBolsillo: false },
  { tipo: "nequi", label: "Nequi", tieneBolsillo: true },
  { tipo: "daviplata", label: "Daviplata", tieneBolsillo: true },
  { tipo: "bancolombia", label: "Bancolombia", tieneBolsillo: true },
  { tipo: "tarjeta_credito", label: "Tarjeta de Crédito", tieneBolsillo: false },
  { tipo: "tarjeta_debito", label: "Tarjeta de Débito", tieneBolsillo: false },
]

const TOTAL_PASOS = 5

export function OnboardingWizard({ nombre }: { nombre: string | null }) {
  const router = useRouter()
  const [paso, setPaso] = useState(1)
  const [guardando, setGuardando] = useState(false)

  // Paso 1
  const [tipoIngreso, setTipoIngreso] = useState<"quincenal" | "mensual">("mensual")
  const [montoIngreso, setMontoIngreso] = useState(0)
  const [diaPago, setDiaPago] = useState(30)

  // Paso 2
  const [metodosSel, setMetodosSel] = useState<Record<string, boolean>>({ efectivo: true })
  const [metodosNombre, setMetodosNombre] = useState<Record<string, string>>({})
  const [bolsilloActivo, setBolsilloActivo] = useState<Record<string, boolean>>({})
  const [saldoBolsillo, setSaldoBolsillo] = useState<Record<string, number>>({})

  // Paso 3
  const [tieneVehiculo, setTieneVehiculo] = useState(false)
  const [tipoVehiculo, setTipoVehiculo] = useState<"moto" | "carro" | "ninguno">("ninguno")
  const [placaVehiculo, setPlacaVehiculo] = useState("")
  const [soat, setSoat] = useState("")
  const [tecno, setTecno] = useState("")

  // Paso 4
  const [tieneBrilla, setTieneBrilla] = useState(false)
  const [cuotaBrilla, setCuotaBrilla] = useState(0)

  // Paso 5
  const [almuerzosActivos, setAlmuerzosActivos] = useState(false)
  const [valorAlmuerzo, setValorAlmuerzo] = useState(0)

  const puedeAvanzar = () => {
    if (paso === 1) return montoIngreso > 0 && diaPago >= 1 && diaPago <= 31
    if (paso === 3 && tieneVehiculo) return tipoVehiculo !== "ninguno"
    if (paso === 4 && tieneBrilla) return cuotaBrilla > 0
    if (paso === 5 && almuerzosActivos) return valorAlmuerzo > 0
    return true
  }

  const handleFinalizar = async () => {
    setGuardando(true)
    const metodos = METODOS_PAGO.filter((m) => metodosSel[m.tipo]).map((m) => ({
      tipo: m.tipo,
      nombre: metodosNombre[m.tipo]?.trim() || m.label,
      bolsillo: m.tieneBolsillo ? (bolsilloActivo[m.tipo] ?? false) : false,
      saldo_bolsillo: m.tieneBolsillo ? (saldoBolsillo[m.tipo] ?? 0) : 0,
    }))

    const documentos: OnboardingPayload["documentos"] = []
    if (tieneVehiculo) {
      if (soat) documentos.push({ tipo: "soat", fecha_vencimiento: soat })
      if (tecno) documentos.push({ tipo: "tecnomecanica", fecha_vencimiento: tecno })
    }

    const payload: OnboardingPayload = {
      tipo_ingreso: tipoIngreso,
      monto_ingreso: montoIngreso,
      dia_pago: diaPago,
      metodos,
      tiene_vehiculo: tieneVehiculo,
      tipo_vehiculo: tieneVehiculo ? tipoVehiculo : "ninguno",
      placa_vehiculo: tieneVehiculo ? placaVehiculo : undefined,
      documentos,
      tiene_brilla: tieneBrilla,
      cuota_brilla: cuotaBrilla,
      almuerzos_activos: almuerzosActivos,
      valor_almuerzo_diario: valorAlmuerzo,
      saldo_ahorros_inicial: metodos
        .filter((m) => m.bolsillo && m.saldo_bolsillo > 0)
        .reduce((acc, m) => acc + m.saldo_bolsillo, 0),
    }

    const res = await guardarOnboarding(payload)
    if (res?.error) {
      toast.error(res.error)
      setGuardando(false)
      return
    }
    toast.success("¡Configuración completada!")
    router.push("/dashboard")
  }

  return (
    <main className="flex min-h-svh w-full justify-center bg-background p-4 sm:p-6">
      <div className="flex w-full max-w-md flex-col">
        {/* Header */}
        <div className="mb-6 mt-2 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {nombre ? `Hola, ${nombre}` : "Bienvenido"}
              </p>
              <p className="text-xs text-muted-foreground">Configuremos tu economía familiar</p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Progress value={(paso / TOTAL_PASOS) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Paso {paso} de {TOTAL_PASOS}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 rounded-2xl border border-border bg-card p-5 shadow-sm">
          {paso === 1 && (
            <StepShell
              icon={<Banknote className="h-5 w-5" />}
              titulo="Tus ingresos"
              descripcion="¿Cada cuánto recibes dinero y cuánto neto?"
            >
              <div className="grid grid-cols-2 gap-3">
                <OptionCard
                  active={tipoIngreso === "quincenal"}
                  onClick={() => setTipoIngreso("quincenal")}
                  label="Quincenal"
                />
                <OptionCard
                  active={tipoIngreso === "mensual"}
                  onClick={() => setTipoIngreso("mensual")}
                  label="Mensual"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monto">Monto neto del ingreso</Label>
                <CurrencyInput id="monto" value={montoIngreso} onChange={setMontoIngreso} placeholder="2.500.000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dia">Día de pago (cierre de ciclo)</Label>
                <Input
                  id="dia"
                  type="number"
                  min={1}
                  max={31}
                  value={diaPago}
                  onChange={(e) => setDiaPago(Number(e.target.value))}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">Día del mes en que se cierra tu presupuesto.</p>
              </div>
            </StepShell>
          )}

          {paso === 2 && (
            <StepShell
              icon={<CreditCard className="h-5 w-5" />}
              titulo="Métodos de pago"
              descripcion="¿Qué métodos de pago usas?"
            >
              <div className="flex flex-col gap-3">
                {METODOS_PAGO.map((m) => (
                  <div key={m.tipo} className="rounded-xl border border-border p-3">
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={!!metodosSel[m.tipo]}
                        onCheckedChange={(c) =>
                          setMetodosSel((prev) => ({ ...prev, [m.tipo]: c === true }))
                        }
                      />
                      <span className="text-sm font-medium text-foreground">{m.label}</span>
                    </label>
                    {metodosSel[m.tipo] && m.tieneBolsillo && (
                      <div className="mt-3 flex flex-col gap-2">
                        <label className="flex items-center gap-2">
                          <Checkbox
                            checked={!!bolsilloActivo[m.tipo]}
                            onCheckedChange={(c) =>
                              setBolsilloActivo((prev) => ({ ...prev, [m.tipo]: c === true }))
                            }
                          />
                          <span className="text-xs text-muted-foreground">¿Tienes ahorro/bolsillo?</span>
                        </label>
                        {bolsilloActivo[m.tipo] && (
                          <CurrencyInput
                            value={saldoBolsillo[m.tipo] ?? 0}
                            onChange={(v) => setSaldoBolsillo((prev) => ({ ...prev, [m.tipo]: v }))}
                            placeholder="Saldo actual en el bolsillo"
                          />
                        )}
                      </div>
                    )}
                    {metodosSel[m.tipo] && !m.tieneBolsillo && m.tipo !== "efectivo" && (
                      <Input
                        placeholder={`Ej: ${m.label} Bancolombia`}
                        value={metodosNombre[m.tipo] ?? ""}
                        onChange={(e) => setMetodosNombre((prev) => ({ ...prev, [m.tipo]: e.target.value }))}
                        className="mt-3 h-10"
                      />
                    )}
                  </div>
                ))}
              </div>
            </StepShell>
          )}

          {paso === 3 && (
            <StepShell
              icon={<Car className="h-5 w-5" />}
              titulo="Vehículos"
              descripcion="¿La familia tiene algún vehículo?"
            >
              <div className="grid grid-cols-3 gap-3">
                <OptionCard
                  active={tieneVehiculo && tipoVehiculo === "moto"}
                  onClick={() => {
                    setTieneVehiculo(true)
                    setTipoVehiculo("moto")
                  }}
                  label="Moto"
                  icon={<Bike className="h-5 w-5" />}
                />
                <OptionCard
                  active={tieneVehiculo && tipoVehiculo === "carro"}
                  onClick={() => {
                    setTieneVehiculo(true)
                    setTipoVehiculo("carro")
                  }}
                  label="Carro"
                  icon={<Car className="h-5 w-5" />}
                />
                <OptionCard
                  active={!tieneVehiculo}
                  onClick={() => {
                    setTieneVehiculo(false)
                    setTipoVehiculo("ninguno")
                  }}
                  label="Ninguno"
                />
              </div>
              {tieneVehiculo && (
                <div className="flex flex-col gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="placa-vehiculo">Placa (opcional)</Label>
                    <Input
                      id="placa-vehiculo"
                      placeholder="ABC 123"
                      value={placaVehiculo}
                      onChange={(e) => setPlacaVehiculo(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="soat">Vencimiento del SOAT</Label>
                    <Input id="soat" type="date" min={new Date().toISOString().split("T")[0]} value={soat} onChange={(e) => setSoat(e.target.value)} className="h-11" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tecno">Vencimiento de Tecnomecánica</Label>
                    <Input
                      id="tecno"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={tecno}
                      onChange={(e) => setTecno(e.target.value)}
                      className="h-11"
                    />
                  </div>
                </div>
              )}
            </StepShell>
          )}

          {paso === 4 && (
            <StepShell
              icon={<Flame className="h-5 w-5" />}
              titulo="Recibo de Brilla / Gas"
              descripcion="¿Tienes una deuda financiada a través del recibo de Brilla?"
            >
              <div className="grid grid-cols-2 gap-3">
                <OptionCard active={tieneBrilla} onClick={() => setTieneBrilla(true)} label="Sí, tengo deuda" />
                <OptionCard active={!tieneBrilla} onClick={() => setTieneBrilla(false)} label="No, solo gas" />
              </div>
              {tieneBrilla ? (
                <div className="grid gap-2">
                  <Label htmlFor="cuota">Cuota fija mensual de la deuda</Label>
                  <CurrencyInput id="cuota" value={cuotaBrilla} onChange={setCuotaBrilla} placeholder="230.000" />
                  <p className="text-xs text-muted-foreground">
                    Ej: cuota de la moto o electrodoméstico que pagas dentro del recibo.
                  </p>
                </div>
              ) : (
                <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                  El recibo se registrará como gasto variable de Servicio Público de Gas.
                </p>
              )}
            </StepShell>
          )}

          {paso === 5 && (
            <StepShell
              icon={<Utensils className="h-5 w-5" />}
              titulo="Almuerzos laborales"
              descripcion="¿Gastas a diario en almuerzos de lunes a viernes?"
            >
              <div className="grid grid-cols-2 gap-3">
                <OptionCard active={almuerzosActivos} onClick={() => setAlmuerzosActivos(true)} label="Sí" />
                <OptionCard active={!almuerzosActivos} onClick={() => setAlmuerzosActivos(false)} label="No" />
              </div>
              {almuerzosActivos && (
                <div className="grid gap-2">
                  <Label htmlFor="valor-almuerzo">Valor del almuerzo diario</Label>
                  <CurrencyInput
                    id="valor-almuerzo"
                    value={valorAlmuerzo}
                    onChange={setValorAlmuerzo}
                    placeholder="15.000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Calcularemos automáticamente los días hábiles. Podrás desmarcar días en el panel.
                  </p>
                </div>
              )}
            </StepShell>
          )}
        </div>

        {/* Footer nav */}
        <div className="mt-4 flex items-center gap-3">
          {paso > 1 && (
            <Button variant="outline" className="h-11 flex-1 bg-transparent" onClick={() => setPaso((p) => p - 1)}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Atrás
            </Button>
          )}
          {paso < TOTAL_PASOS ? (
            <Button className="h-11 flex-1" disabled={!puedeAvanzar()} onClick={() => setPaso((p) => p + 1)}>
              Siguiente <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button className="h-11 flex-1" disabled={!puedeAvanzar() || guardando} onClick={handleFinalizar}>
              {guardando ? "Guardando..." : "Finalizar"}
              {!guardando && <Check className="ml-1 h-4 w-4" />}
            </Button>
          )}
        </div>
        {paso === 1 && montoIngreso > 0 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Ingreso configurado: <span className="font-medium text-foreground">{formatCOP(montoIngreso)}</span>
          </p>
        )}
      </div>
    </main>
  )
}

function StepShell({
  icon,
  titulo,
  descripcion,
  children,
}: {
  icon: React.ReactNode
  titulo: string
  descripcion: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground text-balance">{titulo}</h2>
          <p className="text-sm text-muted-foreground text-pretty">{descripcion}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function OptionCard({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon?: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/5 text-primary"
          : "border-border bg-background text-muted-foreground hover:border-primary/40",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
