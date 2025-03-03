const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

// IMPORTANT: Alpha Vantage has rate limits (5 calls per minute for free tier)
// If GT is not giving funding for premuim we would need to implement rate limiting or caching if making frequent calls

/**
 * Technical Analysis Rules
 * These rules analyze price movements, volume, and technical indicators.
 * I have added a major rules that i could think of but we can add more.
 * Each rule has:
 * - name: Descriptive name of the analysis
 * - weight: Importance of the rule (higher weight = more impact on final score)
 * - evaluate: Function that implements the rule logic
 * 
 * Rule evaluation returns:
 * - 1: Positive signal (buy)
 * - -1: Negative signal (sell)
 * - 0: Neutral signal
 */
const technicalRules = {
  rsi: {
    name: "RSI Analysis",
    weight: 2,
    evaluate: (value) => {
      if (!value) return 0;
      if (value < 30) return 1; // Oversold - potential buy signal
      if (value > 70) return -1; // Overbought - potential sell signal
      return 0;
    }
  },
  movingAverages: {
    name: "Moving Averages",
    weight: 1,
    evaluate: (sma20, sma50) => {
      if (!sma20 || !sma50) return 0;
      if (sma20 > sma50) return 1; // Golden cross
      if (sma20 < sma50) return -1; // Death cross
      return 0;
    }
  },
  volume: {
    name: "Volume Analysis",
    weight: 1,
    evaluate: (volume) => {
      if (!volume || volume.length === 0) return 0;
      const avgVolume = volume.reduce((a, b) => a + b, 0) / volume.length;
      return volume[volume.length - 1] > avgVolume * 1.5 ? 1 : 0;
    }
  }
};

/**
 * Fundamental Analysis Rules
 * These rules analyze company financials and metrics
 * Each fundamentalRules follows the same structure as technical rules
 * but focuses on fundamental indicators like P/E ratio, debt, etc.
 */
const fundamentalRules = {
  peRatio: {
    name: "P/E Ratio",
    weight: 2,
    evaluate: (value) => {
      if (!value) return 0;
      if (value < 15) return 1; // Potentially undervalued
      if (value > 30) return -1; // Potentially overvalued
      return 0;
    }
  },
  debtToEquity: {
    name: "Debt to Equity",
    weight: 1,
    evaluate: (value) => {
      if (!value) return 0;
      if (value < 1) return 1; // Low debt
      if (value > 2) return -1; // High debt
      return 0;
    }
  },
  profitMargin: {
    name: "Profit Margin",
    weight: 1,
    evaluate: (value) => {
      if (!value) return 0;
      if (value > 15) return 1; // High profitability
      if (value < 5) return -1; // Low profitability
      return 0;
    }
  }
};

/**
 * Scoring System
 * Calculates total score based on rules and their weights
 * rules - Set of rules to evaluate (technical or fundamental)
 * data - Data to evaluate against rules
 * returns - Object containing total score and detailed results for each rule
 */
const calculateScore = (rules, data) => {
  let totalScore = 0;
  const ruleResults = [];

  for (const [key, rule] of Object.entries(rules)) {
    const value = rule.evaluate(data[key]);
    const weightedValue = value * rule.weight;
    totalScore += weightedValue;
    
    ruleResults.push({
      name: rule.name,
      value: value,
      weight: rule.weight,
      weightedValue: weightedValue
    });
  }

  return {
    totalScore,
    ruleResults
  };
};

/**
 * Stock Price Prediction Endpoint
 * Predicts stock price and ROI based on technical and fundamental analysis
 * 
 * req - Express request object
 * req.params.symbol - Stock symbol to analyze
 * req.query.timeframe - Prediction timeframe (short/medium/long)
 * res - Express response object
 * 
 * Response includes:
 * - Current and predicted prices
 * - Predicted ROI
 * - Confidence score
 * - Detailed technical and fundamental analysis
 */
