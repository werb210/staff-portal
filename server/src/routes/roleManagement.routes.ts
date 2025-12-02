import { Router } from "express";
import { roleManagementController } from "../controllers/roleManagementController.js";
import requireAuth from "../middleware/requireAuth.js";

const r = Router();

r.use(requireAuth);

r.get("/", roleManagementController.list);
r.post("/create", roleManagementController.createUser);
r.post("/:id/role", roleManagementController.updateRole);
r.post("/:id/active", roleManagementController.toggleActive);
r.post("/:id/reset-password", roleManagementController.resetPassword);

export default r;
