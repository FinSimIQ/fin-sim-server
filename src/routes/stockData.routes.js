const express = require("express");
const router = express.Router();
const {
  getStockOverview,
  getStockList,
} = require("../controllers/fetchStockData.controller");

router.get("/:symbol", getStockOverview);

module.exports = router;
