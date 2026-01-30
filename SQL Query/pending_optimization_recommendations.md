# Database Optimization Recommendations for Pending Queries

## Recommended Indexes for SorMaster Table

Create the following indexes to optimize the pending queries:

```sql
-- Composite index for pending orders query (most important)
CREATE NONCLUSTERED INDEX IX_SorMaster_PendingOrders 
ON SorMaster (OrderDate DESC, OrderStatus, OrderType, DocumentType, Salesperson)
INCLUDE (SalesOrder, Customer, CustomerName, CustomerPoNumber, ReqShipDate, Branch, Warehouse, LastOperator)
WHERE OrderStatus IN ('8', '0') AND OrderType = 'B' AND DocumentType = 'B'
GO

-- Index for sales order lookups
CREATE NONCLUSTERED INDEX IX_SorMaster_SalesOrder 
ON SorMaster (SalesOrder)
INCLUDE (OrderStatus, DocumentType, Customer, CustomerName, OrderDate, ReqShipDate, Branch, Warehouse, LastOperator, Salesperson)
GO

-- Index for customer name search
CREATE NONCLUSTERED INDEX IX_SorMaster_CustomerName 
ON SorMaster (CustomerName)
WHERE OrderStatus IN ('8', '0') AND OrderType = 'B'
GO
```

## Recommended Indexes for SorAdditions Table

```sql
-- Composite index for line items query
CREATE NONCLUSTERED INDEX IX_SorAdditions_SalesOrder 
ON SorAdditions (SalesOrder, LineValue)
INCLUDE (StockCode, Description, OrderQty, UnitPrice, LineValue, Salesperson)
GO

-- Index for value calculations
CREATE NONCLUSTERED INDEX IX_SorAdditions_ValueCalculation 
ON SorAdditions (SalesOrder)
WHERE LineValue > 0
INCLUDE (StockCode, Description, OrderQty, UnitPrice, LineValue)
GO
```

## Query Optimizations Applied

### 1. Changed `BETWEEN` to `>= AND <`
```sql
-- Before (less efficient)
OrderDate BETWEEN @startDate AND @endDate

-- After (more efficient)
OrderDate >= @startDate AND OrderDate < DATEADD(day, 1, @endDate)
```

### 2. Changed `RIGHT JOIN` to `INNER JOIN`
```sql
-- Before
RIGHT JOIN SorAdditions ON SorAdditions.SalesOrder = SorMaster.SalesOrder

-- After
INNER JOIN SorAdditions sa ON sa.SalesOrder = sm.SalesOrder
```

### 3. Added Pagination with `OFFSET/FETCH`
```sql
-- Server-side pagination
ORDER BY sm.SalesOrder DESC
OFFSET @offset ROWS
FETCH NEXT @pageSize ROWS ONLY
```

### 4. Added Search Functionality
```sql
-- Search by SalesOrder, CustomerName, or CustomerPoNumber
AND (
    sm.SalesOrder LIKE @searchTerm
    OR sm.CustomerName LIKE @searchTerm
    OR sm.CustomerPoNumber LIKE @searchTerm
)
```

## Caching Strategy

The API now includes in-memory caching with:
- **TTL**: 1 minute for total values
- **Cache size limit**: 100 entries
- **Client-side caching**: Paginated results are cached on the client

## Performance Tips

1. **Enable Query Statistics**: Use `SET STATISTICS IO ON;` and `SET STATISTICS TIME ON;` to identify slow queries
2. **Update Statistics**: Regularly run `UPDATE STATISTICS SorMaster;` and `UPDATE STATISTICS SorAdditions;`
3. **Partitioning**: If table is very large, consider partitioning by OrderDate
4. **Read-Replica**: For heavy read operations, consider using a read replica

## Monitoring Queries

Check slow queries:
```sql
SELECT TOP 20 
    creation_time,
    last_execution_time,
    execution_count,
    total_worker_time/1000 AS total_cpu_ms,
    total_elapsed_time/1000 AS total_duration_ms,
    SUBSTRING(st.text, (qs.statement_start_offset/2) + 1, 
        ((CASE qs.statement_end_offset 
          WHEN -1 THEN DATALENGTH(st.text) 
          ELSE qs.statement_end_offset END 
         - qs.statement_start_offset)/2) + 1) AS statement_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY total_worker_time DESC;
```
