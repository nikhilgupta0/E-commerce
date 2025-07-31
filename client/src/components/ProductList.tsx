import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Search, Filter, MapPin, Tag } from 'lucide-react';

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
  _count: {
    orderItems: number;
    inventoryItems: number;
  };
}

interface DistributionCenter {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  _count: {
    products: number;
    inventoryItems: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [distributionCenters, setDistributionCenters] = useState<DistributionCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: ''
  });

  // Fetch distribution centers
  useEffect(() => {
    const fetchDistributionCenters = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/distribution-centers`);
        setDistributionCenters(response.data);
      } catch (err) {
        console.error('Error fetching distribution centers:', err);
      }
    };
    fetchDistributionCenters();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          ...(filters.search && { search: filters.search }),
          ...(filters.department && { department: filters.department }),
          ...(filters.category && { category: filters.category }),
          ...(filters.brand && { brand: filters.brand }),
          ...(filters.minPrice && { minPrice: filters.minPrice }),
          ...(filters.maxPrice && { maxPrice: filters.maxPrice })
        });

        const response = await axios.get(`${API_BASE_URL}/api/products?${params}`);
        setProducts(response.data.products);
        setPagination(response.data.pagination);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [pagination.page, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      {/* Filters Section */}
      <div className="filters">
        <h2>
          <Filter size={20} />
          Advanced Filters & Search
        </h2>
        <form onSubmit={handleSearch}>
          <div className="filter-grid">
            <div className="form-group">
              <label htmlFor="search">Search Products</label>
              <input
                type="text"
                id="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name, brand, or category..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="Women">Women</option>
                <option value="Men">Men</option>
                <option value="Kids">Kids</option>
                <option value="Home">Home</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Accessories">Accessories</option>
                <option value="Clothing">Clothing</option>
                <option value="Footwear">Footwear</option>
                <option value="Electronics">Electronics</option>
                <option value="Home">Home</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="brand">Brand</label>
              <input
                type="text"
                id="brand"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                placeholder="Filter by brand..."
              />
            </div>
            <div className="form-group">
              <label htmlFor="minPrice">Min Price</label>
              <input
                type="number"
                id="minPrice"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label htmlFor="maxPrice">Max Price</label>
              <input
                type="number"
                id="maxPrice"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="1000.00"
                step="0.01"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              <Search size={16} />
              Search
            </button>
            <button type="button" onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </form>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map(product => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="product-card">
              <div className="product-image">
                📦
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Tag size={14} />
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{product.brand}</span>
                </div>
                <div className="product-meta">
                  <span className="product-price">${product.retailPrice.toFixed(2)}</span>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Cost: ${product.cost.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div className="product-department">{product.department}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    SKU: {product.sku.substring(0, 8)}...
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <MapPin size={14} />
                  <span>{product.distributionCenter.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  <span>Orders: {product._count.orderItems}</span>
                  <span>Stock: {product._count.inventoryItems}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={page === pagination.page ? 'current' : ''}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {/* Results Summary */}
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>
        Showing {products.length} of {pagination.total} products
        {filters.department && ` in ${filters.department}`}
        {filters.category && ` category: ${filters.category}`}
      </div>
    </div>
  );
};

export default ProductList; 