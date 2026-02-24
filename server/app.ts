import express from "express";

const app = express();

type Silo = "BF" | "BI";

type AppRow = {
  id: string;
  silo: Silo;
  applicant: string;
};

const tokenSiloMap: Record<string, Silo> = {
  MOCK_BF_TOKEN: "BF",
  MOCK_BI_TOKEN: "BI"
};

const applicationRows: AppRow[] = [
  { id: "app-bf-1", silo: "BF", applicant: "BF Alice" },
  { id: "app-bf-2", silo: "BF", applicant: "BF Bob" },
  { id: "app-bi-1", silo: "BI", applicant: "BI Carol" }
];

app.use((req, _res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
  const silo = token ? tokenSiloMap[token] : undefined;

  if (silo) {
    (req as express.Request & { user?: { id: string; silo: Silo } }).user = {
      id: `${silo}-test-user`,
      silo
    };
  }

  next();
});

app.get("/api/bi/revenue", (req, res) => {
  const user = (req as express.Request & { user?: { silo: Silo } }).user;

  if (user?.silo !== "BI") {
    return res.status(403).json({ error: "BI silo only" });
  }

  return res.json({ totalRevenue: 0, silo: "BI" });
});

app.get("/api/bf/dashboard", (req, res) => {
  const user = (req as express.Request & { user?: { silo: Silo } }).user;

  if (user?.silo !== "BF") {
    return res.status(403).json({ error: "BF silo only" });
  }

  return res.json({ dashboard: "ok", silo: "BF" });
});

app.get("/api/applications", (req, res) => {
  const silo = (req as express.Request & { user?: { silo: Silo } }).user?.silo;

  if (!silo) {
    return res.status(403).json({ error: "Missing silo context" });
  }

  return res.json(applicationRows.filter((row) => row.silo === silo));
});

export default app;
