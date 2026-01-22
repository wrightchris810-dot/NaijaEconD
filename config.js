// Fox Business Dashboard - Configuration File
// Replace these with your own API keys for live data

const API_CONFIG = {
    // Alpha Vantage API (Free tier: 25 requests per day)
    // Get your key at: https://www.alphavantage.co/support/#api-key
    ALPHA_VANTAGE: {
        API_KEY: 'YOUR_ALPHA_VANTAGE_API_KEY',
        BASE_URL: 'https://www.alphavantage.co/query',
        SYMBOLS: {
            DOW: 'DJIA',
            SP500: 'SPX',
            NASDAQ: 'NDX',
            VIX: 'VIX'
        }
    },
    
    // FRED API (Federal Reserve Economic Data)
    // Get your key at: https://fred.stlouisfed.org/docs/api/api_key.html
    FRED: {
        API_KEY: 'YOUR_FRED_API_KEY',
        BASE_URL: 'https://api.stlouisfed.org/fred',
        SERIES: {
            FED_FUNDS: 'FEDFUNDS',
            TREASURY_10Y: 'DGS10',
            CPI: 'CPIAUCSL',
            UNEMPLOYMENT: 'UNRATE',
            GDP: 'GDP'
        }
    },
    
    // NewsAPI (Free tier: 100 requests per day)
    // Get your key at: https://newsapi.org/register
    NEWS_API: {
        API_KEY: 'YOUR_NEWS_API_KEY',
        BASE_URL: 'https://newsapi.org/v2',
        ENDPOINTS: {
            TOP_HEADLINES: '/top-headlines',
            EVERYTHING: '/everything'
        }
    },
    
    // ExchangeRate-API (Free tier: 1,500 requests per month)
    // Get your key at: https://www.exchangerate-api.com/
    EXCHANGE_RATE_API: {
        API_KEY: 'YOUR_EXCHANGE_RATE_API_KEY',
        BASE_URL: 'https://v6.exchangerate-api.com/v6'
    },
    
    // Commodities API (Alternative free options)
    // Metal Prices API: https://metals-api.com/ (Free tier available)
    METALS_API: {
        API_KEY: 'YOUR_METALS_API_KEY',
        BASE_URL: 'https://metals-api.com/api'
    },
    
    // Open Exchange Rates (Free tier: 1,000 requests per month)
    // https://openexchangerates.org/
    OPEN_EXCHANGE: {
        API_KEY: 'YOUR_OPEN_EXCHANGE_API_KEY',
        BASE_URL: 'https://openexchangerates.org/api'
    }
};

// API Helper Functions
async function fetchWithFallback(url, fallbackData, errorMessage = 'API Error') {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`${errorMessage}: ${error.message}. Using fallback data.`);
        return fallbackData;
    }
}

// Market hours check (Eastern Time)
function isMarketOpen() {
    const now = new Date();
    const nyTime = now.toLocaleString("en-US", {timeZone: "America/New_York"});
    const nyDate = new Date(nyTime);
    
    const day = nyDate.getDay();
    const hour = nyDate.getHours();
    const minute = nyDate.getMinutes();
    
    // Market hours: 9:30 AM to 4:00 PM ET, Monday to Friday
    if (day >= 1 && day <= 5) {
        if (hour > 9 && hour < 16) return true;
        if (hour === 9 && minute >= 30) return true;
        if (hour === 16 && minute === 0) return true;
    }
    return false;
}

// Format numbers with proper commas and symbols
function formatNumber(value, isCurrency = true, decimals = 2) {
    if (isCurrency) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    }
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

// Calculate percentage change
function calculateChange(oldValue, newValue) {
    return ((newValue - oldValue) / oldValue) * 100;
}

// Color code based on value change
function getChangeColor(change) {
    return change >= 0 ? 'positive' : 'negative';
}

// Data refresh intervals (in milliseconds)
const REFRESH_INTERVALS = {
    MARKET_DATA: 30000,      // 30 seconds
    ECONOMIC_DATA: 300000,   // 5 minutes
    NEWS: 600000,           // 10 minutes
    COMMODITIES: 60000,     // 1 minute
    FOREX: 60000            // 1 minute
};

// Available API endpoints for different data types
const API_ENDPOINTS = {
    MARKET_DATA: [
        'alphavantage',
        'twelve_data',
        'marketstack'
    ],
    ECONOMIC_DATA: [
        'fred',
        'bls',
        'econdb'
    ],
    NEWS: [
        'newsapi',
        'gnews',
        'bing_news'
    ],
    COMMODITIES: [
        'metals_api',
        'commodities_api',
        'investing_com'
    ],
    FOREX: [
        'exchangerate_api',
        'openexchangerates',
        'currencylayer'
    ]
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG };
}
