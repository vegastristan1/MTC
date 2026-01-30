// routes/allStockCheckerInventory.js
const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        
        const request = pool.request();
        
        // Track which parameters are added
        const params = {};
        
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 50;
        const offset = (page - 1) * pageSize;
        const searchTerm = req.query.search || null;
        const warehouse = req.query.warehouse || null;
        
        // Build WHERE clauses for search
        const searchConditions = [];
        
        if (searchTerm) {
            request.input('searchTerm', `%${searchTerm}%`);
            // Search both StockCode and Description with partial match (case-insensitive, trim whitespace)
            searchConditions.push(
                "(InvWarehouse.StockCode LIKE @searchTerm " +
                "OR LOWER(RTRIM(InvMaster.Description)) LIKE LOWER(@searchTerm))"
            );
        }
        
        // Combine all conditions
        const whereConditions = [
            "(InvWarehouse.QtyOnHand <> 0)",
            "InvMaster.ProductClass not like 'TS'",
            "InvPrice.PriceCode = '1'"
        ];
        
        // Warehouse filter - can be added if specific warehouse is needed
        if (warehouse && warehouse !== 'ALL') {
            request.input('warehouse', warehouse);
            whereConditions.push("InvWarehouse.Warehouse = @warehouse");
        }
        
        if (searchConditions.length > 0) {
            whereConditions.push(...searchConditions);
        }
        
        // Count total records
        const countQuery = `
            SELECT COUNT(*) as total
            FROM InvWarehouse 
            INNER JOIN InvMaster ON InvWarehouse.StockCode = InvMaster.StockCode
            INNER JOIN InvPrice ON InvWarehouse.StockCode = InvPrice.StockCode
            WHERE ${whereConditions.join(' AND ')}
        `;
        
        const countResult = await request.query(countQuery);
        const totalRecords = countResult.recordset[0].total;

        // Main query with pagination
        const query = `
            SELECT 
                InvWarehouse.StockCode, 
                InvMaster.Description, 
                InvWarehouse.Warehouse,
                FLOOR(ABS(InvWarehouse.QtyOnHand)) AS OnHandCS, 
                ISNULL(FLOOR(ROUND((ABS(InvWarehouse.QtyOnHand) - CAST(FLOOR(ABS(InvWarehouse.QtyOnHand)) AS decimal(15, 2))) * CAST(InvMaster.ConvFactAltUom AS decimal(10, 2)), 0)), 0) AS OnHandPcs,
                FLOOR(ABS(InvWarehouse.QtyAllocated)) AS AllocCS, 
                ISNULL(FLOOR(ROUND((ABS(InvWarehouse.QtyAllocated) - CAST(FLOOR(ABS(InvWarehouse.QtyAllocated)) AS decimal(15, 2))) * CAST(InvMaster.ConvFactAltUom AS decimal(10, 2)), 0)), 0) AS AllocPcs,
                FLOOR(ABS(InvWarehouse.QtyOnHand - InvWarehouse.QtyAllocated + InvWarehouse.QtyOnBackOrder)) AS StockFreeCS, 
                ISNULL(FLOOR(ROUND((ABS(InvWarehouse.QtyOnHand - InvWarehouse.QtyAllocated + InvWarehouse.QtyOnBackOrder) - CAST(FLOOR(ABS(InvWarehouse.QtyOnHand - InvWarehouse.QtyAllocated + InvWarehouse.QtyOnBackOrder)) AS decimal(15, 2))) * CAST(InvMaster.ConvFactAltUom AS decimal(10, 2)), 0)), 0) AS StockFreePCS,
                (InvPrice.SellingPrice*QtyOnHand)*1.12 as [Value],
                ISNULL(InvPrice.SellingPrice/ NULLIF (InvMaster.ConvFactAltUom,0),0) * 1.12 as [Price/PCS],
                InvPrice.SellingPrice * 1.12 as [PriceCS],
                InvMaster.AlternateUom as [Config], 
                InvMaster.ConvFactOthUom as [IB/Cs],
                Case
                    When InvWarehouse.QtyAllocated > InvWarehouse.QtyOnHand then 'OFR-OS QTY'
                    Else ''
                End As Remarks
            FROM InvWarehouse 
            INNER JOIN InvMaster ON InvWarehouse.StockCode = InvMaster.StockCode
            INNER JOIN InvPrice ON InvWarehouse.StockCode = InvPrice.StockCode
            WHERE ${whereConditions.join(' AND ')}
            Order by InvMaster.Description, InvWarehouse.Warehouse
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
        console.error('All Stock Checker Inventory query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

// Get distinct warehouses for filter dropdown
router.get('/warehouses', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT DISTINCT Warehouse 
            FROM InvWarehouse 
            WHERE QtyOnHand <> 0 
            ORDER BY Warehouse
        `);
        
        const warehouses = result.recordset.map(r => r.Warehouse);
        res.json(warehouses);
    } catch (err) {
        console.error('Warehouse query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

// Get critical stock items (stock <= 20) - M1 Warehouse only
router.get('/critical', async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();
        
        // Critical stock threshold (default 20)
        const threshold = parseInt(req.query.threshold) || 20;
        request.input('threshold', threshold);
        
        const query = `
            SELECT TOP 50
                InvWarehouse.StockCode, 
                InvMaster.Description, 
                InvWarehouse.Warehouse,
                FLOOR(ABS(InvWarehouse.QtyOnHand)) AS OnHandCS, 
                ISNULL(FLOOR(ROUND((ABS(InvWarehouse.QtyOnHand) - CAST(FLOOR(ABS(InvWarehouse.QtyOnHand)) AS decimal(15, 2))) * CAST(InvMaster.ConvFactAltUom AS decimal(10, 2)), 0)), 0) AS OnHandPcs,
                FLOOR(ABS(InvWarehouse.QtyOnHand - InvWarehouse.QtyAllocated + InvWarehouse.QtyOnBackOrder)) AS StockFreeCS, 
                ISNULL(FLOOR(ROUND((ABS(InvWarehouse.QtyOnHand - InvWarehouse.QtyAllocated + InvWarehouse.QtyOnBackOrder) - CAST(FLOOR(ABS(InvWarehouse.QtyOnHand - InvWarehouse.QtyAllocated + InvWarehouse.QtyOnBackOrder)) AS decimal(15, 2))) * CAST(InvMaster.ConvFactAltUom AS decimal(10, 2)), 0)), 0) AS StockFreePCS,
                Case
                    -- No Stock: 0 CS and 0 PCS
                    When FLOOR(ABS(InvWarehouse.QtyOnHand)) = 0 
                        AND ISNULL(FLOOR(ROUND((ABS(InvWarehouse.QtyOnHand) - CAST(FLOOR(ABS(InvWarehouse.QtyOnHand)) AS decimal(15, 2))) * CAST(InvMaster.ConvFactAltUom AS decimal(10, 2)), 0)), 0) = 0 
                        THEN 'No Stock'
                    -- Critical: 0 CS and > 0 PCS
                    When FLOOR(ABS(InvWarehouse.QtyOnHand)) = 0 
                        AND ISNULL(FLOOR(ROUND((ABS(InvWarehouse.QtyOnHand) - CAST(FLOOR(ABS(InvWarehouse.QtyOnHand)) AS decimal(15, 2))) * CAST(InvMaster.ConvFactAltUom AS decimal(10, 2)), 0)), 0) > 0 
                        THEN 'Critical'
                    -- Low: 5 <= OnHand CS <= 10
                    When FLOOR(ABS(InvWarehouse.QtyOnHand)) BETWEEN 5 AND 10 THEN 'Low'
                    -- Warning: OnHand CS > 10 and <= threshold
                    When FLOOR(ABS(InvWarehouse.QtyOnHand)) > 10 
                        AND FLOOR(ABS(InvWarehouse.QtyOnHand)) <= @threshold THEN 'Warning'
                    Else 'Normal'
                End As StockStatus
            FROM InvWarehouse 
            INNER JOIN InvMaster ON InvWarehouse.StockCode = InvMaster.StockCode
            INNER JOIN InvPrice ON InvWarehouse.StockCode = InvPrice.StockCode
            WHERE (InvWarehouse.QtyOnHand <> 0)
                AND InvMaster.ProductClass not like 'TS'
                AND InvPrice.PriceCode = '1'
                AND InvWarehouse.Warehouse = 'M1'
                AND FLOOR(ABS(InvWarehouse.QtyOnHand)) <= @threshold
            Order by 
                Case 
                    When FLOOR(ABS(InvWarehouse.QtyOnHand)) = 0 
                        AND ISNULL(FLOOR(ROUND((ABS(InvWarehouse.QtyOnHand) - CAST(FLOOR(ABS(InvWarehouse.QtyOnHand)) AS decimal(15, 2))) * CAST(InvMaster.ConvFactAltUom AS decimal(10, 2)), 0)), 0) = 0 
                        THEN 1
                    When FLOOR(ABS(InvWarehouse.QtyOnHand)) = 0 
                        AND ISNULL(FLOOR(ROUND((ABS(InvWarehouse.QtyOnHand) - CAST(FLOOR(ABS(InvWarehouse.QtyOnHand)) AS decimal(15, 2))) * CAST(InvMaster.ConvFactAltUom AS decimal(10, 2)), 0)), 0) > 0 
                        THEN 2
                    When FLOOR(ABS(InvWarehouse.QtyOnHand)) BETWEEN 5 AND 10 THEN 3
                    When FLOOR(ABS(InvWarehouse.QtyOnHand)) > 10 THEN 4
                    Else 5
                END ASC,
                FLOOR(ABS(InvWarehouse.QtyOnHand)) ASC
        `;
        
        const result = await request.query(query);
        res.json({
            data: result.recordset ?? [],
            total: result.recordset?.length || 0
        });
    } catch (err) {
        console.error('Critical Stock query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

module.exports = router;
