import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>🛍️ E-Commerce Store</h1>
          </Link>
          <nav>
            <Link to="/analytics" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
              <BarChart3 size={16} />
              Analytics
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 