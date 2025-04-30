import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import "./AdminDashboard.scss";
import apiRequest from "../lib/apiRequest";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    pendingListings: 0,
    loading: true,
    error: null
  });

  // Check admin access and show appropriate message
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user) {
      // Show popup for unauthenticated users
      toast.error(
        <div>
          <h3 style={{ margin: '0 0 10px 0' }}>Access Denied</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            You need to login to access the admin dashboard.
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
            Please login with your admin credentials to continue.
          </p>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          onClose: () => navigate("/login")
        }
      );
    } else if (!user.isAdmin) {
      // Show popup for non-admin users
      toast.error(
        <div>
          <h3 style={{ margin: '0 0 10px 0' }}>Access Denied</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            You don't have permission to access the admin dashboard.
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
            This page is restricted to admin users only. Please contact the administrator if you need access.
          </p>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          onClose: () => navigate("/")
        }
      );
    } else {
      // Show welcome message for admin
      toast.success(
        <div>
          <h3 style={{ margin: '0 0 10px 0' }}>Welcome to Admin Dashboard!</h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            You can manage users, listings, and view important statistics here.
          </p>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  }, [navigate]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Fetch live stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const listingsRes = await apiRequest.get("/admin/stats/listing");
        const userCount = await apiRequest.get("/admin/users/count");
        setStats({
          totalUsers: userCount.data.count,
          activeListings: listingsRes.data.listingCount || 0,
          pendingListings: listingsRes.data.unapprovedCount || 0,
          loading: false,
          error: null
        });
      } catch (err) {
        setStats(prev => ({
          ...prev,
          loading: false,
          error: "Failed to load statistics"
        }));
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const statsInterval = setInterval(fetchStats, 30000);
    return () => clearInterval(statsInterval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Data for listing pie chart
  const listingData = [
    { name: 'Active Listings', value: stats.activeListings },
    { name: 'Pending Listings', value: stats.pendingListings },
  ];

  const LISTING_COLORS = ['#3182ce', '#d69e2e'];
  const SHADOW_COLORS = ['#3182ce80', '#d69e2e80'];
  
  // Define gradient IDs for pie chart
  const GRADIENTS = ['blueGradient', 'yellowGradient'];

  // Custom label for pie chart slices
  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent, 
    name 
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={16}
        fontWeight="bold"
        style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Custom legend formatter
  const renderColorfulLegendText = (value, entry) => {
    const { color } = entry;
    return <span style={{ color, fontWeight: 600, fontSize: '0.95rem' }}>{value}</span>;
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>
            <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }}>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Admin Dashboard
          </h2>
          <div className="admin-badge">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
            Admin
          </div>
        </div>
        
        <div className="dashboard-content">
          {/* Left Side - Navigation and Stats */}
          <div className="dashboard-left">
            <p className="welcome-message">
              <span style={{ display: 'block', marginBottom: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {formatDate(currentTime)}
              </span>
              Welcome back! Manage users and listings efficiently.
            </p>
            
            <div className="dashboard-stats">
              <div className="stat-item">
                <span className="stat-value">
                  {stats.loading ? '' : stats.totalUsers.toLocaleString()}
                </span>
                <span className="stat-label">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  Total Users
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {stats.loading ? '' : (stats.activeListings + stats.pendingListings).toLocaleString()}
                </span>
                <span className="stat-label">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  Total Listings
                </span>
              </div>
            </div>
            
            <div className="dashboard-links">
              <Link to="/admin/users" className="dashboard-link">
                <span className="link-icon users-icon">
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </span>
                <div>
                  <span style={{ display: 'block', marginBottom: '4px' }}>Manage Users</span>
                  <small style={{ color: '#718096', fontSize: '0.85rem' }}>View, edit and manage user accounts</small>
                </div>
              </Link>
              <Link to="/admin/listings" className="dashboard-link">
                <span className="link-icon listings-icon">
                  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <div>
                  <span style={{ display: 'block', marginBottom: '4px' }}>Manage Listings</span>
                  <small style={{ color: '#718096', fontSize: '0.85rem' }}>Approve, edit and manage property listings</small>
                </div>
              </Link>
            </div>
            
            <div className="dashboard-footer">
              <p className="login-time">Current time: <span className="live-time">{formatTime(currentTime)}</span></p>
              {stats.error && 
                <p className="stats-error">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {stats.error}
                </p>
              }
            </div>
          </div>
          
          {/* Right Side - Enhanced Listing Pie Chart */}
          <div className="dashboard-right">
            <div className="charts-container">
              <h3>
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Listing Statistics
              </h3>
              
              {stats.loading ? (
                <div className="chart-loading">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', animation: 'spin 1s linear infinite' }}>
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  Loading chart data...
                </div>
              ) : (
                <div className="pie-chart-container enhanced-chart">
                  <h4>Listing Distribution</h4>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <defs>
                        <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4299e1" />
                          <stop offset="100%" stopColor="#2b6cb0" />
                        </linearGradient>
                        <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ecc94b" />
                          <stop offset="100%" stopColor="#d69e2e" />
                        </linearGradient>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#4a5568" floodOpacity="0.3" />
                        </filter>
                      </defs>
                      <Pie
                        data={listingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={130}
                        innerRadius={70}
                        paddingAngle={8}
                        cornerRadius={8}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1800}
                        animationEasing="ease-out"
                        filter="url(#shadow)"
                      >
                        {listingData.map((entry, index) => (
                          <Cell 
                            key={`listing-cell-${index}`} 
                            fill={`url(#${GRADIENTS[index % GRADIENTS.length]})`}
                            stroke="#fff"
                            strokeWidth={4}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} listings`, '']}
                        contentStyle={{
                          background: 'rgba(255, 255, 255, 0.98)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                          padding: '14px',
                          fontSize: '14px'
                        }}
                        itemStyle={{ color: '#2d3748', fontWeight: 600 }}
                        labelStyle={{ color: '#718096', fontWeight: 600, marginBottom: '4px' }}
                      />
                      <Legend 
                        formatter={renderColorfulLegendText}
                        layout="horizontal" 
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={14}
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="chart-summary enhanced-summary">
                    {listingData.map((entry, index) => (
                      <div className="summary-item" key={`listing-summary-${index}`}>
                        <span 
                          className="summary-dot" 
                          style={{ 
                            background: `linear-gradient(135deg, ${LISTING_COLORS[index]}, ${index === 0 ? '#2b6cb0' : '#d69e2e'})`,
                            boxShadow: `0 0 12px ${SHADOW_COLORS[index % SHADOW_COLORS.length]}`
                          }}
                        ></span>
                        <span className="summary-label">{entry.name}:</span>
                        <span className="summary-value highlight">
                          {entry.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* You could add more analytics widgets here */}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}