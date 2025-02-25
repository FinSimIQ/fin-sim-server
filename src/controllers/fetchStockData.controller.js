const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

exports.getStockOverview = async (req, res) => {
  const { symbol } = req.params;

  if (!symbol) {
    return res.status(400).json({ error: "Stock symbol is required" });
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "OVERVIEW",
        symbol: symbol,
        apikey: API_KEY,
      },
    });

    if (!response.data || Object.keys(response.data).length === 0) {
      return res.status(400).json({ error: "Stock data not found" });
    }

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching stock data: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