const predictStockPrice = async (req, res) => {
  const { symbol } = req.params;
  const { timeframe } = req.query; // short, medium, long

  if (!symbol) {
    return res.status(400).json({ error: "Stock symbol is required" });
  }

  try {
    // Note: These API calls might fail if rate limit is exceeded
    const technicalResponse = await axios.get(BASE_URL, {
      params: {
        function: "TECHNICAL_INDICATORS",
        symbol: symbol,
        interval: "daily",
        apikey: API_KEY,
      },
    });

    const fundamentalResponse = await axios.get(BASE_URL, {
      params: {
        function: "OVERVIEW",
        symbol: symbol,
        apikey: API_KEY,
      },
    });

    // Handle missing or invalid data!
    const technicalData = {
      rsi: technicalResponse.data?.RSI?.["RSI"] || null,
      movingAverages: {
        sma20: technicalResponse.data?.SMA?.["SMA"] || null,
        sma50: technicalResponse.data?.SMA?.["SMA"] || null,
      },
      volume: technicalResponse.data?.Volume || [],
    };

    const fundamentalData = {
      peRatio: parseFloat(fundamentalResponse.data?.PERatio) || null,
      debtToEquity: parseFloat(fundamentalResponse.data?.DebtToEquityRatio) || null,
      profitMargin: parseFloat(fundamentalResponse.data?.ProfitMargin) || null,
    };

    // Calculate scores and combine technical/fundamental analysis
    const technicalAnalysis = calculateScore(technicalRules, technicalData);
    const fundamentalAnalysis = calculateScore(fundamentalRules, fundamentalData);
    const totalScore = technicalAnalysis.totalScore + fundamentalAnalysis.totalScore;

    // ROI multipliers based on timeframe
    // Short term: Lower multiplier, less risk
    // Long term: Higher multiplier, more risk
    let predictedROI;
    switch (timeframe) {
      case "short":
        predictedROI = totalScore * 2; // 2x multiplier for short term
        break;
      case "medium":
        predictedROI = totalScore * 3; // 3x multiplier for medium term
        break;
      case "long":
        predictedROI = totalScore * 4; // 4x multiplier for long term
        break;
      default:
        predictedROI = totalScore * 3; // Default to medium term
    }

    // Confidence score calculation
    // Base score of 50 (neutral) plus weighted adjustment
    const confidenceScore = Math.min(100, Math.max(0, 50 + totalScore * 5));

    // Response includes detailed analysis for transparency
    // Consider adding a 'summary' field for simpler responses
    const prediction = {
      symbol,
      currentPrice: parseFloat(fundamentalResponse.data?.Price) || 0,
      predictedPrice: parseFloat(fundamentalResponse.data?.Price) * (1 + predictedROI / 100),
      predictedROI,
      timeframe: timeframe || "medium",
      confidenceScore,
      analysis: {
        technical: {
          totalScore: technicalAnalysis.totalScore,
          rules: technicalAnalysis.ruleResults,
          indicators: {
            macdSignal: technicalAnalysis.totalScore > 0 ? "buy" : technicalAnalysis.totalScore < 0 ? "sell" : "neutral",
            rsiValue: technicalData.rsi,
            movingAverages: technicalData.movingAverages,
            volumeTrend: technicalData.volume[technicalData.volume.length - 1] > 
                        technicalData.volume[technicalData.volume.length - 2] ? "increasing" : "decreasing",
            priceVolatility: calculatePriceVolatility(technicalData.volume),
          }
        },
        fundamental: {
          totalScore: fundamentalAnalysis.totalScore,
          rules: fundamentalAnalysis.ruleResults,
          indicators: {
            peRatio: fundamentalData.peRatio,
            pbRatio: parseFloat(fundamentalResponse.data?.PriceToBookRatio) || null,
            debtToEquity: fundamentalData.debtToEquity,
            profitMargin: fundamentalData.profitMargin,
            revenueGrowth: parseFloat(fundamentalResponse.data?.RevenueGrowth) || null,
          }
        }
      }
    };

    res.json(prediction);
  } catch (error) {
    console.error("Error predicting stock price:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Calculate Price Volatility(Formula is kinda hardcoded since i came up with it myself)
 * Measures the standard deviation of returns as a percentage
 * Higher volatility indicates more risk
 * 
 * prices - Array of historical prices
 * return - Volatility as a percentage
 * 
 * Formula(This is correct math but i would need to test it later):
 * 1. Calculate returns between consecutive prices
 * 2. Calculate mean of returns
 * 3. Calculate variance (average squared deviation from mean)
 * 4. Take square root to get standard deviation
 * 5. Convert to percentage
 */
const calculatePriceVolatility = (prices) => {
  if (!prices || prices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * 100; // Return as percentage
};

module.exports = {
  predictStockPrice,
};
