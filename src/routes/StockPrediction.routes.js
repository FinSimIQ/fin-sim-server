const express = require("express");
const router = express.Router();
const StockPredictionController = require("../controllers/StockPrediction.controller");

router.post("/predict", StockPredictionController.predictStockPrice);

module.exports = router; 


