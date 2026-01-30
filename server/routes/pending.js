// routes/pending.js
const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
    try {
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

        const query = `
            Select SUM(SorAdditions.LineValue * 1.12) as totalValueWithTax
            from SorMaster
            Right Join SorAdditions on SorAdditions.SalesOrder = SorMaster.SalesOrder
            where SorMaster.OrderStatus in ('8', '0') and OrderDate between @startDate and @endDate
            and SorMaster.OrderType = 'B' and SorMaster.DocumentType = 'B'
            and SorAdditions.LineValue > 0 and SorMaster.Salesperson in ('F01', 'F03', 'F04', 'N01', 'N02', 'N03', 'N05', 'N06', 'N07', 'N08', 'N12', 'N14', 'N75')
        `;

        const result = await request.query(query);
        const totalValue = result.recordset[0]?.totalValueWithTax || 0;
        res.json({
            totalValueWithTax: totalValue
        });
    } catch (err) {
        console.error('Pending query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

// Get list of pending SalesOrders for current month
router.get('/list', async (req, res) => {
    try {
        const pool = await poolPromise;
        const request = pool.request();

        // Get current month dates
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        
        const startDate = `${year}-${month}-01`;
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

        request.input('startDate', startDate);
        request.input('endDate', endDate);

        const query = `
            SELECT SalesOrder, OrderStatus, DocumentType, Customer, Salesperson, 
                   CustomerPoNumber, CustomerName, OrderDate, ReqShipDate, Branch, 
                   Warehouse, LastOperator
            FROM SorMaster sm
            WHERE sm.OrderStatus IN ('8', '0')
              AND sm.OrderDate BETWEEN @startDate AND @endDate
              AND sm.OrderType = 'B'
              AND sm.DocumentType = 'B'
              AND sm.Salesperson IN ('F01','F03','F04','N01','N02','N03','N05','N06','N07','N08','N12','N14','N75')
              AND EXISTS (
                    SELECT 1
                    FROM SorAdditions sa
                    WHERE sa.SalesOrder = sm.SalesOrder
                      AND sa.LineValue > 0
              )
            ORDER BY sm.SalesOrder DESC
        `;

        const result = await request.query(query);
        res.json({
            data: result.recordset || []
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
            SELECT sa.StockCode, sa.Description, sa.OrderQty, sa.UnitPrice, 
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
