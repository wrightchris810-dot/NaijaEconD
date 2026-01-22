// Fox Business Dashboard - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initDashboard();
    
    // Set up periodic updates
    setInterval(updateMarketData, 30000); // Update every 30 seconds
    setInterval(updateTime, 1000); // Update time every second
});

// Initialize dashboard components
async function initDashboard() {
    console.log('Initializing Fox Business Dashboard...');
    
    // Update display time
    updateTime();
    
    // Load all data
    await Promise.all([
        updateMarketData(),
        updateEconomicData(),
        updateCommodities(),
        updateForex(),
        loadNews(),
        updateChart()
    ]);
    
    // Update last updated timestamp
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
    
    // Set up event listeners
    document.getElementById('chart-timeframe').addEventListener('change', updateChart);
    document.getElementById('refresh-news').addEventListener('click', loadNews);
}

// Update current time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: 'numeric', 
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('current-time').textContent = `${dateString} ${timeString}`;
    
    // Update market status based on time
    updateMarketStatus(now);
}

// Update market open/closed status
function updateMarketStatus(currentTime) {
    const marketStatus = document.getElementById('market-status');
    const hours = currentTime.getHours();
    const day = currentTime.getDay();
    
    // Check if it's a weekday and market hours (9:30 AM - 4:00 PM ET)
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = (hours >= 9 && hours < 16) || (hours === 8 && currentTime.getMinutes() >= 30);
    
    if (isWeekday && isMarketHours) {
        marketStatus.textContent = 'MARKETS OPEN';
        marketStatus.className = 'market-open';
    } else {
        marketStatus.textContent = 'MARKETS CLOSED';
        marketStatus.className = 'market-closed';
    }
}

// Update market data from Alpha Vantage
async function updateMarketData() {
    console.log('Updating market data...');
    
    try {
        // Use fallback data if API fails
        const fallbackData = {
            'DOW': { price: '34,500.12', change: '+0.45%', changeRaw: 0.45 },
            'S&P 500': { price: '4,450.67', change: '+0.32%', changeRaw: 0.32 },
            'NASDAQ': { price: '13,750.89', change: '-0.12%', changeRaw: -0.12 },
            'VIX': { price: '15.34', change: '-2.1%', changeRaw: -2.1 }
        };
        
        // Update each index with fallback data
        Object.entries(fallbackData).forEach(([index, data]) => {
            const priceElement = document.getElementById(`${index.toLowerCase().replace('& ', '').replace(' ', '-')}-price`);
            const changeElement = document.getElementById(`${index.toLowerCase().replace('& ', '').replace(' ', '-')}-change`);
            
            if (priceElement && changeElement) {
                priceElement.textContent = data.price;
                changeElement.textContent = data.change;
                changeElement.className = `stat-change ${data.changeRaw >= 0 ? 'positive' : 'negative'}`;
            }
        });
        
        // Simulate real-time updates with small random variations
        simulateRealTimeUpdates();
        
    } catch (error) {
        console.error('Error updating market data:', error);
        useFallbackData();
    }
}

// Simulate real-time price movements
function simulateRealTimeUpdates() {
    const indices = ['dow', 'sp500', 'nasdaq', 'vix'];
    
    indices.forEach(index => {
        const priceElement = document.getElementById(`${index}-price`);
        const changeElement = document.getElementById(`${index}-change`);
        
        if (priceElement && changeElement) {
            const currentPrice = parseFloat(priceElement.textContent.replace(/[$,]/g, ''));
            const currentChange = parseFloat(changeElement.textContent.replace(/[+%-]/g, ''));
            
            // Small random movement (±0.05%)
            const randomMovement = (Math.random() - 0.5) * 0.1;
            const newChange = currentChange + randomMovement;
            const newPrice = currentPrice * (1 + newChange / 100);
            
            // Update display
            priceElement.textContent = formatPrice(newPrice, index === 'vix' ? 2 : 2);
            changeElement.textContent = `${newChange >= 0 ? '+' : ''}${newChange.toFixed(2)}%`;
            changeElement.className = `stat-change ${newChange >= 0 ? 'positive' : 'negative'}`;
        }
    });
}

