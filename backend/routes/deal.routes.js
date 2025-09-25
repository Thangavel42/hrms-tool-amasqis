import express from 'express';
import {
  createDealCtrl,
  getAllDealsCtrl,
  getDealByIdCtrl,
  updateDealCtrl,
  deleteDealCtrl,
} from '../controllers/deal/deal.controller.js';
import { authenticateUser } from '../controllers/socialfeed/socialFeed.controller.js';
import { validateCompanyAccess } from '../controllers/socialfeed/validation.middleware.js';

const router = express.Router();

// Auth: production uses Clerk; development supports a simple bypass
if (process.env.NODE_ENV === 'production') {
  router.use(authenticateUser);
  router.use(validateCompanyAccess);
} else {
  router.use((req, res, next) => {
    // If Authorization is provided, fall back to real auth chain
    if (req.headers.authorization) return next();

    const devCompanyId = req.header('x-dev-company-id') || '68443081dcdfe43152aebf80';
    const devRole = req.header('x-dev-role') || 'admin';
    req.user = {
      publicMetadata: {
        companyId: devCompanyId,
        role: devRole,
      },
    };
    req.companyId = devCompanyId;
    next();
  });
}

// Create a new deal
router.post('/deals', createDealCtrl);

// Get all deals (supports filters via query params)
router.get('/deals', getAllDealsCtrl);

// Get a single deal by ID
router.get('/:id', getDealByIdCtrl);

// Update a deal by ID
router.put('/:id', updateDealCtrl);

// Delete (soft) a deal by ID
router.delete('/:id', deleteDealCtrl);

export default router;


