import express from "express";
import apiRoutes from "./routes/index.js";

const app = express();
app.use(express.json());
app.use("/api", apiRoutes);

const PORT = Number(process.env.PORT) || 5001;

app.listen(PORT, () => {
  console.log(`Staff Portal API running on port ${PORT}`);
});

export default app;
