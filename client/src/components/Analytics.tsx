import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Package, DollarSign, BarChart3, MapPin } from 'lucide-react';

// API base URL for production
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

interface Analytics {
  summary: {
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
  };
  ordersByStatus: Array<{
    status: string;
    _count: {
      status: number;
    };
  }>;
  topProducts: Array<{
    productId: number;
    _count: {
      productId: number;
    };
    _sum: {
      salePrice: number;
    };
  }>;
  topCategories: Array<{
    category: string;
    _count: {
      category: number;
    };
  }>;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/analytics`);
        setAnalytics(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch analytics');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (error || !analytics) {
    return <div className="error">{error || 'Analytics not available'}</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>📊 Business Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: '8px' }}>
              <Package size={24} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                {analytics.summary.totalProducts.toLocaleString()}
              </div>
              <div style={{ color: '#6b7280' }}>Total Products</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#dbeafe', padding: '0.75rem', borderRadius: '8px' }}>
              <Users size={24} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                {analytics.summary.totalUsers.toLocaleString()}
              </div>
              <div style={{ color: '#6b7280' }}>Total Users</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '8px' }}>
              <BarChart3 size={24} color="#d97706" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d97706' }}>
                {analytics.summary.totalOrders.toLocaleString()}
              </div>
              <div style={{ color: '#6b7280' }}>Total Orders</div>
            </div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#fce7f3', padding: '0.75rem', borderRadius: '8px' }}>
              <DollarSign size={24} color="#be185d" />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#be185d' }}>
                ${analytics.summary.totalRevenue.toLocaleString()}
              </div>
              <div style={{ color: '#6b7280' }}>Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Orders by Status */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} />
            Orders by Status
          </h3>
          <div>
            {analytics.ordersByStatus.map((status) => (
              <div key={status.status} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                marginBottom: '0.5rem',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <span style={{ fontWeight: '500' }}>{status.status}</span>
                <span style={{ 
                  background: '#059669', 
                  color: 'white', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px',
                  fontSize: '0.875rem'
                }}>
                  {status._count.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Categories */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} />
            Top Product Categories
          </h3>
          <div>
            {analytics.topCategories.slice(0, 10).map((category) => (
              <div key={category.category} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                marginBottom: '0.5rem',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <span style={{ fontWeight: '500' }}>{category.category}</span>
                <span style={{ 
                  background: '#2563eb', 
                  color: 'white', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px',
                  fontSize: '0.875rem'
                }}>
                  {category._count.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Package size={20} />
          Top Products by Orders
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {analytics.topProducts.slice(0, 6).map((product) => (
            <div key={product.productId} style={{ 
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong>Product #{product.productId}</strong>
                <span style={{ 
                  background: '#059669', 
                  color: 'white', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '20px',
                  fontSize: '0.875rem'
                }}>
                  {product._count.productId} orders
                </span>
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Revenue: ${(product._sum.salePrice || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
        <h3 style={{ marginBottom: '1rem' }}>🔍 Key Insights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
            <strong>Average Order Value:</strong>
            <div style={{ fontSize: '1.25rem', color: '#0369a1', marginTop: '0.5rem' }}>
              ${(analytics.summary.totalRevenue / analytics.summary.totalOrders).toFixed(2)}
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <strong>Conversion Rate:</strong>
            <div style={{ fontSize: '1.25rem', color: '#166534', marginTop: '0.5rem' }}>
              {((analytics.summary.totalOrders / analytics.summary.totalUsers) * 100).toFixed(1)}%
            </div>
          </div>
          <div style={{ padding: '1rem', background: '#fef7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
            <strong>Products per Order:</strong>
            <div style={{ fontSize: '1.25rem', color: '#c2410c', marginTop: '0.5rem' }}>
              {(analytics.summary.totalProducts / analytics.summary.totalOrders).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 