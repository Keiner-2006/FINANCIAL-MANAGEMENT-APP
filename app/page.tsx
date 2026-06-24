import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("onboarding_completo")
    .eq("id", user.id)
    .maybeSingle()

  if (!usuario?.onboarding_completo) {
    redirect("/onboarding")
  }

  redirect("/dashboard")
}
