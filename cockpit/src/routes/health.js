import { Router } from 'express';
const router = Router();
router.get('/', (_req, res) => res.json({ ok: true, service: 'bfsg-os-cockpit', ts: new Date().toISOString() }));
export default router;
