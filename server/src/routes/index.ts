import { Router } from "express";
import contactsRoutes from "./contacts.routes.js";

const router = Router();

// Core contacts API
router.use("/contacts", contactsRoutes);

// Export for server/src/index.ts
export default router;
