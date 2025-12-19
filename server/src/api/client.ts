import axios from 'axios';
import { useSiloStore, Silo } from '../state/siloStore';
import { getSiloApiBase } from '../utils/env';

const client = axios.create({
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const silo = useSiloStore.getState().currentSilo;

  const base = getSiloApiBase(silo);

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
