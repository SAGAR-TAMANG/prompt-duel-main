import { createClient } from "@/lib/supabase/client"
import { CreateTurnInput, DuelTurn } from "@/types/duels"

export async function getDuelTurns(duelId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("duel_turns")
    .select("*")
    .eq("duel_id", duelId)
    .order("turn_order", { ascending: true })

  if (error) {
    console.error("Error fetching turns:", error)
    throw error
  }

  return data as DuelTurn[]
}

export async function createDuelTurn(input: CreateTurnInput) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("duel_turns")
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as DuelTurn
}

export async function deleteDuelTurn(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from("duel_turns").delete().eq("id", id)
  if (error) throw error
  return true
}