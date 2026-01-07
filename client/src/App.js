import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import chunk from 'lodash/chunk';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
} from 'react-router-dom';

const getItemKey = (item, index) =>
  item?.ID ?? item?.id ?? item?.InvoiceNumber ?? item?.InvoiceDate ?? index;

const navLinkStyle = (isActive) => ({
  display: 'inline-block',
  padding: '10px 16px',
  borderRadius: '6px',
  border: isActive ? '2px solid #0d6efd' : '1px solid #ccc',
  backgroundColor: isActive ? '#0d6efd' : '#f7f7f7',
  color: isActive ? '#fff' : '#333',
  fontWeight: isActive ? 600 : 400,
  textDecoration: 'none',
});

const DataPage = ({
  endpoint,
  title,
  emptyText,
  columnOrder,
  columnLabels,
  formatters,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    axios.get(endpoint)
      .then((res) => {
        if (!isActive) {
          return;
        }
        setData(Array.isArray(res.data) ? res.data : []);
        setCurrentPage(0);
        setError(null);
        console.log(`${title} API Response:`, res.data);
      })
      .catch((err) => {
        if (!isActive) {
          return;
        }
        console.error(`Error fetching ${title}:`, err);
        setError(`Error fetching ${title}.`);
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [endpoint, title]);

  const columns = useMemo(() => {
    const seen = new Set();
    const ordered = [];

    if (Array.isArray(columnOrder)) {
      columnOrder.forEach((col) => {
        if (!seen.has(col)) {
          seen.add(col);
          ordered.push(col);
        }
      });
    }

    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!seen.has(key)) {
          seen.add(key);
          ordered.push(key);
        }
      });
    });

    return ordered;
  }, [data, columnOrder]);

  const pageSizeOptions = [30, 50, 100];
  const pagedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }
    return chunk(data, pageSize > 0 ? pageSize : data.length);
  }, [data, pageSize]);

  const totalPages = pagedData.length;
  const totalRecords = data.length;

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(0);
      return;
    }
    if (currentPage > totalPages - 1) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);

  const currentPageData = totalPages > 0 ? pagedData[currentPage] : [];

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    if (!Number.isNaN(newSize) && newSize > 0) {
      setPageSize(newSize);
      setCurrentPage(0);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, Math.max(totalPages - 1, 0)));
  };

  const pageStart = totalPages > 0 ? currentPage * pageSize + 1 : 0;
  const pageEnd = totalPages > 0 ? pageStart + currentPageData.length - 1 : 0;
  const isFirstPage = currentPage === 0;
  const isLastPage = totalPages === 0 || currentPage === totalPages - 1;
  const formatValue = (column, value) => {
    if (formatters && typeof formatters[column] === 'function') {
      return formatters[column](value);
    }

    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }

    if (typeof value === 'number') {
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (err) {
        return 'N/A';
      }
    }

    return value.toString();
  };

  return (
    <section>
      <h2>{title}</h2>
      {loading && <p>Loading...</p>}
      {!loading && error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && data.length === 0 && <p>{emptyText}</p>}
      {!loading && !error && totalRecords > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <div>
            Showing {pageStart.toLocaleString()}&ndash;{pageEnd.toLocaleString()} of {totalRecords.toLocaleString()} records
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label htmlFor={`${title}-page-size`}>
              Rows per page:{' '}
              <select
                id={`${title}-page-size`}
                value={pageSize}
                onChange={handlePageSizeChange}
                style={{ padding: '4px 8px' }}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button type="button" onClick={handlePrevPage} disabled={isFirstPage}>
                Prev
              </button>
              <span>
                Page {totalPages === 0 ? 0 : currentPage + 1} of {Math.max(totalPages, 1)}
              </span>
              <button type="button" onClick={handleNextPage} disabled={isLastPage}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && data.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: '800px' }}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    style={{
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      padding: '8px',
                      backgroundColor: '#f2f2f2',
                    }}
                  >
                    {columnLabels?.[column] ?? column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((item, rowIndex) => (
                <tr key={getItemKey(item, rowIndex)}>
                  {columns.map((column) => {
                    const value = item[column];
                    const displayValue = formatValue(column, value);
                    return (
                      <td key={`${column}-${rowIndex}`} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

function App() {
  const sorMasterColumns = [
    'SalesOrder',
    'Customer',
    'Salesperson',
    'CustomerPoNumber',
    'OrderDate',
    'ReqShipDate',
    'DateLastDocPrt',
    'LastInvoice',
    'CustomerName',
    'LastOperator'
  ];

  const arTrnColumns = [
    'Invoice',
    'SalesOrder',
    'InvoiceDate',
    'Salesperson',
    'Customer',
    'OrderType',
    'CustomerPoNumber',
    'MerchandiseValue',
    'TaxValue',
    'DiscValue',
    'MerchandiseCost',
    'WarehouseAccount',
    'WarehouseAmount',
    'BranchSalesAccount',
    'BranchSalesAmount',
    'BranchCostAccount',
    'Operator'
  ];

  const formatNumber = (value, fractionDigits = 2) => {
    if (value === null || value === undefined || value === '') {
      return 'N/A';
    }
    const num = Number(value);
    if (Number.isNaN(num)) {
      return 'N/A';
    }
    return num.toFixed(fractionDigits);
  };

  const formatDateTime = (value) => {
    if (!value) {
      return 'N/A';
    }

    if (typeof value === 'string') {
      return value.replace('T', ' ').replace('Z', '');
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().replace('T', ' ').replace('Z', '');
    }

    return value.toString();
  };

  const formatTimeStamp = (value) => {
    if (value && typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
      const hex = value.data.map((byte) => byte.toString(16).padStart(2, '0')).join('');
      return `0x${hex.toUpperCase()}`;
    }
    return 'N/A';
  };

  const numericFormatter = (fractionDigits = 2) => (value) => formatNumber(value, fractionDigits);

  const sharedFormatters = {
    OrderDate: formatDateTime,
    EntrySystemDate: formatDateTime,
    ReqShipDate: formatDateTime,
    DateLastDocPrt: formatDateTime,
    EntInvoiceDate: formatDateTime,
    DateLastInvPrt: formatDateTime,
    CreditedInvDate: formatDateTime,
    TimeStamp: formatTimeStamp,
    CaptureHh: numericFormatter(0),
    CaptureMm: numericFormatter(0),
    TimeDelPrtedHh: numericFormatter(0),
    TimeDelPrtedMm: numericFormatter(0),
    TimeInvPrtedHh: numericFormatter(0),
    TimeInvPrtedMm: numericFormatter(0),
    TimeTakenToAdd: numericFormatter(0),
    TimeTakenToChg: numericFormatter(0),
    ShipToGpsLat: numericFormatter(6),
    ShipToGpsLong: numericFormatter(6),
    DiscPct1: numericFormatter(2),
    DiscPct2: numericFormatter(2),
    DiscPct3: numericFormatter(2),
  };

  const arTrnFormatters = {
    ...sharedFormatters,
    MerchandiseValue: numericFormatter(2),
    FreightValue: numericFormatter(2),
    OtherValue: numericFormatter(2),
    TaxValue: numericFormatter(2),
    ForeignMerchVal: numericFormatter(2),
    ForeignFreightVal: numericFormatter(2),
    ForeignOtherVal: numericFormatter(2),
    ForeignTaxVal: numericFormatter(2),
    ExchangeRate: numericFormatter(6),
    CommissionValue: numericFormatter(2),
    DiscValue: numericFormatter(2),
    MerchandiseCost: numericFormatter(2),
    SettlementDisc: numericFormatter(2),
    ExemptValue: numericFormatter(2),
    DispatchAmount: numericFormatter(2),
    WarehouseAmount: numericFormatter(2),
    BranchSalesAmount: numericFormatter(2),
    BranchCostAmount: numericFormatter(2),
  };

  const sorMasterFormatters = {
    ...sharedFormatters,
    InvoiceCount: numericFormatter(0),
    CommissionSales1: numericFormatter(2),
    CommissionSales2: numericFormatter(2),
    CommissionSales3: numericFormatter(2),
    CommissionSales4: numericFormatter(2),
    TimeTakenToAdd: numericFormatter(0),
    TimeTakenToChg: numericFormatter(0),
    NumDispatches: numericFormatter(0),
  };

  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <h1>Dashboard</h1>

        <nav style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <NavLink to="/sormaster" style={({ isActive }) => navLinkStyle(isActive)}>
            SorMaster
          </NavLink>
          <NavLink to="/artrnsummary" style={({ isActive }) => navLinkStyle(isActive)}>
            ArTrnSummary
          </NavLink>
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/sormaster" replace />} />
          <Route
            path="/sormaster"
                element={
                  <DataPage
                    endpoint="/api/SorMaster"
                    title="SorMaster"
                    emptyText="No SorMaster data available."
                    columnOrder={sorMasterColumns}
                    formatters={sorMasterFormatters}
                  />
                }
              />
          <Route
            path="/artrnsummary"
            element={
              <DataPage
                endpoint="/api/ArTrnSummary"
                title="ArTrnSummary"
                emptyText="No ArTrnSummary data available."
                columnOrder={arTrnColumns}
                formatters={arTrnFormatters}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
