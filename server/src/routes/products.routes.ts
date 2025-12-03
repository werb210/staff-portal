import { Router } from "express";
import { productsRepo } from "../db/repositories/products.repo.js";

const router = Router();

// GET /products
router.get("/", async (_req, res) => {
  try {
    const rows = await productsRepo.getAll();
    res.json(rows);
  } catch (err) {
    console.error("GET /products failed:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /products/:id
router.get("/:id", async (req, res) => {
  try {
    const row = await productsRepo.getById(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    console.error("GET /products/:id failed:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST /products
router.post("/", async (req, res) => {
  try {
    const row = await productsRepo.create(req.body);
    res.json(row);
  } catch (err) {
    console.error("POST /products failed:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /products/:id
router.put("/:id", async (req, res) => {
  try {
    const row = await productsRepo.update(req.params.id, req.body);
    res.json(row);
  } catch (err) {
    console.error("PUT /products/:id failed:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

export default router;
