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

// Truck Delivery Loading Animation Component
const TruckDeliveryLoading = ({ onComplete }) => {
  const [packageDropped, setPackageDropped] = useState(false);
  
  useEffect(() => {
    const dropTimer = setTimeout(() => {
      setPackageDropped(true);
    }, 5500); // Drop package at 5.5 seconds
    
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 15000); // Complete at 7 seconds
    
    return () => {
      clearTimeout(dropTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      backgroundColor: '#1a1a2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      {/* Progress Bar */}
      <div style={{
        width: '300px',
        height: '6px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '3px',
        marginBottom: '40px',
        overflow: 'hidden',
        visibility: 'hidden',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#00d9ff',
          borderRadius: '3px',
          animation: 'loading-progress 7s linear forwards',
        }} />
      </div>

      {/* Animation Container */}
      <div style={{ position: 'relative', width: '500px', height: '250px' }}>
        {/* Ground */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '0',
          right: '0',
          height: '4px',
          backgroundColor: '#666',
        }} />

        {/* Warehouse Image */}
        <img 
          src="/image/warehouse.png" 
          alt="Warehouse"
          style={{
            position: 'absolute',
            right: '20px',
            bottom: '24px',
            width: '150px',
            height: 'auto',
          }}
        />

        {/* Truck Image */}
        <img 
          src="/image/truck.png" 
          alt="Truck"
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '0',
            width: '150px',
            height: 'auto',
            animation: 'truck-drive 7s ease-in-out forwards',
          }}
        />

        {/* Package - Only shown after delivery */}
        {packageDropped && (
          <img 
            src="/image/boxes.png" 
            alt="Package"
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '185px',
              width: '50px',
              height: 'auto',
              animation: 'package-drop 0.5s ease-out forwards',
            }}
          />
        )}

        {/* Delivery text */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#fff',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
        }}>
          <div style={{ marginBottom: '10px' }}>🚚 Delivering Your Package</div>
          <div style={{ 
            fontSize: '16px', 
            color: '#00d9ff',
            animation: 'pulse 1s ease-in-out infinite',
          }}>
            {packageDropped ? 'Package Delivered!' : 'Please wait...'}
          </div>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>
        {`
          @keyframes truck-drive {
            0% { left: -150px; }
            70% { left: calc(500px - 280px); }
            80% { left: calc(500px - 280px); }
            100% { left: calc(500px - 200px); }
          }
          @keyframes package-drop {
            0% { 
              transform: translateY(0);
              opacity: 1;
            }
            50% { 
              transform: translateY(-40px);
              opacity: 0.8;
            }
            100% { 
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes loading-progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

// Hover Tooltip Component
const HoverTooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e) => {
    setShow(true);
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  const handleMouseMove = (e) => {
    updatePosition(e);
  };

  const updatePosition = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 40
    });
  };

  return (
    <div 
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      {show && (
        <div style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          {content}
        </div>
      )}
    </div>
  );
};

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
  // Orders Today state (must be before stats)
  const [ordersTodayData, setOrdersTodayData] = useState({
    totalOrderToday: 0,
    percentageChange: 0
  });
  const [ordersTodayLoading, setOrdersTodayLoading] = useState(true);

  const [stats, setStats] = useState([
    { label: 'Total Sales', value: 'Loading...', change: 'This month', positive: true },
    { label: 'Orders Today', value: ordersTodayData.totalOrderToday.toString(), change: `${ordersTodayData.percentageChange >= 0 ? '+' : ''}${ordersTodayData.percentageChange}% vs yesterday`, positive: ordersTodayData.percentageChange >= 0 },
    { label: 'Pending', value: 'Loading...', change: 'Loading...', positive: false },
    { label: 'MR Stock Items', value: '156', change: '+8.3%', positive: true },
  ]);
  const [pendingLoading, setPendingLoading] = useState(true);
  
  // Modal states
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingList, setPendingList] = useState([]);
  const [pendingListLoading, setPendingListLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  
  // Pagination and search states for pending list
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPageSize, setPendingPageSize] = useState(50);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [pendingDebouncedSearch, setPendingDebouncedSearch] = useState('');
  const [pendingListCache, setPendingListCache] = useState({});

  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  // Monthly Orders state
  const [monthlyOrdersData, setMonthlyOrdersData] = useState([]);
  const [monthlyOrdersLoading, setMonthlyOrdersLoading] = useState(true);

  const [criticalStock, setCriticalStock] = useState([]);
  const [criticalLoading, setCriticalLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [warehouseFilter, setWarehouseFilter] = useState('M1');

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

  // Fetch orders today data
  useEffect(() => {
    setOrdersTodayLoading(true);
    axios.get('/api/totalordertoday')
      .then((res) => {
        const { totalOrderToday, percentageChange } = res.data;
        setOrdersTodayData({
          totalOrderToday,
          percentageChange
        });
      })
      .catch((err) => {
        console.error('Error fetching orders today:', err);
      })
      .finally(() => setOrdersTodayLoading(false));
  }, []);

  // Update stats when ordersTodayData changes
  useEffect(() => {
    setStats(prevStats => prevStats.map(stat => 
      stat.label === 'Orders Today' ? { 
        ...stat, 
        value: ordersTodayData.totalOrderToday.toString(),
        change: `${ordersTodayData.percentageChange >= 0 ? '+' : ''}${ordersTodayData.percentageChange}% vs yesterday`,
        positive: ordersTodayData.percentageChange >= 0
      } : stat
    ));
  }, [ordersTodayData, ordersTodayLoading]);

  // Fetch monthly orders data
  useEffect(() => {
    setMonthlyOrdersLoading(true);
    axios.get('/api/totalordertoday/monthly')
      .then((res) => {
        setMonthlyOrdersData(res.data.monthlyData || []);
      })
      .catch((err) => {
        console.error('Error fetching monthly orders:', err);
      })
      .finally(() => setMonthlyOrdersLoading(false));
  }, []);

  // Fetch pending total ValueWithTax for current month
  useEffect(() => {
    setPendingLoading(true);
    axios.get('/api/pending')
      .then((res) => {
        const totalValue = res.data.totalValueWithTax || 0;
        const formattedValue = new Intl.NumberFormat('en-PH', { 
          style: 'currency', 
          currency: 'PHP',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(totalValue);
        setStats(prevStats => prevStats.map(stat => 
          stat.label === 'Pending' ? { ...stat, value: formattedValue } : stat
        ));
      })
      .catch((err) => {
        console.error('Error fetching pending:', err);
        setStats(prevStats => prevStats.map(stat => 
          stat.label === 'Pending' ? { ...stat, value: '₱0.00' } : stat
        ));
      })
      .finally(() => setPendingLoading(false));
  }, []);

  // Fetch monthly sales for past 7 months (current month + 6 previous)
  // and calculate percentage change between December and January
  useEffect(() => {
    setChartLoading(true);
    axios.get('/api/totalsales/monthly')
      .then((res) => {
        const monthlyData = res.data.monthlyData || [];
        setChartData(monthlyData);
        
        // Find January (current month) and December (previous month) sales
        const currentMonth = monthlyData.find(d => d.type === 'current');
        const previousMonth = monthlyData.find(d => d.type === 'monthly' && d.month === 'Dec');
        
        // Update Total Sales stat with current month sales
        if (currentMonth) {
          const formattedValue = new Intl.NumberFormat('en-PH', { 
            style: 'currency', 
            currency: 'PHP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(currentMonth.sales);
          setStats(prevStats => prevStats.map(stat => 
            stat.label === 'Total Sales' ? { ...stat, value: formattedValue } : stat
          ));
        }
        
        // Calculate percentage change between December and January
        if (currentMonth && previousMonth && previousMonth.sales > 0) {
          // Formula: (December / January - 100)%
          const percentage = ((previousMonth.sales / currentMonth.sales) * 100 - 100).toFixed(1);
          const isPositive = parseFloat(percentage) >= 0;
          
          setStats(prevStats => prevStats.map(stat => 
            stat.label === 'Total Sales' ? { 
              ...stat, 
              change: `${isPositive ? '+' : ''}${percentage}% vs ${previousMonth.month} ${previousMonth.year}`,
              positive: isPositive
            } : stat
          ));
        }
      })
      .catch((err) => {
        console.error('Error fetching monthly sales:', err);
      })
      .finally(() => setChartLoading(false));
  }, []);

  // Debounced search for pending list
  useEffect(() => {
    const timer = setTimeout(() => {
      setPendingDebouncedSearch(pendingSearchTerm);
      setPendingPage(1); // Reset to first page on search
    }, 300);
    
    return () => clearTimeout(timer);
  }, [pendingSearchTerm]);

  // Fetch pending list for modal with pagination
  const fetchPendingList = (page = pendingPage) => {
    setShowPendingModal(true);
    setPendingListLoading(true);
    setSelectedOrder(null);
    setOrderDetails(null);
    
    // Check cache first
    const cacheKey = `page_${page}_size_${pendingPageSize}_search_${pendingDebouncedSearch}`;
    if (pendingListCache[cacheKey]) {
      setPendingList(pendingListCache[cacheKey].data);
      setPendingTotal(pendingListCache[cacheKey].total);
      setPendingTotalPages(pendingListCache[cacheKey].totalPages);
      setPendingListLoading(false);
      return;
    }
    
    axios.get(`/api/pending/list`, {
      params: {
        page,
        pageSize: pendingPageSize,
        search: pendingDebouncedSearch
      }
    })
      .then((res) => {
        const { data, pagination } = res.data;
        setPendingList(data || []);
        setPendingTotal(pagination.total);
        setPendingTotalPages(pagination.totalPages);
        
        // Cache the result
        setPendingListCache(prev => ({
          ...prev,
          [cacheKey]: { data, total: pagination.total, totalPages: pagination.totalPages }
        }));
      })
      .catch((err) => {
        console.error('Error fetching pending list:', err);
        setPendingList([]);
        setPendingTotal(0);
        setPendingTotalPages(0);
      })
      .finally(() => setPendingListLoading(false));
  };

  // Load initial data when modal opens or page/search changes
  useEffect(() => {
    if (showPendingModal && !selectedOrder) {
      fetchPendingList(pendingPage);
    }
  }, [showPendingModal, pendingPage, pendingDebouncedSearch]);

  // Fetch order details
  const fetchOrderDetails = (salesOrder) => {
    setSelectedOrder(salesOrder);
    setOrderDetailsLoading(true);
    
    axios.get(`/api/pending/details/${salesOrder}`)
      .then((res) => {
        setOrderDetails(res.data);
      })
      .catch((err) => {
        console.error('Error fetching order details:', err);
        setOrderDetails(null);
      })
      .finally(() => setOrderDetailsLoading(false));
  };

  // Close modal
  const closeModal = () => {
    setShowPendingModal(false);
    setSelectedOrder(null);
    setOrderDetails(null);
  };

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
          <div key={index} 
            onClick={() => stat.label === 'Pending' && fetchPendingList()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: stat.label === 'Pending' ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: stat.label === 'Pending' ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => {
              if (stat.label === 'Pending') {
                e.currentTarget.style.transform = 'translateY(-4px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <p style={{ color: '#888', margin: '0 0 8px 0', fontSize: '14px' }}>
              {stat.label}
              {stat.label === 'Pending' && ' 📋'}
            </p>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#333' }}>
              {(stat.label === 'Pending' && pendingLoading) || (stat.label === 'Total Sales' && chartLoading) || (stat.label === 'Orders Today' && ordersTodayLoading) ? (
                <span style={{ fontSize: '16px', color: '#888' }}>Loading...</span>
              ) : (
                stat.value
              )}
            </h3>
            <span style={{
              color: stat.positive ? '#28a745' : '#dc3545',
              fontSize: '13px',
              fontWeight: '500',
            }}>
              {stat.label === 'Pending' ? 'Click to view details' : stat.change}
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
          {chartLoading ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              Loading chart data...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '12px' }}>
              {/* Previous 6 Months (oldest to newest: Dec 2025 -> Jul 2025) */}
              {chartData.filter(d => d.type !== 'current').reverse().map((data, index) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <HoverTooltip 
                    content={`${data.month} ${data.year}: ₱${data.sales.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  >
                    <div 
                      className="sales-bar"
                      style={{
                        width: '100%',
                        height: `${Math.max((data.sales / (Math.max(...chartData.map(d => d.sales)) || 1)) * 180, 10)}px`,
                        backgroundColor: '#00d9ff',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#00b8d9';
                        e.target.style.transform = 'scaleY(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#00d9ff';
                        e.target.style.transform = 'scaleY(1)';
                      }}
                    />
                  </HoverTooltip>
                  <span style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>{data.month} {data.year}</span>
                </div>
              ))}
              {/* Current Month Bar (January 2026) - shown last */}
              {chartData.length > 0 && chartData.find(d => d.type === 'current') && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <HoverTooltip 
                    content={`${chartData.find(d => d.type === 'current').month} ${chartData.find(d => d.type === 'current').year}: ₱${chartData.find(d => d.type === 'current').sales.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  >
                    <div 
                      className="sales-bar"
                      style={{
                        width: '100%',
                        height: `${Math.max((chartData.find(d => d.type === 'current').sales / (Math.max(...chartData.map(d => d.sales)) || 1)) * 180, 10)}px`,
                        backgroundColor: '#28a745',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#1e7e34';
                        e.target.style.transform = 'scaleY(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#28a745';
                        e.target.style.transform = 'scaleY(1)';
                      }}
                    />
                  </HoverTooltip>
                  <span style={{ marginTop: '8px', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{chartData.find(d => d.type === 'current').month} {chartData.find(d => d.type === 'current').year}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Orders Chart */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Monthly Orders</h3>
          {monthlyOrdersLoading ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
              Loading chart data...
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '12px' }}>
              {/* Previous 6 Months (oldest to newest: Dec 2025 -> Jul 2025) */}
              {monthlyOrdersData.filter(d => d.type !== 'current').reverse().map((data, index) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <HoverTooltip 
                    content={`${data.month} ${data.year}: ${data.orders} orders`}
                  >
                    <div 
                      className="orders-bar"
                      style={{
                        width: '100%',
                        height: `${Math.max((data.orders / (Math.max(...monthlyOrdersData.map(d => d.orders)) || 1)) * 180, 10)}px`,
                        backgroundColor: '#6c5ce7',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#5b4cdb';
                        e.target.style.transform = 'scaleY(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#6c5ce7';
                        e.target.style.transform = 'scaleY(1)';
                      }}
                    />
                  </HoverTooltip>
                  <span style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>{data.month} {data.year}</span>
                </div>
              ))}
              {/* Current Month Bar - shown last */}
              {monthlyOrdersData.length > 0 && monthlyOrdersData.find(d => d.type === 'current') && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  <HoverTooltip 
                    content={`${monthlyOrdersData.find(d => d.type === 'current').month} ${monthlyOrdersData.find(d => d.type === 'current').year}: ${monthlyOrdersData.find(d => d.type === 'current').orders} orders`}
                  >
                    <div 
                      className="orders-bar"
                      style={{
                        width: '100%',
                        height: `${Math.max((monthlyOrdersData.find(d => d.type === 'current').orders / (Math.max(...monthlyOrdersData.map(d => d.orders)) || 1)) * 180, 10)}px`,
                        backgroundColor: '#28a745',
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#1e7e34';
                        e.target.style.transform = 'scaleY(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#28a745';
                        e.target.style.transform = 'scaleY(1)';
                      }}
                    />
                  </HoverTooltip>
                  <span style={{ marginTop: '8px', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>{monthlyOrdersData.find(d => d.type === 'current').month} {monthlyOrdersData.find(d => d.type === 'current').year}</span>
                </div>
              )}
            </div>
          )}
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

      {/* Pending Modal */}
      {showPendingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>
                {selectedOrder ? `Sales Order Details: ${selectedOrder}` : `Pending Sales Orders - This Month (${pendingTotal})`}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!selectedOrder && (
                  <>
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={pendingSearchTerm}
                      onChange={(e) => setPendingSearchTerm(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px',
                        width: '200px',
                      }}
                    />
                    <button 
                      onClick={closeModal}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#888',
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
                {selectedOrder && (
                  <button 
                    onClick={closeModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#888',
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
            
            {/* Modal Body */}
            <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
              {selectedOrder ? (
                // Order Details View
                orderDetailsLoading ? (
                  <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>Loading order details...</p>
                ) : orderDetails ? (
                  <div>
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      style={{
                        marginBottom: '16px',
                        padding: '8px 16px',
                        backgroundColor: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      ← Back to List
                    </button>
                    
                    {/* Order Header Info */}
                    <div style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '16px', 
                      borderRadius: '8px',
                      marginBottom: '20px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                    }}>
                      <div><strong>Customer:</strong> {orderDetails.header?.Customer}</div>
                      <div><strong>Customer Name:</strong> {orderDetails.header?.CustomerName}</div>
                      <div><strong>Order Date:</strong> {orderDetails.header?.OrderDate}</div>
                      <div><strong>Req Ship Date:</strong> {orderDetails.header?.ReqShipDate}</div>
                      <div><strong>Salesperson:</strong> {orderDetails.header?.Salesperson}</div>
                      <div><strong>Warehouse:</strong> {orderDetails.header?.Warehouse}</div>
                    </div>
                    
                    {/* Line Items Table */}
                    <h3 style={{ marginBottom: '12px', color: '#333' }}>Line Items</h3>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Stock Code</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Qty</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Unit Price</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Line Value</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Value With Tax</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.lineItems.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #e9ecef' }}>
                              <td style={{ padding: '12px' }}>{item.StockCode}</td>
                              <td style={{ padding: '12px', maxWidth: '300px' }}>{item.Description}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>{item.OrderQty}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>{parseFloat(item.Price || 0).toFixed(2)}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>{parseFloat(item.LineValue || 0).toFixed(2)}</td>
                              <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>
                                {parseFloat(item.ValueWithTax || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#dc3545', textAlign: 'center' }}>No order details found</p>
                )
              ) : (
                // Pending List View
                pendingListLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ 
                      display: 'inline-block',
                      width: '40px', 
                      height: '40px',
                      border: '3px solid #f3f3f3',
                      borderTop: '3px solid #3498db',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    <p style={{ color: '#888', marginTop: '16px' }}>Loading pending orders...</p>
                  </div>
                ) : pendingList.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#28a745', padding: '40px', fontWeight: '500' }}>✅ No pending orders found!</p>
                ) : (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Sales Order</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Customer Name</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Order Date</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Salesperson</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingList.map((order, idx) => (
                            <tr 
                              key={idx} 
                              style={{ 
                                borderBottom: '1px solid #e9ecef',
                                cursor: 'pointer',
                                backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                              }}
                              onClick={() => fetchOrderDetails(order.SalesOrder)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e9ecef';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f8f9fa';
                              }}
                            >
                              <td style={{ padding: '12px', color: '#007bff', fontWeight: '500' }}>{order.SalesOrder}</td>
                              <td style={{ padding: '12px' }}>{order.Customer}</td>
                              <td style={{ padding: '12px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {order.CustomerName}
                              </td>
                              <td style={{ padding: '12px' }}>{order.OrderDate}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  backgroundColor: order.OrderStatus === '8' ? '#28a745' : '#fd7e14',
                                  color: '#fff',
                                }}>
                                  {order.OrderStatus === '8' ? 'Open' : 'Pending'}
                                </span>
                              </td>
                              <td style={{ padding: '12px' }}>{order.Salesperson}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {pendingTotalPages > 1 && (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginTop: '20px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e9ecef',
                      }}>
                        <button
                          onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                          disabled={pendingPage === 1}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: pendingPage === 1 ? '#e9ecef' : '#007bff',
                            color: pendingPage === 1 ? '#888' : '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: pendingPage === 1 ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Previous
                        </button>
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          Page {pendingPage} of {pendingTotalPages} ({pendingTotal} total)
                        </span>
                        <button
                          onClick={() => setPendingPage(p => Math.min(pendingTotalPages, p + 1))}
                          disabled={pendingPage === pendingTotalPages}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: pendingPage === pendingTotalPages ? '#e9ecef' : '#007bff',
                            color: pendingPage === pendingTotalPages ? '#888' : '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: pendingPage === pendingTotalPages ? 'not-allowed' : 'pointer',
                          }}
                        >
                          Next
                        </button>
                        <select
                          value={pendingPageSize}
                          onChange={(e) => {
                            setPendingPageSize(Number(e.target.value));
                            setPendingPage(1);
                          }}
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            marginLeft: '16px',
                          }}
                        >
                          <option value={25}>25 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={100}>100 per page</option>
                        </select>
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset loading on page refresh/navigation
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading && <TruckDeliveryLoading onComplete={() => setIsLoading(false)} />}
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
    </>
  );
}

export default App;
