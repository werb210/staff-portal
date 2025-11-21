import { useQuery } from "@tanstack/react-query";
import { HealthAPI } from "../../services";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => HealthAPI.ping().then(r => r.data),
    refetchInterval: 10000,
  });
}
