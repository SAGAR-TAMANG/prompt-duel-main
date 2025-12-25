// Matches the 'duels' table in Supabase
export interface Duel {
  id: string
  user_id: string
  name: string
  description: string | null
  contender_a_name: string
  contender_b_name: string
  status: "active" | "draft" | "concluded"
  created_at: string
}

// Input type for creating a duel (ID and dates are handled by DB)
export interface CreateDuelInput {
  name: string
  description?: string
  contender_a_name?: string
  contender_b_name?: string
  status?: "active" | "draft" | "concluded"
}

// Input type for updating (everything is optional)
export interface UpdateDuelInput {
  name?: string
  description?: string
  contender_a_name?: string
  contender_b_name?: string
  status?: "active" | "draft" | "concluded"
}

// Types of turn-based edits
export interface DuelTurn {
  id: string
  duel_id: string
  turn_order: number
  user_input: string
  response_a: string
  response_b: string
  likes_a?: number // Optional for the editor view
  dislikes_a?: number
  likes_b?: number
  dislikes_b?: number
  created_at: string
}

export interface CreateTurnInput {
  duel_id: string
  turn_order: number
  user_input: string
  response_a: string
  response_b: string
}