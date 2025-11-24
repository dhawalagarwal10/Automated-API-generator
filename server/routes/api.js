const express = require('express');
const router = express.Router();
const {
  generateAPIHandler,
  getAPIStatus,
  stopAPI
} = require('../controllers/apiController');

// generate new api
router.post('/generate', generateAPIHandler);

// get running apis status
router.get('/status', getAPIStatus);

// stop a running api
router.delete('/stop/:apiId', stopAPI);

module.exports = router;
