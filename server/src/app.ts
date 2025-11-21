import express from "express";
import cors from "cors";
import applicationsPagedRoutes from "./routes/applications.paged.routes.js";
import applicationsFullRoutes from "./routes/applications.full.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/applications", applicationsFullRoutes);
app.use("/api/applications/paged", applicationsPagedRoutes);
app.use("/api/dashboard", dashboardRoutes);

export default app;
