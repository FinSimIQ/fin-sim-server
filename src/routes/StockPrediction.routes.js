const express = require("express");
const router = express.Router();
const StockPredictionController = require("../controllers/StockPrediction.controller");

router.get("/predict/:symbol", StockPredictionController.predictStockPrice);

module.exports = router; 


