const express = require('express');
const router = express.Router();
const path = require('path');

const { authMiddleware } = require('../controllers/userController');

const { getUsersByGroup, sendMessage, getMessages } = require('../controllers/chatController');

// Use memory storage for Multer to get file buffer for Cloudinary upload
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/users/:groupId', authMiddleware, getUsersByGroup);

router.post('/send', authMiddleware, upload.single('image'), sendMessage);
router.get('/messages/:receiverId', authMiddleware, getMessages);

module.exports = router;
