const express = require('express');
const router = express.Router();
const { processEmailQueue } = require('../utils/emailProcessor');
const asyncHandler = require('express-async-handler');

// @desc    Trigger email queue processing
// @route   POST /api/worker/process-queue
// @access  Private (should be called by a trusted service like QStash/Cron)
router.post('/process-queue/:secret', asyncHandler(async (req, res) => {
    // Basit bir güvenlik önlemi, secret'ı çevre değişkeninden alacağız
    if (req.params.secret !== process.env.WORKER_SECRET) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('Worker endpoint triggered...');
    const result = await processEmailQueue();
    
    if (result.success) {
        res.status(200).json({ message: result.message });
    } else {
        res.status(500).json({ message: result.error });
    }
}));

module.exports = router; 