import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QueryProvider } from "@/components/query-providers"
import { ArenaVoter } from "@/components/arena-voter"

type Props = {
  params: Promise<{ id: string }>
}

export default async function PublicArenaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch Duel (Public - No Auth Check needed for *viewing*)
  const { data: duel, error } = await supabase
    .from("duels")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !duel) {
    notFound()
  }

  // 2. Wrap in Providers because we use useQuery in the child
  return (
    <QueryProvider>
      <ArenaVoter duel={duel} />
    </QueryProvider>
  )
}