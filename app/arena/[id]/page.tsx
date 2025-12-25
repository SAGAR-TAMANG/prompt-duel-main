import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArenaEditor } from "@/components/arena/arena-editor"

type Props = {
  params: Promise<{ id: string }>
}

export default async function DashboardArenaPage({ params }: Props) {
  // 1. Unwrap the params (Next.js 15 requirement)
  const { id } = await params

  const supabase = await createClient()

  // 2. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  // 3. Fetch Duel Data
  const { data: duel, error } = await supabase
    .from("duels")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !duel) {
    notFound()
  }

  // 4. Strict Ownership Check
  // Only the creator can see the "Dashboard" version
  if (duel.user_id !== user.id) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <h2 className="text-xl font-bold text-destructive">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to edit this duel.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl py-6">
      <ArenaEditor duel={duel} />
    </div>
  )
}