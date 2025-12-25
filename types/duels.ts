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

