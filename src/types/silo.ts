export const SILOS = ["bf", "bi", "slf", "admin"] as const;

export type Silo = typeof SILOS[number];