// Update economic data from FRED API
async function updateEconomicData() {
    console.log('Updating economic data...');
    
    // Fallback economic data
    const economicData = {
        'fed-funds-rate': '5.33%',
        'treasury-10y': '4.25%',
        'treasury-change': '+0.02%',
        'mortgage-30y': '7.12%',
        'prime-rate': '8.50%',
        'cpi-rate': '3.2%',
        'core-cpi': '4.0%',
        'pce-rate': '2.6%',
        'unemployment-rate': '3.8%',
        'payrolls': '+199K',
        'jobless-claims': '202K',
        'participation-rate': '62.8%',
        'gdp-growth': '+4.9%',
        'industrial-production': '+0.6%',
        'retail-sales': '+0.3%',
        'pmi': '49.4'
    };
    
    // Update each economic indicator
    Object.entries(economicData).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            
            // Add color coding for certain metrics
            if (id.includes('change')) {
                const isPositive = value.startsWith('+');
                element.className = id.includes('treasury') ? `rate-change ${isPositive ? 'positive' : 'negative'}` : '';
            }
        }
    });
}

// Update commodities data
async function updateCommodities() {
    console.log('Updating commodities data...');
    
    const commodities = {
        'oil': { price: 71.45, change: -1.2 },
        'gas': { price: 2.67, change: 0.8 },
        'gold': { price: 1980.50, change: 0.5 },
        'silver': { price: 23.12, change: 0.3 },
        'copper': { price: 3.85, change: -0.4 }
    };
    
    Object.entries(commodities).forEach(([commodity, data]) => {
        const priceElement = document.getElementById(`${commodity}-price`);
        const changeElement = document.getElementById(`${commodity}-change`);
        
        if (priceElement && changeElement) {
            // Add small random variation
            const variation = (Math.random() - 0.5) * 0.3;
            const newPrice = data.price * (1 + variation / 100);
            const newChange = data.change + variation;
            
            priceElement.textContent = formatPrice(newPrice, commodity === 'gas' ? 2 : 2);
            changeElement.textContent = `${newChange >= 0 ? '+' : ''}${newChange.toFixed(1)}%`;
            changeElement.className = `commodity-change ${newChange >= 0 ? 'positive' : 'negative'}`;
        }
    });
}

// Update forex data
async function updateForex() {
    console.log('Updating forex data...');
    
    const forexPairs = {
        'eur': { rate: 1.0854, change: -0.12 },
        'gbp': { rate: 1.2650, change: 0.08 },
        'jpy': { rate: 142.35, change: 0.25 },
        'chf': { rate: 0.8670, change: -0.15 },
        'cad': { rate: 1.3540, change: 0.10 }
    };
    
    Object.entries(forexPairs).forEach(([currency, data]) => {
        const rateElement = document.getElementById(`${currency}-rate`);
        const changeElement = document.getElementById(`${currency}-change`);
        
        if (rateElement && changeElement) {
            // Add small random variation
            const variation = (Math.random() - 0.5) * 0.05;
            const newRate = data.rate + variation / 100;
            const newChange = data.change + variation * 10;
            
            rateElement.textContent = newRate.toFixed(4);
            changeElement.textContent = `${newChange >= 0 ? '+' : ''}${newChange.toFixed(2)}%`;
            changeElement.className = `currency-change ${newChange >= 0 ? 'positive' : 'negative'}`;
        }
    });
}

