// server/src/routes/index.ts
import { Router } from "express";

// you may add more later — this ensures the router resolves correctly
import contactsRoutes from "./contacts.routes.js";

const router = Router();

router.use("/contacts", contactsRoutes);

export default router;
