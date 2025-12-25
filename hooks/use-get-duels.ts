import { getDuels } from "@/lib/duels"
import { useQuery } from "@tanstack/react-query"

const useGetDuels = () => {
  return useQuery({
    queryKey: ["get-duels"],
    queryFn: getDuels
  })
}

export default useGetDuels
