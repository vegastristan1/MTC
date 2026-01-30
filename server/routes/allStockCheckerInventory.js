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

module.exports = router;
