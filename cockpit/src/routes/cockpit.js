import { Router } from 'express';
import { getSummary, refreshSummary } from '../connectors/index.js';

const router = Router();

router.get('/summary', async (_req, res) => {
  let s = getSummary();
  if (!s) s = await refreshSummary();
  res.json(s);
});

router.post('/refresh', async (_req, res) => {
  const s = await refreshSummary();
  res.json(s);
});

export default router;
