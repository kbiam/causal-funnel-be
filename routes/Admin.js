const express = require('express');
const AdminController = require('../controllers/AdminController');

const router = express.Router();

router.get('/submissions', AdminController.getSubmissions);

module.exports = router;