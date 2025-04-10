import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import "./AdminDashboard.scss";
import apiRequest from "../lib/apiRequest";

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    pendingListings: 0,
    loading: true,
    error: null
  });

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

  // Data for listing pie chart
  const listingData = [
    { name: 'Active Listings', value: stats.activeListings },
    { name: 'Pending Listings', value: stats.pendingListings },
  ];

  const LISTING_COLORS = ['#2196F3', '#FFC107'];
  const SHADOW_COLORS = ['#2196F380', '#FFC10780'];

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

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend formatter
  const renderColorfulLegendText = (value, entry) => {
    const { color } = entry;
    return <span style={{ color }}>{value}</span>;
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <div className="admin-badge">Admin</div>
        </div>
        
        <div className="dashboard-content">
          {/* Left Side - Navigation and Stats */}
          <div className="dashboard-left">
            <p className="welcome-message">Welcome back! Manage users and listings efficiently.</p>
            
            <div className="dashboard-stats">
              <div className="stat-item">
                <span className="stat-value">
                  {stats.loading ? '--' : stats.totalUsers.toLocaleString()}
                </span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {stats.loading ? '--' : (stats.activeListings + stats.pendingListings).toLocaleString()}
                </span>
                <span className="stat-label">Total Listings</span>
              </div>
            </div>
            
            <div className="dashboard-links">
              <Link to="/admin/users" className="dashboard-link">
                <span className="link-icon users-icon">👥</span>
                <span>Manage Users</span>
              </Link>
              <Link to="/admin/listings" className="dashboard-link">
                <span className="link-icon listings-icon">📋</span>
                <span>Manage Listings</span>
              </Link>
            </div>
            
            <div className="dashboard-footer">
              <p className="login-time">Current time: <span className="live-time">{formatTime(currentTime)}</span></p>
              {stats.error && <p className="stats-error">{stats.error}</p>}
            </div>
          </div>
          
          {/* Right Side - Enhanced Listing Pie Chart Only */}
          <div className="dashboard-right">
            <div className="charts-container">
              <h3>Listing Statistics</h3>
              
              {stats.loading ? (
                <div className="chart-loading">Loading chart data...</div>
              ) : (
                <div className="pie-chart-container enhanced-chart">
                  <h4>Listing Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={listingData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={2}
                        cornerRadius={5}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {listingData.map((entry, index) => (
                          <Cell 
                            key={`listing-cell-${index}`} 
                            fill={LISTING_COLORS[index % LISTING_COLORS.length]}
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} listings`, '']}
                        contentStyle={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                          padding: '10px'
                        }}
                      />
                      <Legend 
                        formatter={renderColorfulLegendText}
                        layout="horizontal" 
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={10}
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
                            backgroundColor: LISTING_COLORS[index % LISTING_COLORS.length],
                            boxShadow: `0 0 8px ${SHADOW_COLORS[index % SHADOW_COLORS.length]}`
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}