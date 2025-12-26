import { CreateDuelInput, Duel, UpdateDuelInput } from "@/types/duels"
import { createClient } from "./supabase/client"

export interface DuelWithStats extends Duel {
  votes_a: number
  votes_b: number
  total_votes: number
}

export async function getDuels() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from("duels")
    .select(`
      *,
      duel_turns (
        likes_a,
        likes_b
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching duels:", error)
    throw error
  }

  // Calculate A vs B specific stats
  const duelsWithStats = data.map((duel) => {
    const turns = duel.duel_turns as any[] || []

    const stats = turns.reduce(
      (acc, turn) => ({
        a: acc.a + (turn.likes_a || 0),
        b: acc.b + (turn.likes_b || 0),
      }),
      { a: 0, b: 0 }
    )

    return {
      ...duel,
      votes_a: stats.a,
      votes_b: stats.b,
      total_votes: stats.a + stats.b,
      // Clean up the response object
      duel_turns: undefined 
    }
  })

  return duelsWithStats as DuelWithStats[]
}

/**
 * Fetches a single duel by ID.
 */
export async function getDuelById(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching duel ${id}:`, error)
    throw error
  }

  return data as Duel
}

/**
 * Creates a new duel. 
 * Automatically assigns the current logged-in user as the owner.
 */
export async function createDuel(input: CreateDuelInput) {
  const supabase = createClient()

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User must be logged in to create a duel")

  // 2. Insert the row
  const { data, error } = await supabase
    .from("duels")
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description || null,
      contender_a_name: input.contender_a_name || "Prompt A",
      contender_b_name: input.contender_b_name || "Prompt B",
      status: input.status || "active",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating duel:", error)
    throw error
  }

  return data as Duel
}

/**
 * Updates an existing duel.
 */
export async function updateDuel(id: string, updates: UpdateDuelInput) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("duels")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error(`Error updating duel ${id}:`, error)
    throw error
  }

  return data as Duel
}

/**
 * Deletes a duel permanently.
 */
export async function deleteDuel(id: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("duels")
    .delete()
    .eq("id", id)

  if (error) {
    console.error(`Error deleting duel ${id}:`, error)
    throw error
  }

  return true
}