import { DuelRow } from "@/components/data-table"
import { getDuels, DuelWithStats } from "@/lib/duels"
import { useQuery } from "@tanstack/react-query"

export default function useGetDuels() {
  return useQuery({
    queryKey: ["get-duels"],
    queryFn: getDuels,
    // The select option is perfect for transforming data 
    // BEFORE it reaches your component
    select: (data: DuelWithStats[]) => {
      return data.map((duel): DuelRow => {
        const votesA = duel.votes_a || 0
        const votesB = duel.votes_b || 0
        const total = votesA + votesB

        // inside select:
        let winner: string | null = null
        let percentage = 50
        let delta = 0

        if (total > 0) {
          const pctA = (votesA / total) * 100
          const pctB = (votesB / total) * 100
          
          // Use generic Math.round once to avoid "99% vs 0%" rounding gaps
          const roundA = Math.round(pctA)
          const roundB = Math.round(pctB)

          if (votesA > votesB) {
            winner = "A"
            percentage = roundA
            delta = roundA - roundB
          } else if (votesB > votesA) {
            winner = "B"
            percentage = roundB
            delta = roundB - roundA
          }
        }

        return {
          id: duel.id,
          name: duel.name,
          status: duel.status ? duel.status.charAt(0).toUpperCase() + duel.status.slice(1) : "Draft",
          total_votes: total,
          win_rate: {
            winner,
            percentage,
            delta,
          },
          models: `${duel.contender_a_name || 'A'} vs ${duel.contender_b_name || 'B'}`,
          created_at: duel.created_at,
          public_link: typeof window !== 'undefined' 
            ? `${window.location.origin}/arena/${duel.id}` 
            : `/arena/${duel.id}`,
        }
      })
    },
  })
}