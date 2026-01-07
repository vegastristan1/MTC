// routes/sorMaster.js
const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db');

router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const limit = Number.parseInt(req.query.limit ?? '100', 10);
        const safeLimit = Number.isNaN(limit) ? 100 : Math.min(Math.max(limit, 1), 500);

        const request = pool.request();
        let query = `
            SELECT TOP (${safeLimit}) SalesOrder,
            Customer,
            Salesperson,
            CustomerPoNumber,
            OrderDate,
            ReqShipDate,
            DateLastDocPrt,
            LastInvoice,
            CustomerName,
            LastOperator
            FROM SorMaster
        `;

        const whereClauses = [];

        if (req.query.month) {
            const [year, month] = req.query.month.split('-').map((part) => Number.parseInt(part, 10));

            if (!Number.isNaN(year) && !Number.isNaN(month) && month >= 1 && month <= 12) {
                const start = new Date(Date.UTC(year, month - 1, 1));
                const end = new Date(Date.UTC(year, month, 1));
                request.input('startDate', start);
                request.input('endDate', end);
                whereClauses.push('DateLastDocPrt >= @startDate AND DateLastDocPrt < @endDate');
            }
        }

        if (req.query.from) {
            const fromDate = new Date(req.query.from);
            if (!Number.isNaN(fromDate.getTime())) {
                request.input('fromDate', fromDate);
                whereClauses.push('DateLastDocPrt >= @fromDate');
            }
        }

        if (req.query.to) {
            const toDate = new Date(req.query.to);
            if (!Number.isNaN(toDate.getTime())) {
                request.input('toDate', toDate);
                whereClauses.push('DateLastDocPrt <= @toDate');
            }
        }

        if (whereClauses.length > 0) {
            query += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        query += `
            ORDER BY
                CASE WHEN DateLastDocPrt IS NULL THEN 1 ELSE 0 END ASC,
                DateLastDocPrt DESC
        `;

        const result = await request.query(query);
        res.json(result.recordset ?? []);
    } catch (err) {
        console.error('SorMaster query failed:', err);
        res.status(500).send('Database Server Error');
    }
});

module.exports = router;
