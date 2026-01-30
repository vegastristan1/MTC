import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from 'react-router-dom';

// Sidebar styles
const sidebarStyle = {
  width: '250px',
  height: '100vh',
  backgroundColor: '#1a1a2e',
  color: '#fff',
  position: 'fixed',
  left: 0,
  top: 0,
  padding: '20px 0',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
};

const menuItemStyle = (isActive) => ({
  padding: '12px 24px',
  color: isActive ? '#00d9ff' : '#a0a0a0',
  textDecoration: 'none',
  fontSize: '16px',
  transition: 'all 0.3s ease',
  borderLeft: isActive ? '4px solid #00d9ff' : '4px solid transparent',
  backgroundColor: isActive ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
  cursor: 'pointer',
  display: 'block',
});

const menuGroupStyle = {
  marginBottom: '8px',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: '#666',
  padding: '8px 24px',
  marginTop: '16px',
};

const mainContentStyle = {
  marginLeft: '120px',
  padding: '30px',
  minHeight: '100vh',
  backgroundColor: '#f5f7fa',
  flex: 1,
};

// Dashboard Page Component
const DashboardPage = () => {
  const [stats] = useState([
    { label: 'Total Sales', value: '$124,500', change: '+12.5%', positive: true },
    { label: 'Orders Today', value: '48', change: '+5.2%', positive: true },
    { label: 'Pending', value: '12', change: '-3.1%', positive: false },
    { label: 'MR Stock Items', value: '156', change: '+8.3%', positive: true },
  ]);

  const [chartData] = useState([
    { month: 'Jan', sales: 45000, orders: 120 },
    { month: 'Feb', sales: 52000, orders: 135 },
    { month: 'Mar', sales: 48000, orders: 128 },
    { month: 'Apr', sales: 61000, orders: 145 },
    { month: 'May', sales: 55000, orders: 138 },
    { month: 'Jun', sales: 67000, orders: 152 },
  ]);

  const [criticalStock, setCriticalStock] = useState([]);
  const [criticalLoading, setCriticalLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('M1');

  const maxSales = Math.max(...chartData.map(d => d.sales));

  // Fetch critical stock data
  useEffect(() => {
    setCriticalLoading(true);
    axios.get(`/api/allStockCheckerInventory/critical?warehouse=${warehouseFilter}`)
      .then((res) => {
        console.log('Critical stock data:', res.data);
        setCriticalStock(res.data.data || []);
      })
      .catch((err) => {
        console.error('Error fetching critical stock:', err);
      })
      .finally(() => setCriticalLoading(false));
  }, [warehouseFilter]);

  // Get status badge style
  const getStatusBadge = (status) => {
    const styles = {
      'No Stock': { backgroundColor: '#dc3545', color: '#fff' },
      'Critical': { backgroundColor: '#fd7e14', color: '#fff' },
      'Low': { backgroundColor: '#ffc107', color: '#333' },
      'Warning': { backgroundColor: '#17a2b8', color: '#fff' },
    };
    return styles[status] || { backgroundColor: '#6c757d', color: '#fff' };
  };

  // Get status count
  const getStatusCount = (status) => {
    return criticalStock.filter(item => item.StockStatus === status).length;
  };

  // Get filtered items based on status filter
  const getFilteredItems = () => {
    if (statusFilter === 'All') return criticalStock;
    return criticalStock.filter(item => item.StockStatus === statusFilter);
  };

  return (
    <div style={mainContentStyle}>
      <h1 style={{ marginBottom: '30px', color: '#333', fontSize: '28px' }}>Dashboard</h1>
      
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease',
          }}>
            <p style={{ color: '#888', margin: '0 0 8px 0', fontSize: '14px' }}>{stat.label}</p>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#333' }}>{stat.value}</h3>
            <span style={{
              color: stat.positive ? '#28a745' : '#dc3545',
              fontSize: '13px',
              fontWeight: '500',
            }}>
              {stat.change} from last month
            </span>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Sales Chart */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Monthly Sales Overview</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '12px' }}>
            {chartData.map((data, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  height: `${(data.sales / maxSales) * 180}px`,
                  backgroundColor: '#00d9ff',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s ease',
                }}></div>
                <span style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Monthly Orders</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '12px' }}>
            {chartData.map((data, index) => (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '100%',
                  height: `${(data.orders / 160) * 180}px`,
                  backgroundColor: '#6c5ce7',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s ease',
                }}></div>
                <span style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          gridColumn: 'span 2',
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Recent Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { time: '10 mins ago', action: 'New order #1248 received from ABC Corp', type: 'order' },
              { time: '25 mins ago', action: 'MR Stock updated: +15 units added', type: 'stock' },
              { time: '1 hour ago', action: 'Invoice #5678 generated for XYZ Ltd', type: 'invoice' },
              { time: '2 hours ago', action: 'Low stock alert: 5 items below threshold', type: 'alert' },
              { time: '3 hours ago', action: 'Payment received: $4,250.00', type: 'payment' },
            ].map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: activity.type === 'order' ? '#28a745' : 
                                   activity.type === 'stock' ? '#00d9ff' : 
                                   activity.type === 'invoice' ? '#6c5ce7' : 
                                   activity.type === 'alert' ? '#ffc107' : '#17a2b8',
                  marginRight: '12px',
                }}></div>
                <span style={{ flex: 1, color: '#333' }}>{activity.action}</span>
                <span style={{ color: '#888', fontSize: '13px' }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Stock Table */}
        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginTop: '20px',
          gridColumn: 'span 2',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ margin: '0', color: '#333' }}>🔴 Critical Stock Alert</h3>
              <select
                value={warehouseFilter}
                onChange={(e) => {
                  console.log('Warehouse changed to:', e.target.value);
                  setWarehouseFilter(e.target.value);
                }}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  border: '1px solid #ddd',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <option value="M1">M1 - Main Warehouse</option>
                <option value="M2">M2 - Daet Warehouse</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setStatusFilter('All')}
                style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  backgroundColor: statusFilter === 'All' ? '#333' : '#6c757d', 
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                All: {criticalStock.length}
              </button>
              <button
                onClick={() => setStatusFilter('No Stock')}
                style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  backgroundColor: statusFilter === 'No Stock' ? '#333' : '#dc3545', 
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                No Stock: {getStatusCount('No Stock')}
              </button>
              <button
                onClick={() => setStatusFilter('Critical')}
                style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  backgroundColor: statusFilter === 'Critical' ? '#333' : '#fd7e14', 
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Critical: {getStatusCount('Critical')}
              </button>
              <button
                onClick={() => setStatusFilter('Low')}
                style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  backgroundColor: statusFilter === 'Low' ? '#333' : '#ffc107', 
                  color: statusFilter === 'Low' ? '#fff' : '#333',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Low: {getStatusCount('Low')}
              </button>
              <button
                onClick={() => setStatusFilter('Warning')}
                style={{ 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '12px', 
                  fontWeight: '600',
                  backgroundColor: statusFilter === 'Warning' ? '#333' : '#17a2b8', 
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Warning: {getStatusCount('Warning')}
              </button>
            </div>
          </div>
          
          {criticalLoading ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading critical stock...</p>
          ) : criticalStock.length === 0 ? (
            <p style={{ color: '#28a745', textAlign: 'center', padding: '40px', fontWeight: '500' }}>✅ No critical stock items! All items have sufficient stock.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555', fontWeight: '600', fontSize: '13px' }}>Stock Code</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', color: '#555', fontWeight: '600', fontSize: '13px' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#555', fontWeight: '600', fontSize: '13px' }}>Warehouse</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#555', fontWeight: '600', fontSize: '13px' }}>On Hand</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', color: '#555', fontWeight: '600', fontSize: '13px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredItems().map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #e9ecef', backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                      <td style={{ padding: '12px 16px', color: '#333', fontWeight: '500' }}>{item.StockCode}</td>
                      <td style={{ padding: '12px 16px', color: '#555', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.Description}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#555' }}>{item.Warehouse}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ color: '#dc3545', fontWeight: '600', fontSize: '14px' }}>{item.OnHandCS} CS</span>
                        <span style={{ color: '#888', fontSize: '11px', marginLeft: '6px' }}>/ {item.OnHandPcs} PCS</span>
                        <div style={{ color: '#17a2b8', fontSize: '10px', marginTop: '2px' }}>
                          Free: {item.StockFreeCS} CS / {item.StockFreePCS} PCS
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          ...getStatusBadge(item.StockStatus)
                        }}>
                          {item.StockStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MR Checker Page Component
const MRCheckerPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-01-12');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fields to display in list view
  const listColumns = ['StockCode', 'Description', 'CS', 'PCS', 'Operator', 'DATE'];

  // All available columns
  const allColumns = [
    'StockCode', 'Description', 'CS', 'PCS', 'Amount', 
    'SalesOrder', 'Invoice', 'Customer', 'Salesperson', 
    'Warehouse', 'Operator', 'DATE', 'CreditReason'
  ];

  const columnLabels = {
    'StockCode': 'Stock Code',
    'Description': 'Description',
    'CS': 'Cartons',
    'PCS': 'Pieces',
    'Amount': 'Amount',
    'SalesOrder': 'Sales Order',
    'Invoice': 'Invoice',
    'Customer': 'Customer',
    'Salesperson': 'Salesperson',
    'Warehouse': 'Warehouse',
    'Operator': 'Operator',
    'DATE': 'Date',
    'CreditReason': 'Credit Reason'
  };

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatNumber = (value, fractionDigits = 2) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    const num = Number(value);
    if (Number.isNaN(num)) return 'N/A';
    return num.toFixed(fractionDigits);
  };

  const fetchData = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (fromDate) params.append('from', fromDate);
    if (toDate) params.append('to', toDate);
    if (searchTerm) params.append('search', searchTerm);
    params.append('page', page);
    params.append('pageSize', pageSize);
    
    axios.get(`/api/MRChecker?${params.toString()}`)
      .then((res) => {
        const response = res.data;
        setData(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalRecords(response.total || 0);
        setCurrentPage(response.page || 1);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching MR Checker:', err);
        setError('Error fetching MR Checker data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchData(newPage);
    }
  };

  const handleRowsChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    fetchData(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const openModal = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  return (
    <div style={mainContentStyle}>
      <h1 style={{ marginBottom: '30px', color: '#333', fontSize: '28px' }}>MR Stock Checker</h1>
      
      {/* Filter Section */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '8px', color: '#555', fontWeight: '500' }}>From:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <label style={{ marginRight: '8px', color: '#555', fontWeight: '500' }}>To:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Search Stock Code or Operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchData(1)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', width: '180px' }}
            />
          </div>
          <button
            onClick={() => fetchData(1)}
            style={{
              padding: '10px 24px',
              backgroundColor: '#6c5ce7',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Search
          </button>
          <button
            onClick={fetchData}
            style={{
              padding: '10px 24px',
              backgroundColor: '#00d9ff',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Filter
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      {loading && <p>Loading...</p>}
      {!loading && error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && totalRecords > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          backgroundColor: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <span style={{ color: '#555' }}>
            Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: '#555' }}>Rows:</span>
            <select
              value={pageSize}
              onChange={handleRowsChange}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              {[30, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
            <button onClick={handlePrevPage} disabled={currentPage === 1} style={{ padding: '6px 12px' }}>Prev</button>
            <span>{currentPage} / {Math.max(totalPages, 1)}</span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} style={{ padding: '6px 12px' }}>Next</button>
          </div>
        </div>
      )}

      {/* Clickable List View - Responsive */}
      {!loading && !error && data.length > 0 && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          {/* List Header - hidden on mobile */}
          {!isMobile && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1.5fr 2.5fr 0.8fr 0.8fr 1fr 1fr',
              padding: '14px 20px', 
              backgroundColor: '#f8f9fa',
              borderBottom: '2px solid #e9ecef',
              fontWeight: '600',
              color: '#333',
            }}>
              {listColumns.map(col => (
                <div key={col}>{columnLabels[col] || col}</div>
              ))}
            </div>
          )}
          
          {/* List Items */}
          <div>
            {data.map((item, rowIndex) => (
              <div
                key={rowIndex}
                onClick={() => openModal(item)}
                style={{
                  padding: isMobile ? '16px' : '14px 20px',
                  borderBottom: '1px solid #e9ecef',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                {isMobile ? (
                  // Mobile card view
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#333' }}>{item.StockCode}</span>
                      <span style={{ color: '#888', fontSize: '12px' }}>{item.DATE}</span>
                    </div>
                    <div style={{ color: '#555', marginBottom: '8px', fontSize: '14px' }}>
                      {item.Description?.length > 50 ? item.Description.substring(0, 50) + '...' : item.Description}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#888' }}>
                      <span>CS: {formatNumber(item.CS, 0)}</span>
                      <span>PCS: {formatNumber(item.PCS, 0)}</span>
                      <span>{item.Operator}</span>
                    </div>
                  </div>
                ) : (
                  // Desktop grid view
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1.5fr 2.5fr 0.8fr 0.8fr 1fr 1fr',
                  }}>
                    {listColumns.map(col => {
                      let value = item[col];
                      let displayValue = value;
                      if (col === 'CS' || col === 'PCS') displayValue = formatNumber(value, 0);
                      if (value === null || value === undefined) displayValue = 'N/A';
                      return (
                        <div key={col} style={{ color: '#555' }}>{displayValue}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          No MR Stock Checker data available.
        </div>
      )}

      {/* Modal for Full Details - Responsive */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }} onClick={closeModal}>
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: isMobile ? '20px' : '24px' }}>Item Details</h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#888',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              {allColumns.map(col => {
                let value = selectedItem[col];
                let displayValue = value;
                if (col === 'Amount') displayValue = formatNumber(value, 2);
                if (col === 'CS' || col === 'PCS') displayValue = formatNumber(value, 0);
                if (value === null || value === undefined) displayValue = 'N/A';
                
                return (
                  <div key={col} style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{columnLabels[col] || col}</div>
                    <div style={{ color: '#333', fontWeight: '500', wordBreak: 'break-word' }}>{displayValue}</div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#00d9ff',
                  color: '#1a1a2e',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inventory Page Component - All Stock Checker Inventory
const InventoryPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [warehouses, setWarehouses] = useState([]);

  // Custom warehouse labels
  const warehouseLabels = {
    'M1': 'Main Warehouse',
    'M2': 'Daet Warehouse',
    'M3': 'Nearly Expire'
  };

  // Get warehouse display label
  const getWarehouseLabel = (code) => {
    return warehouseLabels[code] || code;
  };

  // Fetch warehouses on component mount
  useEffect(() => {
    axios.get('/api/allStockCheckerInventory/warehouses')
      .then((res) => {
        setWarehouses(res.data || []);
      })
      .catch((err) => {
        console.error('Error fetching warehouses:', err);
      });
  }, []);

  // Fields to display in list view - dynamic based on warehouse selection
  const listColumns = selectedWarehouse === 'ALL' 
    ? ['StockCode', 'Description', 'Warehouse', 'OnHandCS', 'OnHandPcs', 'StockFreeCS', 'StockFreePCS']
    : ['StockCode', 'Description', 'OnHandCS', 'OnHandPcs', 'StockFreeCS', 'StockFreePCS'];

  // All available columns
  const allColumns = [
    'StockCode', 'Description', 'Warehouse', 
    'OnHandCS', 'OnHandPcs', 
    'AllocCS', 'AllocPcs', 
    'StockFreeCS', 'StockFreePCS',
    'Value', 'PricePCS', 'PriceCS', 'Config', 'IB/Cs', 'Remarks'
  ];

  const columnLabels = {
    'StockCode': 'Stock Code',
    'Description': 'Description',
    'Warehouse': 'Warehouse',
    'OnHandCS': 'On Hand CS',
    'OnHandPcs': 'On Hand PCS',
    'AllocCS': 'Allocated CS',
    'AllocPcs': 'Allocated PCS',
    'StockFreeCS': 'Free Stock CS',
    'StockFreePCS': 'Free Stock PCS',
    'Value': 'Value',
    'PricePCS': 'Price/PCS',
    'PriceCS': 'Price/CS',
    'Config': 'Config',
    'IB/Cs': 'IB/CS',
    'Remarks': 'Remarks'
  };

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatNumber = (value, fractionDigits = 2) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    const num = Number(value);
    if (Number.isNaN(num)) return 'N/A';
    return num.toFixed(fractionDigits);
  };

  const fetchData = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedWarehouse && selectedWarehouse !== 'ALL') params.append('warehouse', selectedWarehouse);
    params.append('page', page);
    params.append('pageSize', pageSize);
    
    axios.get(`/api/allStockCheckerInventory?${params.toString()}`)
      .then((res) => {
        const response = res.data;
        setData(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalRecords(response.total || 0);
        setCurrentPage(response.page || 1);
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching Inventory data:', err);
        setError('Error fetching Inventory data.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchData(newPage);
    }
  };

  const handleRowsChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    fetchData(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const openModal = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  return (
    <div style={mainContentStyle}>
      <h1 style={{ marginBottom: '30px', color: '#333', fontSize: '28px' }}>All Stock Checker Inventory</h1>
      
      {/* Filter Section */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <select
              value={selectedWarehouse}
              onChange={(e) => {
                setSelectedWarehouse(e.target.value);
                fetchData(1);
              }}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', minWidth: '180px' }}
            >
              <option value="ALL">All Warehouses</option>
              {warehouses.map(wh => (
                <option key={wh} value={wh}>{getWarehouseLabel(wh)}</option>
              ))}
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search Stock Code or Description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchData(1)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', width: '250px' }}
            />
          </div>
          <button
            onClick={() => fetchData(1)}
            style={{
              padding: '10px 24px',
              backgroundColor: '#6c5ce7',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Search
          </button>
          <button
            onClick={fetchData}
            style={{
              padding: '10px 24px',
              backgroundColor: '#00d9ff',
              color: '#1a1a2e',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Pagination Info */}
      {loading && <p>Loading...</p>}
      {!loading && error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && totalRecords > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          backgroundColor: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          flexWrap: 'wrap',
          gap: '10px',
        }}>
          <span style={{ color: '#555' }}>
            Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
          </span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: '#555' }}>Rows:</span>
            <select
              value={pageSize}
              onChange={handleRowsChange}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
            >
              {[50, 100, 200, 500].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
            <button onClick={handlePrevPage} disabled={currentPage === 1} style={{ padding: '6px 12px' }}>Prev</button>
            <span>{currentPage} / {Math.max(totalPages, 1)}</span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} style={{ padding: '6px 12px' }}>Next</button>
          </div>
        </div>
      )}

      {/* Clickable List View - Responsive */}
      {!loading && !error && data.length > 0 && (
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          {/* List Header - hidden on mobile */}
          {!isMobile && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: selectedWarehouse === 'ALL' 
                ? '1fr 3fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr' 
                : '1fr 3fr 0.8fr 0.8fr 0.8fr 0.8fr',
              padding: '14px 20px', 
              backgroundColor: '#e9ecef',
              borderBottom: '2px solid #dee2e6',
              fontWeight: '600',
              color: '#333',
            }}>
              {listColumns.map(col => {
                const isNumeric = ['OnHandCS', 'OnHandPcs', 'StockFreeCS', 'StockFreePCS'].includes(col);
                return (
                  <div key={col} style={{ 
                    paddingRight: '12px',
                    textAlign: isNumeric ? 'center' : 'left',
                  }}>{columnLabels[col] || col}</div>
                );
              })}
            </div>
          )}
          
          {/* List Items */}
          <div>
            {data.map((item, rowIndex) => (
              <div
                key={rowIndex}
                onClick={() => openModal(item)}
                style={{
                  padding: isMobile ? '16px' : '14px 20px',
                  borderBottom: '1px solid #dee2e6',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  backgroundColor: rowIndex % 2 === 0 ? '#fff' : '#f8f9fa',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e3f2fd'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#fff' : '#f8f9fa'}
              >
                {isMobile ? (
                  // Mobile card view
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#333' }}>{item.StockCode}</span>
                      {selectedWarehouse === 'ALL' && (
                        <span style={{ color: '#888', fontSize: '12px' }}>{item.Warehouse}</span>
                      )}
                    </div>
                    <div style={{ color: '#555', marginBottom: '8px', fontSize: '14px' }}>
                      {item.Description?.length > 50 ? item.Description.substring(0, 50) + '...' : item.Description}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#888' }}>
                      <span>OH: {formatNumber(item.OnHandCS, 0)}/{formatNumber(item.OnHandPcs, 0)}</span>
                      <span>Free: {formatNumber(item.StockFreeCS, 0)}/{formatNumber(item.StockFreePCS, 0)}</span>
                    </div>
                  </div>
                ) : (
                  // Desktop grid view
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: selectedWarehouse === 'ALL' 
                      ? '1fr 3fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr' 
                      : '1fr 3fr 0.8fr 0.8fr 0.8fr 0.8fr',
                    gap: '8px',
                  }}>
                    {listColumns.map(col => {
                      let value = item[col];
                      let displayValue = value;
                      if (col === 'OnHandCS' || col === 'OnHandPcs' || col === 'StockFreeCS' || col === 'StockFreePCS') displayValue = formatNumber(value, 0);
                      if (value === null || value === undefined) displayValue = '0';
                      const isNumeric = ['OnHandCS', 'OnHandPcs', 'StockFreeCS', 'StockFreePCS'].includes(col);
                      const isDescription = col === 'Description';
                      return (
                        <div key={col} style={{ 
                          color: '#555',
                          paddingRight: '12px',
                          textAlign: isNumeric ? 'center' : 'left',
                          overflow: 'hidden',
                          textOverflow: isDescription ? 'ellipsis' : 'clip',
                          whiteSpace: isDescription ? 'nowrap' : 'nowrap',
                        }}>{displayValue}</div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
          No Inventory data available.
        </div>
      )}

      {/* Modal for Full Details - Responsive */}
      {selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }} onClick={closeModal}>
          <div 
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: isMobile ? '20px' : '24px' }}>Item Details</h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#888',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
              {allColumns.map(col => {
                let value = selectedItem[col];
                let displayValue = value;
                if (col === 'Value' || col === 'PricePCS' || col === 'PriceCS') displayValue = formatNumber(value, 2);
                if (col === 'OnHandCS' || col === 'OnHandPcs' || col === 'AllocCS' || col === 'AllocPcs' || col === 'StockFreeCS' || col === 'StockFreePCS') displayValue = formatNumber(value, 0);
                if (value === null || value === undefined) displayValue = 'N/A';
                
                return (
                  <div key={col} style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{columnLabels[col] || col}</div>
                    <div style={{ color: '#333', fontWeight: '500', wordBreak: 'break-word' }}>{displayValue}</div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <button
                onClick={closeModal}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#00d9ff',
                  color: '#1a1a2e',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Placeholder Page Component
const PlaceholderPage = ({ title, description }) => (
  <div style={mainContentStyle}>
    <h1 style={{ marginBottom: '30px', color: '#333', fontSize: '28px' }}>{title}</h1>
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '60px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚧</div>
      <h2 style={{ color: '#333', marginBottom: '12px' }}>{title}</h2>
      <p style={{ color: '#888' }}>{description}</p>
    </div>
  </div>
);

// Sidebar Component
const Sidebar = () => {
  const location = useLocation();

  return (
    <nav style={sidebarStyle}>
      <div style={{ padding: '0 24px', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, color: '#00d9ff', fontSize: '22px' }}>MTC Dashboard</h2>
        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '13px' }}>Management Tool</p>
      </div>

      <div style={menuGroupStyle}>Main Menu</div>
      <NavLink to="/" style={({ isActive }) => menuItemStyle(isActive)}>
        📊 Dashboard
      </NavLink>
      <NavLink to="/mr-checker" style={({ isActive }) => menuItemStyle(isActive)}>
        📦 MR Stock Checker
      </NavLink>
      <NavLink to="/inventory" style={({ isActive }) => menuItemStyle(isActive)}>
        📋 Inventory
      </NavLink>

      <div style={menuGroupStyle}>Future Pages</div>
      <NavLink to="/reports" style={({ isActive }) => menuItemStyle(isActive)}>
        📈 Reports
      </NavLink>
      <NavLink to="/settings" style={({ isActive }) => menuItemStyle(isActive)}>
        ⚙️ Settings
      </NavLink>
    </nav>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={mainContentStyle}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/mr-checker" element={<MRCheckerPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/reports" element={<PlaceholderPage title="Reports" description="Reports and analytics page - Coming Soon" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" description="Application settings - Coming Soon" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
