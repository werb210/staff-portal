// server/src/index.ts
// Entry point for staff-portal backend
// Runs Express and loads the unified router.

import express from "express";
import routes from "./routes/index";

const app = express();
app.use(express.json());

// Mount API routes
app.use("/api", routes);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Staff Portal API running on port ${PORT}`);
});

export default app;