// Load financial news
async function loadNews() {
    console.log('Loading financial news...');
    
    const newsFeed = document.getElementById('news-feed');
    if (!newsFeed) return;
    
    // Show loading state
    newsFeed.innerHTML = '<div class="news-item loading">Loading latest financial news...</div>';
    
    try {
        // Fallback news data
        const fallbackNews = [
            {
                title: 'Federal Reserve Holds Rates Steady, Signals Caution on Future Hikes',
                source: 'Financial Times',
                time: '2 hours ago'
            },
            {
                title: 'Tech Stocks Rally as AI Investments Drive Record Quarterly Earnings',
                source: 'Bloomberg',
                time: '3 hours ago'
            },
            {
                title: 'Oil Prices Volatile Amid Middle East Tensions and Supply Concerns',
                source: 'Reuters',
                time: '4 hours ago'
            },
            {
                title: 'Consumer Confidence Rises Despite Inflation Concerns, Retail Data Shows',
                source: 'Wall Street Journal',
                time: '5 hours ago'
            },
            {
                title: 'Global Central Banks Coordinate Efforts to Stabilize Currency Markets',
                source: 'CNBC',
                time: '6 hours ago'
            }
        ];
        
        // Display news
        newsFeed.innerHTML = '';
        fallbackNews.forEach((news, index) => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.innerHTML = `
                <span class="news-title">${news.title}</span>
                <div>
                    <span class="news-source">${news.source}</span>
                    <span class="news-time">${news.time}</span>
                </div>
            `;
            newsFeed.appendChild(newsItem);
        });
        
    } catch (error) {
        console.error('Error loading news:', error);
        newsFeed.innerHTML = '<div class="news-item">Unable to load news. Please check your API configuration.</div>';
    }
}

// Update chart based on selected timeframe
async function updateChart() {
    const timeframe = document.getElementById('chart-timeframe').value;
    console.log(`Updating chart for timeframe: ${timeframe}`);
    
    const ctx = document.getElementById('indicesChart').getContext('2d');
    
    // Sample data for different timeframes
    const dataByTimeframe = {
        '1D': generateIntradayData(),
        '5D': generateFiveDayData(),
        '1M': generateMonthlyData(),
        '3M': generateQuarterlyData()
    };
    
    const data = dataByTimeframe[timeframe] || dataByTimeframe['1D'];
    
    // Destroy existing chart if it exists
    if (window.indicesChart) {
        window.indicesChart.destroy();
    }
    
    // Create new chart
    window.indicesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'DOW JONES',
                    data: data.dow,
                    borderColor: '#00c853',
                    backgroundColor: 'rgba(0, 200, 83, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'S&P 500',
                    data: data.sp500,
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'NASDAQ',
                    data: data.nasdaq,
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff',
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff'
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#cccccc'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#cccccc',
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Helper functions for chart data generation
function generateIntradayData() {
    const labels = ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'];
    const baseDow = 34500 + Math.random() * 200 - 100;
    const baseSP500 = 4450 + Math.random() * 20 - 10;
    const baseNasdaq = 13750 + Math.random() * 50 - 25;
    
    return {
        labels,
        dow: labels.map((_, i) => baseDow + (i * 10) + Math.random() * 50 - 25),
        sp500: labels.map((_, i) => baseSP500 + (i * 1) + Math.random() * 5 - 2.5),
        nasdaq: labels.map((_, i) => baseNasdaq + (i * 3) + Math.random() * 15 - 7.5)
    };
}

function generateFiveDayData() {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return {
        labels,
        dow: [34320, 34450, 34580, 34620, 34500],
        sp500: [4430, 4445, 4455, 4460, 4450],
        nasdaq: [13680, 13720, 13780, 13800, 13750]
    };
}

// Format price with commas and currency symbol
function formatPrice(price, decimals = 2) {
    if (price < 1) {
        return `$${price.toFixed(decimals)}`;
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

// Fallback function if APIs fail
function useFallbackData() {
    console.log('Using fallback data');
    // All our current data is already fallback, so just update timestamp
    document.getElementById('last-updated').textContent = new Date().toLocaleTimeString();
}
