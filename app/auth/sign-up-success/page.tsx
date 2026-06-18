import { MailCheck } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <main className="flex min-h-svh w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-semibold text-card-foreground">Revisa tu correo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Te enviamos un enlace de confirmación. Ábrelo para activar tu cuenta y luego inicia sesión.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </main>
  )
}
