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
