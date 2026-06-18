"use client"

import type { DocumentoActivo } from "@/lib/types"
import { diasHastaVencimiento } from "@/lib/finance"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

const TIPO_LABEL: Record<string, string> = {
  soat: "SOAT",
  tecnomecanica: "Tecnomecánica",
}

export function AlertBanner({ documentos }: { documentos: DocumentoActivo[] }) {
  const alertas = documentos
    .map((d) => ({ doc: d, dias: diasHastaVencimiento(d.fecha_vencimiento) }))
    .filter((a) => a.dias <= 15)
    .sort((a, b) => a.dias - b.dias)

  if (alertas.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {alertas.map(({ doc, dias }) => {
        const vencido = dias < 0
        return (
          <div
            key={doc.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-3 text-sm",
              vencido
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700",
            )}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="font-medium text-pretty">
              {vencido
                ? `Tu ${TIPO_LABEL[doc.tipo]} venció hace ${Math.abs(dias)} día(s). Renuévalo para evitar multas.`
                : `Tu ${TIPO_LABEL[doc.tipo]} vence en ${dias} día(s). Renuévalo pronto para evitar multas de tránsito.`}
            </p>
          </div>
        )
      })}
    </div>
  )
}
