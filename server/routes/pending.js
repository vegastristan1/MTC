// routes/pending.js
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
        const cacheKey = 'pending-total';
        const cachedResult = getCachedData(cacheKey);
        if (cachedResult) {
            return res.json(cachedResult);
        }

        const pool = await poolPromise;
        const request = pool.request();

        // Get current month dates
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

        // Optimized query with proper filtering order
        const query = `
            SELECT SUM(sa.LineValue * 1.12) as totalValueWithTax
            FROM SorMaster sm
            INNER JOIN SorAdditions sa ON sa.SalesOrder = sm.SalesOrder
            WHERE sm.OrderStatus IN ('8', '0')
              AND sm.OrderDate >= @startDate 
              AND sm.OrderDate < DATEADD(day, 1, @endDate)
              AND sm.OrderType = 'B' 
              AND sm.DocumentType = 'B'
              AND sm.Salesperson IN ('F01', 'F03', 'F04', 'N01', 'N02', 'N03', 'N05', 'N06', 'N07', 'N08', 'N12', 'N14', 'N75')
              AND sa.LineValue > 0
        `;

        const result = await request.query(query);
        const totalValue = result.recordset[0]?.totalValueWithTax || 0;
        
        const response = { totalValueWithTax: totalValue };
        setCacheData(cacheKey, response);
        
        res.json(response);
    } catch (err) {
        console.error('Pending query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

// Get paginated list of pending SalesOrders for current month
router.get('/list', async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 50;
        const searchTerm = req.query.search || '';
        
        // Get current month dates
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        request.input('startDate', startDate);
        request.input('endDate', endDate);
        request.input('pageSize', pageSize);
        request.input('offset', (page - 1) * pageSize);

        // Build WHERE clause with search support
        let whereClause = `
            WHERE sm.OrderStatus IN ('8', '0')
              AND sm.OrderDate >= @startDate 
              AND sm.OrderDate < DATEADD(day, 1, @endDate)
              AND sm.OrderType = 'B'
              AND sm.DocumentType = 'B'
              AND sm.Salesperson IN ('F01','F03','F04','N01','N02','N03','N05','N06','N07','N08','N12','N14','N75')
        `;

        if (searchTerm) {
            request.input('searchTerm', `%${searchTerm}%`);
            whereClause += `
              AND (
                sm.SalesOrder LIKE @searchTerm
                OR sm.CustomerName LIKE @searchTerm
                OR sm.CustomerPoNumber LIKE @searchTerm
              )
            `;
        }

        // Optimized query with pagination
        const query = `
            SELECT SalesOrder, OrderStatus, DocumentType, Customer, Salesperson, 
                   CustomerPoNumber, CustomerName, OrderDate, ReqShipDate, Branch, 
                   Warehouse, LastOperator
            FROM SorMaster sm
            ${whereClause}
              AND EXISTS (
                  SELECT 1
                  FROM SorAdditions sa
                  WHERE sa.SalesOrder = sm.SalesOrder
                    AND sa.LineValue > 0
              )
            ORDER BY sm.SalesOrder DESC
            OFFSET @offset ROWS
            FETCH NEXT @pageSize ROWS ONLY
        `;

        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) as total
            FROM SorMaster sm
            ${whereClause}
              AND EXISTS (
                  SELECT 1
                  FROM SorAdditions sa
                  WHERE sa.SalesOrder = sm.SalesOrder
                    AND sa.LineValue > 0
              )
        `;

        const [listResult, countResult] = await Promise.all([
            request.query(query),
            request.query(countQuery)
        ]);

        const total = countResult.recordset[0]?.total || 0;
        const totalPages = Math.ceil(total / pageSize);

        res.json({
            data: listResult.recordset || [],
            pagination: {
                page,
                pageSize,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (err) {
        console.error('Pending list query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

// Get details for a specific SalesOrder (line items with ValueWithTax)
router.get('/details/:salesOrder', async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        const salesOrder = req.params.salesOrder;
        
        request.input('salesOrder', salesOrder);

        // Get header info
        const headerQuery = `
            SELECT SalesOrder, OrderStatus, DocumentType, Customer, Salesperson, 
                   CustomerPoNumber, CustomerName, OrderDate, ReqShipDate, Branch, 
                   Warehouse, LastOperator
            FROM SorMaster 
            WHERE SalesOrder = @salesOrder
        `;
        
        const headerResult = await request.query(headerQuery);
        const header = headerResult.recordset[0] || {};
        
        // Get line items with ValueWithTax
        const lineItemsQuery = `
            SELECT sa.StockCode, sa.Description, sa.OrderQty, sa.Price, 
                   sa.LineValue, sa.LineValue * 1.12 as ValueWithTax, sa.Salesperson
            FROM SorAdditions sa
            WHERE sa.SalesOrder = @salesOrder AND sa.LineValue > 0
        `;
        
        const lineItemsResult = await request.query(lineItemsQuery);
        
        res.json({
            header: header,
            lineItems: lineItemsResult.recordset || []
        });
    } catch (err) {
        console.error('Pending details query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

module.exports = router;
