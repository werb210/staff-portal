import { Router } from "express";

const router = Router();

// feature modules will be mounted here later:
// router.use("/auth", authRoutes);
// router.use("/contacts", contactsRoutes);
// router.use("/companies", companiesRoutes);
// router.use("/products", productsRoutes);
// router.use("/lenders", lendersRoutes);
// router.use("/pipeline", pipelineRoutes);
// router.use("/documents", documentsRoutes);
// router.use("/ocr", ocrRoutes);
// router.use("/messages", messageRoutes);

router.get("/_int/health", (req, res) =>
  res.json({ success: true, message: "OK" })
);

export default router;
