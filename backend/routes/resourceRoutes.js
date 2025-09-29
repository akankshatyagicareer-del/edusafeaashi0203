const express = require('express');
const {
  getResources,
  createResource,
  completeResource,
  getResourceCompletion,
  deleteResource,
  updateResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// ✅ List + Create
router.route('/')
  .get(protect, getResources)
  .post(protect, authRole(['director']), upload.single('file'), createResource);

// ✅ Update
router.put('/:id', protect, authRole(['director']), upload.single('file'), updateResource);

// ✅ Mark complete
router.post('/:id/complete', protect, authRole(['student']), completeResource);

// ✅ FIX: frontend expects `/completions`
router.get('/completions', protect, getResourceCompletion);

// ✅ Delete
router.delete('/:id', protect, authRole(['director']), deleteResource);

module.exports = router;
