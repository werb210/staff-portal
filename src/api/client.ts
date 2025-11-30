import axios from 'axios';
import { useSiloStore } from '../state/siloStore';

export function api() {
  const silo = useSiloStore.getState().currentSilo;

  if (!silo) throw new Error("Silo not set. Cannot call API.");

  const base = {
    BF: import.meta.env.VITE_API_BF,
    BI: import.meta.env.VITE_API_BI,
    SLF: import.meta.env.VITE_API_SLF,
  }[silo];

  return axios.create({
    baseURL: base,
    withCredentials: true,
  });
}
