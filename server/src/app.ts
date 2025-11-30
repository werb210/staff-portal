import express from "express";
import cors from "cors";
import applicationsPagedRoutes from "./routes/applications.paged.routes.js";
import applicationsFullRoutes from "./routes/applications.full.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import authRoutes from "./routes/auth.routes.js";
import pipelineRoutes from "./routes/pipeline.routes.js";
import documentsRoutes from "./routes/documents.js";
import lendersRoutes from "./routes/lenders.js";
import internalTransmissionRoutes from "./routes/_int/transmission.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes); // deprecated - not used
app.use("/api/users", authRoutes);
app.use("/api/applications", applicationsFullRoutes);
app.use("/api/applications/paged", applicationsPagedRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/pipeline", pipelineRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/lenders", lendersRoutes);
app.use("/api/_internal", internalTransmissionRoutes);

export default app;
