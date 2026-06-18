import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("onboarding_completo, nombre")
    .eq("id", user.id)
    .maybeSingle()

  if (usuario?.onboarding_completo) {
    redirect("/dashboard")
  }

  return <OnboardingWizard nombre={usuario?.nombre ?? null} />
}
