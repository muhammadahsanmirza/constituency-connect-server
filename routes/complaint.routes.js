const express = require('express');
const router = express.Router();
const complaintController = require('../controller/complaint.controller');
const upload = require('../middlewares/upload.middleware');
const { verifyAccessToken } = require('../middlewares/auth.middleware');

// Define routes for Complaint

// Create a new complaint
router.post('/', verifyAccessToken,
  upload.fields([
    { name: 'attachfile1', maxCount: 1 },
    { name: 'attachfile2', maxCount: 1 },
    { name: 'attachfile3', maxCount: 1 }
  ]),
  complaintController.createComplaint
);

// Get all complaints
router.get('/', verifyAccessToken, complaintController.getComplaints);

// Get a single complaint by ID
router.get('/:id', verifyAccessToken, complaintController.getComplaintById);

// Update a complaint by ID
router.put('/:id', verifyAccessToken, complaintController.updateComplaint);

// Delete a complaint by ID
router.delete('/:id', verifyAccessToken, complaintController.deleteComplaint);

module.exports = router;
