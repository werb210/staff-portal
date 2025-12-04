import axios from 'axios';
import { useSiloStore, Silo } from '../state/siloStore';

const client = axios.create({
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const silo = useSiloStore.getState().currentSilo;

  const baseMap: Record<Silo, string | undefined> = {
    BF: import.meta.env.VITE_API_BF,
    BI: import.meta.env.VITE_API_BI,
    SLF: import.meta.env.VITE_API_SLF,
  };

  const base = silo ? baseMap[silo] : baseMap.BF;

  if (!base) throw new Error("Silo not set. Cannot call API.");

  return {
    ...config,
    baseURL: base,
  };
});

export function api() {
  return client;
}

const defaultApiClient = api();

export default defaultApiClient;
