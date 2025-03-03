const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

// In-memory storage for user portfolios (can store in database in the future)
const userPortfolios = new Map();

// Get current stock price
async function getCurrentStockPrice(symbol) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: "GLOBAL_QUOTE",
        symbol: symbol,
        apikey: API_KEY,
      },
    });

    if (!response.data || !response.data["Global Quote"] || !response.data["Global Quote"]["05. price"]) {
      throw new Error("Unable to fetch current stock price");
    }

    return parseFloat(response.data["Global Quote"]["05. price"]);
  } catch (error) {
    throw new Error(`Error fetching stock price: ${error.message}`);
  }
}

// Initialize or get user portfolio
function getUserPortfolio(userId) {
  if (!userPortfolios.has(userId)) {
    userPortfolios.set(userId, {
      stocks: {},  // Format: { symbol: { quantity: number, avgBuyPrice: number } }
      liquidCash: 10000,  // Starting with $10,000 for testing
      lastUpdated: new Date()
    });
  }
  return userPortfolios.get(userId);
}

// Buy stock
exports.buyStock = async (req, res) => {
  const { userId, symbol, quantity, price } = req.body;

  if (!userId || !symbol || !quantity || !price) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const portfolio = getUserPortfolio(userId);
    const totalCost = quantity * price;

    // Check if user has enough liquid cash
    if (portfolio.liquidCash < totalCost) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // Update portfolio
    if (!portfolio.stocks[symbol]) {
      portfolio.stocks[symbol] = {
        quantity: quantity,
        avgBuyPrice: price
      };
    } else {
      const currentPosition = portfolio.stocks[symbol];
      const newTotalQuantity = currentPosition.quantity + quantity;
      const newTotalCost = (currentPosition.quantity * currentPosition.avgBuyPrice) + (quantity * price);
      currentPosition.avgBuyPrice = newTotalCost / newTotalQuantity;
      currentPosition.quantity = newTotalQuantity;
    }

    // Deduct from liquid cash
    portfolio.liquidCash -= totalCost;
    portfolio.lastUpdated = new Date();

    res.json({
      message: "Stock purchased successfully",
      portfolio: portfolio
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sell stock
exports.sellStock = async (req, res) => {
  const { userId, symbol, quantity } = req.body;

  if (!userId || !symbol || !quantity) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    const portfolio = getUserPortfolio(userId);
    
    // Check if user has enough stocks to sell
    if (!portfolio.stocks[symbol] || portfolio.stocks[symbol].quantity < quantity) {
      return res.status(400).json({ error: "Insufficient stocks to sell" });
    }

    // Get current market price
    const currentPrice = await getCurrentStockPrice(symbol);
    const totalSaleValue = quantity * currentPrice;

    // Update portfolio
    portfolio.stocks[symbol].quantity -= quantity;
    if (portfolio.stocks[symbol].quantity === 0) {
      delete portfolio.stocks[symbol];
    }

    // Add to liquid cash
    portfolio.liquidCash += totalSaleValue;
    portfolio.lastUpdated = new Date();

    res.json({
      message: "Stock sold successfully",
      portfolio: portfolio
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current portfolio value
exports.getPortfolioValue = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const portfolio = getUserPortfolio(userId);
    let totalValue = portfolio.liquidCash;
    let unrealizedGains = 0;

    // Calculate value of all stocks
    for (const [symbol, position] of Object.entries(portfolio.stocks)) {
      const currentPrice = await getCurrentStockPrice(symbol);
      const marketValue = position.quantity * currentPrice;
      const costBasis = position.quantity * position.avgBuyPrice;
      
      totalValue += marketValue;
      unrealizedGains += (marketValue - costBasis);
    }

    res.json({
      liquidCash: portfolio.liquidCash,
      totalPortfolioValue: totalValue,
      unrealizedGains: unrealizedGains,
      lastUpdated: new Date(),
      holdings: portfolio.stocks
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
