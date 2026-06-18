import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-semibold text-card-foreground">Algo salió mal</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {params?.error ? params.error : "Ocurrió un error durante la autenticación."}
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Volver a intentar
        </Link>
      </div>
    </main>
  )
}
