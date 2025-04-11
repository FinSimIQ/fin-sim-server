const axios = require("axios");
const fs = require("fs");
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

    let stocks = [];
    if (fs.existsSync("stocks.json")) {
      const fileData = fs.readFileSync("stocks.json", "utf8");
      stocks = JSON.parse(fileData);
    }

    stocks.push(response.data);
    fs.writeFileSync("stocks.json", JSON.stringify(stocks, null, 2), "utf8");

    res.json({ message: "Stock data saved", data: response.data });
  } catch (error) {
    console.error("Error fetching stock data: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

if (require.main === module) {
  const testSymbol = "SCHW";

  const req = { params: { symbol: testSymbol } };
  const res = {
    json: (data) => console.log("Response:", JSON.stringify(data, null, 2)),
    status: function (code) {
      console.log(`Error Status: ${code}`);
      return this;
    },
  };

  this.getStockOverview(req, res);
}
