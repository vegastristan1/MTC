// routes/mrChecker.js
const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        const request = pool.request();
        
        // Track which parameters are added
        const params = {};
        
        // Get date parameters from query, format as YYYY-MM-DD
        let startDate = null;
        let endDate = null;
        let searchTerm = req.query.search || null;
        
        if (req.query.from) {
            // Validate and format the date
            const parsedDate = new Date(req.query.from);
            if (!Number.isNaN(parsedDate.getTime())) {
                // Format as YYYY-MM-DD for SQL Server
                const year = parsedDate.getFullYear();
                const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                const day = String(parsedDate.getDate()).padStart(2, '0');
                startDate = `${year}-${month}-${day}`;
            }
        }
        
        if (req.query.to) {
            // Validate and format the date
            const parsedDate = new Date(req.query.to);
            if (!Number.isNaN(parsedDate.getTime())) {
                // Format as YYYY-MM-DD for SQL Server
                const year = parsedDate.getFullYear();
                const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
                const day = String(parsedDate.getDate()).padStart(2, '0');
                endDate = `${year}-${month}-${day}`;
            }
        }

        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 30;
        const offset = (page - 1) * pageSize;

        // Build WHERE clauses for dates and search
        const dateConditions = [];
        const searchConditions = [];
        
        if (startDate) {
            request.input('startDate', startDate);
            dateConditions.push("imv.EntryDate >= @startDate");
        }
        
        if (endDate) {
            request.input('endDate', endDate);
            dateConditions.push("imv.EntryDate <= @endDate");
        }
        
        if (searchTerm) {
            request.input('searchTerm', `%${searchTerm}%`);
            searchConditions.push("(sa.StockCode LIKE @searchTerm OR ats.Operator LIKE @searchTerm)");
        }
        
        // Combine all conditions
        const whereConditions = [...dateConditions, ...searchConditions];
        
        // Count total records
        const countQuery = `
            SELECT COUNT(*) as total
            FROM InvMovements imv
            JOIN ArTrnSummary ats
                ON ats.SalesOrder = imv.SalesOrder
            JOIN InvMaster im
                ON im.StockCode = imv.StockCode
            LEFT JOIN SorAdditions sa
                ON sa.SalesOrder = imv.SalesOrder
               AND sa.StockCode  = imv.StockCode
            WHERE
                imv.Warehouse = 'MR'
                AND imv.TrnQty < 0
                AND sa.StockCode IS NOT NULL
                ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''}
        `;
        
        const countResult = await request.query(countQuery);
        const totalRecords = countResult.recordset[0].total;

        // Main query with pagination
        const query = `
            SELECT
                sa.StockCode,
                sa.Description,

                -- Cartons
                TP.TotalPCS / CAST(im.ConvFactAltUom AS int) AS CS,

                -- Remaining pieces
                TP.TotalPCS % CAST(im.ConvFactAltUom AS int) AS PCS,

                imv.TrnValue * 1.12 AS Amount,
                ats.SalesOrder,
                ats.Invoice,
                ats.Customer,
                ats.Salesperson,
                imv.Warehouse,
                ats.Operator,
                CONVERT(varchar, imv.EntryDate, 101) AS [DATE],
                sa.CreditReason
            FROM InvMovements imv
            JOIN ArTrnSummary ats
                ON ats.SalesOrder = imv.SalesOrder
            JOIN InvMaster im
                ON im.StockCode = imv.StockCode
            LEFT JOIN SorAdditions sa
                ON sa.SalesOrder = imv.SalesOrder
               AND sa.StockCode  = imv.StockCode
            CROSS APPLY (
                SELECT CAST(
                    ROUND(ABS(imv.TrnQty) * im.ConvFactAltUom, 0)
                    AS int
                ) AS TotalPCS
            ) TP
            WHERE
                imv.Warehouse = 'MR'
                AND imv.TrnQty < 0
                AND sa.StockCode IS NOT NULL
                ${whereConditions.length > 0 ? 'AND ' + whereConditions.join(' AND ') : ''}
            Order by Invoice asc
            OFFSET @offset ROWS
            FETCH NEXT @pageSize ROWS ONLY
        `;

        request.input('offset', offset);
        request.input('pageSize', pageSize);

        const result = await request.query(query);
        res.json({
            data: result.recordset ?? [],
            total: totalRecords,
            page: page,
            pageSize: pageSize,
            totalPages: Math.ceil(totalRecords / pageSize)
        });
    } catch (err) {
        console.error('MR Checker query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

module.exports = router;
