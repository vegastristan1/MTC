// routes/totalordertoday.js
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

// Get today's orders and compare with yesterday
router.get('/', async (req, res) => {
    try {
        const cacheKey = 'total-orders-today';
        const cachedResult = getCachedData(cacheKey);
        if (cachedResult) {
            return res.json(cachedResult);
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Get today's and yesterday's dates
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        const yesterdayYear = yesterday.getFullYear();
        const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
        const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
        const yesterdayStr = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;

        request.input('todayDate', todayStr);
        request.input('yesterdayDate', yesterdayStr);

        // Query for today's and yesterday's orders
        const query = `
            SELECT 
                SUM(CASE WHEN OrderDate >= @todayDate THEN 1 ELSE 0 END) as TotalOrderToday,
                SUM(CASE WHEN OrderDate >= @yesterdayDate AND OrderDate < @todayDate THEN 1 ELSE 0 END) as TotalOrderYesterday
            FROM SorMasterRep 
            WHERE OrderStatus in ('9', '2')
              AND DocumentType = 'B'
        `;

        const result = await request.query(query);
        const orders = result.recordset[0];
        
        const totalOrderToday = orders?.TotalOrderToday || 0;
        const totalOrderYesterday = orders?.TotalOrderYesterday || 0;

        // Calculate percentage change
        let percentageChange = 0;
        
        if (totalOrderYesterday > 0) {
            percentageChange = ((totalOrderToday - totalOrderYesterday) / totalOrderYesterday * 100).toFixed(1);
        } else if (totalOrderToday > 0) {
            percentageChange = 100; // 100% increase if yesterday was 0
        }

        const response = { 
            totalOrderToday: totalOrderToday,
            totalOrderYesterday: totalOrderYesterday,
            percentageChange: parseFloat(percentageChange)
        };
        
        setCacheData(cacheKey, response);
        
        res.json(response);
    } catch (err) {
        console.error('Total orders today query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

// Get monthly orders for past 7 months (current month + 6 previous months)
router.get('/monthly', async (req, res) => {
    try {
        const cacheKey = 'total-orders-monthly-7';
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
                    WHEN OrderDate >= @startDateCurrent AND OrderDate < DATEADD(day, 1, @endDateCurrent)
                    THEN 1 
                    ELSE 0 
                END) as OrdersCurrent,
                SUM(CASE 
                    WHEN OrderDate >= @startDate6 AND OrderDate < DATEADD(day, 1, @endDate6)
                    THEN 1 
                    ELSE 0 
                END) as OrdersMonth6,
                SUM(CASE 
                    WHEN OrderDate >= @startDate5 AND OrderDate < DATEADD(day, 1, @endDate5)
                    THEN 1 
                    ELSE 0 
                END) as OrdersMonth5,
                SUM(CASE 
                    WHEN OrderDate >= @startDate4 AND OrderDate < DATEADD(day, 1, @endDate4)
                    THEN 1 
                    ELSE 0 
                END) as OrdersMonth4,
                SUM(CASE 
                    WHEN OrderDate >= @startDate3 AND OrderDate < DATEADD(day, 1, @endDate3)
                    THEN 1 
                    ELSE 0 
                END) as OrdersMonth3,
                SUM(CASE 
                    WHEN OrderDate >= @startDate2 AND OrderDate < DATEADD(day, 1, @endDate2)
                    THEN 1 
                    ELSE 0 
                END) as OrdersMonth2,
                SUM(CASE 
                    WHEN OrderDate >= @startDate1 AND OrderDate < DATEADD(day, 1, @endDate1)
                    THEN 1 
                    ELSE 0 
                END) as OrdersMonth1
            FROM SorMasterRep 
            WHERE OrderStatus in ('9', '2')
              AND DocumentType = 'B'
        `;

        const result = await request.query(query);
        const orders = result.recordset[0];

        // Add current month first (newest)
        monthlyData.push({
            month: getMonthName(currentMonth),
            year: currentYear,
            orders: orders.OrdersCurrent || 0,
            type: 'current'
        });

        // Add past 6 months (oldest to newest)
        for (let i = 6; i >= 1; i--) {
            const targetMonth = (currentMonth - i + 12) % 12;
            const targetYear = currentMonth - i < 0 ? currentYear - 1 : currentYear;
            
            monthlyData.push({
                month: getMonthName(targetMonth),
                year: targetYear,
                orders: orders[`OrdersMonth${i}`] || 0,
                type: 'monthly'
            });
        }

        const response = { monthlyData };
        setCacheData(cacheKey, response);
        
        res.json(response);
    } catch (err) {
        console.error('Monthly orders query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

module.exports = router;
