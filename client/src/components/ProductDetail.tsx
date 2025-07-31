import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, Tag, Package, DollarSign, TrendingUp } from 'lucide-react';

// API base URL for production
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  department: string;
  retailPrice: number;
  cost: number;
  sku: string;
  distributionCenter: {
    name: string;
    latitude: number;
    longitude: number;
  };
  orderItems: Array<{
    id: number;
    salePrice: number;
    status: string;
    order: {
      status: string;
      createdAt: string;
    };
  }>;
  inventoryItems: Array<{
    id: number;
    soldAt: string | null;
  }>;
  _count: {
    orderItems: number;
    inventoryItems: number;
  };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError('Product not found');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="error">
        {error || 'Product not found'}
        <br />
        <Link to="/" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>
    );
  }

  const availableStock = product.inventoryItems.filter(item => !item.soldAt).length;
  const profitMargin = ((product.retailPrice - product.cost) / product.cost * 100).toFixed(1);

  return (
    <div>
      <div className="back-button">
        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to Products
        </Link>
      </div>

      <div className="product-detail">
        <div className="product-detail-header">
          <div className="product-detail-image">
            📦
          </div>
          
          <div className="product-detail-info">
            <h1>{product.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Tag size={20} />
              <span style={{ fontSize: '1.125rem', color: '#6b7280' }}>{product.brand}</span>
            </div>
            
            <div className="product-detail-price">${product.retailPrice.toFixed(2)}</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <DollarSign size={20} />
              <span style={{ color: '#6b7280' }}>Cost: ${product.cost.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={20} />
              <span style={{ color: '#059669' }}>Profit Margin: {profitMargin}%</span>
            </div>
            
            <div className="product-detail-department">
              {product.department}
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <strong>Category:</strong> {product.category}
            </div>
            
            <div style={{ marginTop: '0.5rem' }}>
              <strong>SKU:</strong> {product.sku}
            </div>
            
            <div style={{ marginTop: '0.5rem' }}>
              <strong>Product ID:</strong> #{product.id}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <MapPin size={20} />
              <span><strong>Distribution Center:</strong> {product.distributionCenter.name}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Package size={20} />
              <span><strong>Available Stock:</strong> {availableStock} units</span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div style={{ marginTop: '2rem' }}>
          <h3>Product Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {product._count.orderItems}
              </div>
              <div style={{ color: '#6b7280' }}>Total Orders</div>
            </div>
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {product._count.inventoryItems}
              </div>
              <div style={{ color: '#6b7280' }}>Total Inventory Items</div>
            </div>
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {availableStock}
              </div>
              <div style={{ color: '#6b7280' }}>Available Stock</div>
            </div>
            <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {profitMargin}%
              </div>
              <div style={{ color: '#6b7280' }}>Profit Margin</div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        {product.orderItems.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Recent Orders</h3>
            <div style={{ marginTop: '1rem' }}>
              {product.orderItems.map((orderItem) => (
                <div key={orderItem.id} style={{ 
                  background: '#f9fafb', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Order #{orderItem.id}</strong>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Sale Price: ${orderItem.salePrice.toFixed(2)}
                      </div>
                    </div>
                    <div style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.875rem',
                      background: orderItem.status === 'Complete' ? '#dcfce7' : '#fef3c7',
                      color: orderItem.status === 'Complete' ? '#166534' : '#92400e'
                    }}>
                      {orderItem.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 