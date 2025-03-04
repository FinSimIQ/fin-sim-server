const axios = require('axios');

/**
 * Fetches stock chart data from Alpha Vantage.
 *
 * @param {string} symbol - Stock ticker symbol (e.g., 'IBM').
 * @param {string} interval - Data interval for intraday data (e.g., '5min').
 * @param {string} functionType - API function type (e.g., 'TIME_SERIES_INTRADAY' or 'TIME_SERIES_DAILY').
 * @returns {Promise<Object>} - A promise that resolves to an object mapping epoch seconds to a stock value.
 */
async function getStockChartData(symbol, interval = '5min', functionType = 'TIME_SERIES_INTRADAY') {
  
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'W8QF38LZKL29QUJ2';
  
  let url = `https://www.alphavantage.co/query?function=${functionType}&symbol=${symbol}&apikey=${API_KEY}`;
  if (functionType === 'TIME_SERIES_INTRADAY') {
    url += `&interval=${interval}`;
  }
  
  try {
    const response = await axios.get(url);
    const data = response.data;
    
    // Finding the key for time series data based on function type
    let timeSeriesKey = '';
    if (functionType === 'TIME_SERIES_INTRADAY') {
      timeSeriesKey = `Time Series (${interval})`;
    } else if (functionType === 'TIME_SERIES_DAILY') {
      timeSeriesKey = 'Time Series (Daily)';
    } else {
      throw new Error("Unsupported function type");
    }
    
    // Checking if the expected time series data exists
    if (!data[timeSeriesKey]) {
      throw new Error('Time series data not found in the API response.');
    }
    
    const timeSeries = data[timeSeriesKey];
    const formattedData = {};
    
    // Iterating over each timestamp entry in the time series data
    for (const [timeStr, values] of Object.entries(timeSeries)) {
      const dt = new Date(timeStr);
      const epochSeconds = Math.floor(dt.getTime() / 1000);
      // For charting, i'm mapping timestamp to the closing price
      const closePrice = parseFloat(values['4. close']);
      formattedData[epochSeconds] = closePrice;
    }
    
    return formattedData;
    
  } catch (error) {
    console.error('Error fetching data from Alpha Vantage:', error.message);
    throw error;
  }
}

// TESTING 
(async () => {
  try {
    // using a 5-minute interval
    const chartData = await getStockChartData('IBM', '5min', 'TIME_SERIES_INTRADAY');
    console.log('Intraday Chart Data:', chartData);
    
    // if we want to use daily data instead:
    // const dailyData = await getStockChartData('IBM', null, 'TIME_SERIES_DAILY');
    // console.log('Daily Chart Data:', dailyData);
    
  } catch (err) {
    console.error("An error occurred:", err);
  }
})();
