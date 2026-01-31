// routes/totalsales.js
const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

// Cache configuration (simple in-memory cache)
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

const getCachedData = (key) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
};

const setCacheData = (key, data) => {
    cache.set(key, { data, timestamp: Date.now() });
    // Clean up old cache entries
    if (cache.size > 100) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
};

// Helper function to get month name
const getMonthName = (monthIndex) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthIndex];
};

// Get today's sales
router.get('/today', async (req, res) => {
    try {
        const cacheKey = 'total-sales-today';
        const cachedResult = getCachedData(cacheKey);
        if (cachedResult) {
            return res.json(cachedResult);
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Get today's date
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        request.input('todayDate', todayStr);

        // Query for today's total sales
        const query = `
            SELECT SUM(MerchandiseValue + TaxValue) / 1.12 * 0.9820 as TotalSalesToday
            FROM ArTrnSummary 
            WHERE CAST(InvoiceDate AS DATE) = @todayDate
              AND MerchandiseValue > 0
        `;

        const result = await request.query(query);
        const totalSales = result.recordset[0]?.TotalSalesToday || 0;
        
        const response = { totalSalesToday: totalSales };
        setCacheData(cacheKey, response);
        
        res.json(response);
    } catch (err) {
        console.error('Today sales query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

// Get monthly sales for past 7 months (current month + 6 previous months)
router.get('/monthly', async (req, res) => {
    try {
        const cacheKey = 'total-sales-monthly-7';
        const cachedResult = getCachedData(cacheKey);
        if (cachedResult) {
            return res.json(cachedResult);
        }

        const pool = await poolPromise;
        const request = pool.request();

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        // Get dates for past 7 months (including current month)
        const monthlyData = [];
        
        // First add current month
        const startDateCurrent = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
        const lastDayCurrent = new Date(currentYear, currentMonth + 1, 0).getDate();
        const endDateCurrent = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDayCurrent).padStart(2, '0')}`;
        
        request.input('startDateCurrent', startDateCurrent);
        request.input('endDateCurrent', endDateCurrent);

        // Get dates for past 6 months
        for (let i = 6; i >= 1; i--) {
            const targetMonth = (currentMonth - i + 12) % 12;
            const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
            
            const startDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`;
            const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
            const endDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
            
            request.input(`startDate${i}`, startDate);
            request.input(`endDate${i}`, endDate);
        }

        // Build query for all 7 months (current + 6 previous)
        let query = `
            SELECT 
                SUM(CASE 
                    WHEN InvoiceDate >= @startDateCurrent AND InvoiceDate < DATEADD(day, 1, @endDateCurrent)
                    THEN (MerchandiseValue + TaxValue) / 1.12 * 0.9820 
                    ELSE 0 
                END) as SalesCurrent,
                SUM(CASE 
                    WHEN InvoiceDate >= @startDate6 AND InvoiceDate < DATEADD(day, 1, @endDate6)
                    THEN (MerchandiseValue + TaxValue) / 1.12 * 0.9820 
                    ELSE 0 
                END) as SalesMonth6,
                SUM(CASE 
                    WHEN InvoiceDate >= @startDate5 AND InvoiceDate < DATEADD(day, 1, @endDate5)
                    THEN (MerchandiseValue + TaxValue) / 1.12 * 0.9820 
                    ELSE 0 
                END) as SalesMonth5,
                SUM(CASE 
                    WHEN InvoiceDate >= @startDate4 AND InvoiceDate < DATEADD(day, 1, @endDate4)
                    THEN (MerchandiseValue + TaxValue) / 1.12 * 0.9820 
                    ELSE 0 
                END) as SalesMonth4,
                SUM(CASE 
                    WHEN InvoiceDate >= @startDate3 AND InvoiceDate < DATEADD(day, 1, @endDate3)
                    THEN (MerchandiseValue + TaxValue) / 1.12 * 0.9820 
                    ELSE 0 
                END) as SalesMonth3,
                SUM(CASE 
                    WHEN InvoiceDate >= @startDate2 AND InvoiceDate < DATEADD(day, 1, @endDate2)
                    THEN (MerchandiseValue + TaxValue) / 1.12 * 0.9820 
                    ELSE 0 
                END) as SalesMonth2,
                SUM(CASE 
                    WHEN InvoiceDate >= @startDate1 AND InvoiceDate < DATEADD(day, 1, @endDate1)
                    THEN (MerchandiseValue + TaxValue) / 1.12 * 0.9820 
                    ELSE 0 
                END) as SalesMonth1
            FROM ArTrnSummary 
            WHERE MerchandiseValue > 0
        `;

        const result = await request.query(query);
        const sales = result.recordset[0];

        // Add current month first (newest)
        monthlyData.push({
            month: getMonthName(currentMonth),
            year: currentYear,
            sales: sales.SalesCurrent || 0,
            type: 'current'
        });

        // Add past 6 months (oldest to newest)
        for (let i = 6; i >= 1; i--) {
            const targetMonth = (currentMonth - i + 12) % 12;
            const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
            
            monthlyData.push({
                month: getMonthName(targetMonth),
                year: targetYear,
                sales: sales[`SalesMonth${i}`] || 0,
                type: 'monthly'
            });
        }

        const response = { monthlyData };
        setCacheData(cacheKey, response);
        
        res.json(response);
    } catch (err) {
        console.error('Monthly sales query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

// Get current month sales (existing endpoint)
router.get('/', async (req, res) => {
    try {
        // Check cache first
        const cacheKey = 'total-sales-month';
        const cachedResult = getCachedData(cacheKey);
        if (cachedResult) {
            return res.json(cachedResult);
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Get current month dates dynamically
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        
        // Start of current month
        const startDate = `${year}-${month}-01`;
        
        // End of current month (last day)
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        request.input('startDate', startDate);
        request.input('endDate', endDate);

        // Query for total sales in current month
        const query = `
            SELECT SUM(MerchandiseValue + TaxValue) / 1.12 * 0.9820 as TotalSalesInMonth
            FROM ArTrnSummary 
            WHERE InvoiceDate >= @startDate 
              AND InvoiceDate < DATEADD(day, 1, @endDate)
              AND MerchandiseValue > 0
        `;

        const result = await request.query(query);
        const totalSales = result.recordset[0]?.TotalSalesInMonth || 0;
        
        const response = { totalSalesInMonth: totalSales };
        setCacheData(cacheKey, response);
        
        res.json(response);
    } catch (err) {
        console.error('Total sales query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

module.exports = router;
