import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfilePage } from "@/components/profile/profile-page"
import type { Usuario } from "@/lib/types"

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!usuario) redirect("/auth/login")

  return (
    <main className="mx-auto min-h-svh w-full max-w-md bg-background pb-24">
      <ProfilePage usuario={usuario as Usuario} email={user.email ?? ""} />
    </main>
  )
}
