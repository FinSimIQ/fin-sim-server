const mongoose = require("mongoose");

const stockPredictionSchema = new mongoose.Schema({
  // Stock symbol  
  symbol: { type: String, required: true },
  // Current price of the stock
  currentPrice: { type: Number, required: true },
  // Predicted price of the stock
  predictedPrice: { type: Number, required: true },
  // Predicted ROI of the stock
  predictedROI: { type: Number, required: true },
  // Timeframe of the prediction
  timeframe: { type: String, required: true }, // "short", "medium", "long"
  // Confidence score of the prediction
  confidenceScore: { type: Number, required: true },
  // Date of the analysis
  analysisDate: { type: Date, default: Date.now },
  // Technical indicators of the stock
  technicalIndicators: {
    macdSignal: { type: String }, // "buy", "sell", "neutral"
    rsiValue: { type: Number },
    movingAverages: {
      sma20: { type: Number },
      sma50: { type: Number },
      sma200: { type: Number }
    },
    volumeTrend: { type: String }, // "increasing", "decreasing", "stable"
    priceVolatility: { type: Number }
  },
  // Fundamental indicators of the stock
    fundamentalIndicators: {
    peRatio: { type: Number },
    pbRatio: { type: Number },
    debtToEquity: { type: Number },
    profitMargin: { type: Number },
    revenueGrowth: { type: Number }
  }
});

module.exports = mongoose.model("StockPrediction", stockPredictionSchema); 