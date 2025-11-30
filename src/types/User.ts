export interface User {
  id: string;
  email: string;

  // Example: ["BF", "BI"]
  silos: string[];

  // Example: { BF: "ADMIN", BI: "MARKETING" }
  roles: Record<string, string>;
}
