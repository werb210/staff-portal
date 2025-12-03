// server/src/index.ts
import "dotenv/config";
import express from "express";
import routes from "./routes/index";

const app = express();

// Basic JSON body parsing
app.use(express.json());

// Mount all API routes under /api
app.use("/api", routes);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Staff Portal API listening on port ${PORT}`);
});

export default app;
