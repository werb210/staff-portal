import express from "express";
import cors from "cors";
import applicationsPagedRoutes from "./routes/applications.paged.routes.js";
import applicationsFullRoutes from "./routes/applications.full.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/applications", applicationsFullRoutes);
app.use("/api/applications/paged", applicationsPagedRoutes);

export default app;
