import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";
import { roleManagementRepo } from "../db/repositories/roleManagement.repo.js";

export const roleManagementController = {
  list: asyncHandler(async (req: any, res) => {
    if (req.user?.role !== "admin")
      return res.status(403).json({ error: "Not authorized" });

    const rows = await roleManagementRepo.list();
    res.json({ success: true, data: rows });
  }),

  updateRole: asyncHandler(async (req: any, res) => {
    if (req.user?.role !== "admin")
      return res.status(403).json({ error: "Not authorized" });

    const { id } = req.params;
    const { role } = req.body;

    const updated = await roleManagementRepo.updateRole(id, role);
    res.json({ success: true, data: updated });
  }),

  toggleActive: asyncHandler(async (req: any, res) => {
    if (req.user?.role !== "admin")
      return res.status(403).json({ error: "Not authorized" });

    const { id } = req.params;
    const { active } = req.body;

    const updated = await roleManagementRepo.toggleActive(id, active);
    res.json({ success: true, data: updated });
  }),

  createUser: asyncHandler(async (req: any, res) => {
    if (req.user?.role !== "admin")
      return res.status(403).json({ error: "Not authorized" });

    const { email, password, role } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const created = await roleManagementRepo.createUser({
      email,
      passwordHash,
      role,
      active: true,
    });

    res.json({ success: true, data: created });
  }),

  resetPassword: asyncHandler(async (req: any, res) => {
    if (req.user?.role !== "admin")
      return res.status(403).json({ error: "Not authorized" });

    const { id } = req.params;
    const { password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const updated = await roleManagementRepo.resetPassword(id, passwordHash);

    res.json({ success: true, data: updated });
  }),
};
