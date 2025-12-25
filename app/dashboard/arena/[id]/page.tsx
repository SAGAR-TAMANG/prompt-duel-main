import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ArenaEditor } from "@/components/arena/arena-editor"

// Update type to Promise
type Props = {
  params: Promise<{ id: string }>
}

export default async function ArenaPage({ params }: Props) {
  // 1. Await the params object first
  const { id } = await params

  const supabase = await createClient()

  // 2. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  // 3. Fetch Duel Data using the awaited 'id'
  const { data: duel, error } = await supabase
    .from("duels")
    .select("*")
    .eq("id", id) 
    .single()

  if (error || !duel) {
    notFound()
  }

  // 4. Verify Ownership
  if (duel.user_id !== user.id) {
    return <div className="p-10 text-center">You do not have permission to edit this duel.</div>
  }

  return (
    <div className="container py-6">
      <ArenaEditor duel={duel} />
    </div>
  )
}