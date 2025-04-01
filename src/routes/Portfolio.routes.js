const express = require('express');
const router = express.Router();
const PortfolioController = require('../controllers/Portfolio.controller');

router.post('/buy', PortfolioController.buyStock);
router.post('/sell', PortfolioController.sellStock);
router.get('/value/:userId', PortfolioController.getPortfolioValue);

module.exports = router;
