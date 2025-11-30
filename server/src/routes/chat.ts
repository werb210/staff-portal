import { Router } from 'express';

const router = Router();

router.use((req, res) => {
  res.status(501).json({ error: 'Chat route not implemented' });
});

export default router;
